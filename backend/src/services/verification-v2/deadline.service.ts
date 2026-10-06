import { prisma } from "../../prisma/prisma.js";
import { lockTask } from "./captureSession.service.js";
import { finalizeTask } from "./completion.service.js";
import { raiseIssue } from "./exception.service.js";
export async function expireVerificationTasks(now = new Date()) {
  const tasks = await prisma.taskInstance.findMany({
    where: {
      verificationVersion: 2,
      isActive: true,
      status: { in: ["PENDING", "IN_PROGRESS", "NOT_COMPLETED_INTIME"] },
      shiftEnd: { lt: now },
    },
    select: { id: true },
  });
  for (const candidate of tasks)
    await prisma.$transaction(async (tx) => {
      await lockTask(tx, candidate.id);
      const task = await tx.taskInstance.findUniqueOrThrow({
        where: { id: candidate.id },
      });
      if (
        task.status === "COMPLETED" ||
        !task.isActive ||
        !["PENDING", "IN_PROGRESS", "NOT_COMPLETED_INTIME"].includes(
          task.status,
        )
      )
        return;
      if (await finalizeTask(tx, task.id)) return;
      if (!task.startedAt || task.startedAt > task.shiftEnd) {
        await tx.taskInstance.update({
          where: { id: task.id },
          data: { status: "MISSED", verificationState: "NEEDS_REVIEW" },
        });
        await tx.taskAssignment.updateMany({
          where: { taskInstanceId: task.id, isCurrent: true },
          data: { status: "MISSED", isCurrent: false, failedAt: now },
        });
        await raiseIssue(tx, task.id, "MISSING_EVIDENCE");
        return;
      }
      const requirements = await tx.taskEvidenceRequirement.findMany({
        where: {
          item: { taskInstanceId: task.id, mandatory: true },
          mandatory: true,
        },
      });
      const received = await tx.verificationAttempt.findMany({
        where: {
          id: {
            in: requirements
              .map((r) => r.currentAttemptId)
              .filter((id): id is string => !!id),
          },
          receivedAt: { not: null },
        },
        include: { session: true },
      });
      const receivedIds = new Set(received.map((a) => a.id));
      let missing = requirements.filter(
        (r) =>
          [
            "MISSING",
            "RECAPTURE_REQUIRED",
            "CLEANING_REQUIRED",
            "REVIEW_REQUIRED",
          ].includes(r.state) ||
          (r.state === "PROCESSING" &&
            (!r.currentAttemptId || !receivedIds.has(r.currentAttemptId))),
      ).length;
      // Only sessions contributing current fixture evidence need context. Accepted old-worker
      // sessions remain valid after handover; absence of a new session does not erase them.
      const sessionIds = [
        ...new Set(
          received
            .filter((a) =>
              requirements.some(
                (r) => r.currentAttemptId === a.id && r.state !== "WAIVED",
              ),
            )
            .filter((a) => a.session.contextStatus !== "ACCEPTABLE")
            .map((a) => a.sessionId),
        ),
      ];
      if (sessionIds.length) {
        const contextSlots = await tx.captureSlot.findMany({
          where: {
            sessionId: { in: sessionIds },
            contextKey: { in: ["ENTRANCE", "LAYOUT"] },
          },
          orderBy: [{ generation: "desc" }, { id: "desc" }],
          select: {
            sessionId: true,
            contextKey: true,
            generation: true,
            attempt: { select: { receivedAt: true } },
          },
        });
        const latestContexts = new Map<string, (typeof contextSlots)[number]>();
        for (const slot of contextSlots) {
          const key = `${slot.sessionId}:${slot.contextKey}`;
          if (!latestContexts.has(key)) latestContexts.set(key, slot);
        }
        const overrides = await tx.verificationDecision.findMany({
          where: {
            exception: { taskInstanceId: task.id },
            action: "ACCEPT_CONTEXT",
          },
          select: { evidenceAttemptId: true },
        });
        const safeOverrides = await tx.verificationAttempt.findMany({
          where: {
            id: {
              in: overrides
                .map((d) => d.evidenceAttemptId)
                .filter((id): id is string => !!id),
            },
            sessionId: { in: sessionIds },
            contextKey: { not: null },
            media: { privacyState: "SAFE" },
          },
          select: { sessionId: true },
        });
        missing += sessionIds.filter(
          (id) =>
            !safeOverrides.some((a) => a.sessionId === id) &&
            !["ENTRANCE", "LAYOUT"].every(
              (key) =>
                !!latestContexts.get(`${id}:${key}`)?.attempt?.receivedAt,
            ),
        ).length;
      }
      if (
        await tx.captureSession.count({
          where: { taskInstanceId: task.id, state: "PAUSED" },
        })
      )
        await raiseIssue(tx, task.id, "OCCUPIED");
      if (missing) await raiseIssue(tx, task.id, "MISSING_EVIDENCE");
      if (task.uploadDeadline && now > task.uploadDeadline) {
        await tx.taskInstance.update({
          where: { id: task.id },
          data: {
            status: "NOT_COMPLETED_INTIME",
            verificationState: missing ? "NEEDS_REVIEW" : "PROCESSING",
          },
        });
        if (missing) {
          const c = await raiseIssue(tx, task.id, "MISSING_EVIDENCE");
          if (c) {
            const escalated = await tx.verificationException.updateMany({
              where: { id: c.id, priority: { lt: 3 } },
              data: { priority: 3, rowVersion: { increment: 1 } },
            });
            if (escalated.count)
              await tx.exceptionEvent.upsert({
                where: {
                  dedupeKey: `cutoff:${task.id}:${task.uploadDeadline.toISOString()}`,
                },
                create: {
                  exceptionId: c.id,
                  type: "UPLOAD_WINDOW_EXHAUSTED",
                  dedupeKey: `cutoff:${task.id}:${task.uploadDeadline.toISOString()}`,
                  payload: { missing },
                },
                update: {},
              });
          }
        }
        /* Accepted jobs remain eligible; assignment stays current for finalization. */
      }
      await tx.captureSession.updateMany({
        where: {
          taskInstanceId: task.id,
          state: { in: ["ACTIVE", "PAUSED"] },
          captureExpiresAt: { lte: now },
        },
        data: { state: "EXPIRED", closedAt: now, rowVersion: { increment: 1 } },
      });
    });
  const reminders = await prisma.verificationException.findMany({
    where: { state: { not: "RESOLVED" }, nextReminderAt: { lte: now } },
    take: 100,
  });
  for (const c of reminders)
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "VerificationException" WHERE id=${c.id} FOR UPDATE`;
      const fresh = await tx.verificationException.findUniqueOrThrow({
        where: { id: c.id },
      });
      if (
        fresh.state === "RESOLVED" ||
        !fresh.nextReminderAt ||
        fresh.nextReminderAt > now
      )
        return;
      await tx.exceptionEvent.upsert({
        where: {
          dedupeKey: `reminder:${c.id}:${fresh.nextReminderAt.toISOString()}`,
        },
        create: {
          exceptionId: c.id,
          type: "REMINDER",
          dedupeKey: `reminder:${c.id}:${fresh.nextReminderAt.toISOString()}`,
          payload: {},
        },
        update: {},
      });
      await tx.verificationException.update({
        where: { id: c.id },
        data: {
          priority: Math.min(5, fresh.priority + 1),
          nextReminderAt: new Date(+now + 1800000),
          rowVersion: { increment: 1 },
        },
      });
    });
}
