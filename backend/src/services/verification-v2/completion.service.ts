import type { VerificationTransaction } from "./jobQueue.service.js";
import { lockTask } from "./captureSession.service.js";
import {
  aggregateItems,
  completionEligibility,
} from "./verificationPolicy.service.js";
import type { RequirementState } from "@prisma/client";
import { writeAuditLog } from "../auditLog.service.js";
export function itemState(
  requirements: { mandatory: boolean; state: string }[],
): RequirementState {
  const required = requirements.filter((r) => r.mandatory),
    states = required.length ? required : requirements;
  for (const state of [
    "REVIEW_REQUIRED",
    "CLEANING_REQUIRED",
    "RECAPTURE_REQUIRED",
    "PROCESSING",
    "MISSING",
  ] as const)
    if (states.some((r) => r.state === state)) return state;
  if (!states.length) return "MISSING";
  if (states.some((r) => r.state === "WAIVED")) return "WAIVED";
  if (states.some((r) => r.state === "MANAGER_ACCEPTED"))
    return "MANAGER_ACCEPTED";
  return "PASSED";
}
export async function finalizeTask(
  tx: VerificationTransaction,
  taskId: number,
) {
  await lockTask(tx, taskId);
  const task = await tx.taskInstance.findUniqueOrThrow({
    where: { id: taskId },
    include: {
      location: true,
      assignments: { where: { isCurrent: true } },
      verificationItems: { include: { requirements: true } },
    },
  });
  if (task.status === "COMPLETED") return task.completionOutcome;
  if (
    !task.isActive ||
    !["IN_PROGRESS", "NOT_COMPLETED_INTIME"].includes(task.status) ||
    task.verificationVersion !== 2 ||
    !task.staffId
  )
    return null;
  const staff = await tx.staff.findFirst({
    where: {
      id: task.staffId,
      isActive: true,
      locationId: task.locationId,
      companyId: task.location.companyId,
      company: { isActive: true },
    },
  });
  if (!staff || !task.location.isActive) return null;
  const assignment = task.assignments.find(
    (a) =>
      a.staffId === task.staffId && ["STARTED", "ASSIGNED"].includes(a.status),
  );
  if (!assignment) return null;
  for (const item of task.verificationItems) {
    const state = itemState(item.requirements);
    if (item.state !== state)
      await tx.taskVerificationItem.update({
        where: { id: item.id },
        data: { state, decisionVersion: { increment: 1 } },
      });
  }
  const aggregate = aggregateItems(task.verificationItems);
  if (!aggregate.valid) return null;
  const required = task.verificationItems
    .filter((i) => i.mandatory)
    .flatMap((i) => i.requirements.filter((r) => r.mandatory));
  const passed = required.filter(
    (r) => r.state === "PASSED" || r.state === "MANAGER_ACCEPTED",
  );
  const attempts = await tx.verificationAttempt.findMany({
    where: {
      id: {
        in: passed
          .map((r) => r.currentAttemptId)
          .filter((id): id is string => !!id),
      },
    },
    include: { session: true, media: true },
  });
  if (
    attempts.some(
      (a) =>
        passed.some(
          (r) => r.currentAttemptId === a.id && r.state === "PASSED",
        ) &&
        (a.state !== "PASSED" ||
          a.timingEvidence === "UNCERTAIN" ||
          !a.receivedAt ||
          a.receivedAt > a.session.uploadExpiresAt ||
          a.claimedCapturedAt > a.session.captureExpiresAt),
    )
  )
    return null;
  if (
    passed.length !== attempts.length ||
    attempts.some(
      (a) =>
        a.media?.privacyState !== "SAFE" ||
        !a.receivedAt ||
        a.session.taskInstanceId !== taskId ||
        !passed.some(
          (r) => r.id === a.requirementId && r.currentAttemptId === a.id,
        ),
    )
  )
    return null;
  // A waiver/evidence acceptance never grants a presence override. Bind explicit context decisions to each contributing session.
  const overrides = await tx.verificationDecision.findMany({
    where: { exception: { taskInstanceId: taskId }, action: "ACCEPT_CONTEXT" },
    select: { evidenceAttemptId: true },
  });
  const contexts = await tx.verificationAttempt.findMany({
    where: {
      id: {
        in: overrides
          .map((d) => d.evidenceAttemptId)
          .filter((id): id is string => !!id),
      },
      contextKey: { not: null },
      media: { privacyState: "SAFE" },
    },
    select: { sessionId: true },
  });
  const contextOverrides = new Set(contexts.map((a) => a.sessionId));
  const acceptances = await tx.verificationDecision.findMany({
    where: { exception: { taskInstanceId: taskId }, action: "ACCEPT_EVIDENCE" },
    select: { evidenceAttemptId: true, createdAt: true },
  });
  if (
    attempts.some((a) => {
      const manual = passed.some(
        (r) => r.currentAttemptId === a.id && r.state === "MANAGER_ACCEPTED",
      );
      const acceptedBeforeRevocation =
        !!a.session.closedAt &&
        acceptances.some(
          (d) =>
            d.evidenceAttemptId === a.id && d.createdAt <= a.session.closedAt!,
        );
      const staleManual =
        manual &&
        !acceptedBeforeRevocation &&
        (a.assignmentEpoch !== task.assignmentEpoch ||
          a.session.state === "REVOKED");
      return (
        (a.session.presenceStatus !== "ACCEPTABLE" ||
          a.session.contextStatus !== "ACCEPTABLE" ||
          staleManual) &&
        !contextOverrides.has(a.sessionId)
      );
    })
  )
    return null;
  if (
    required.every((r) =>
      ["PASSED", "MANAGER_ACCEPTED", "WAIVED"].includes(r.state),
    )
  )
    await tx.verificationIssue.updateMany({
      where: {
        exception: { taskInstanceId: taskId },
        requirementId: null,
        reasonCode: "MISSING_EVIDENCE",
        state: { not: "RESOLVED" },
      },
      data: { state: "RESOLVED", resolvedAt: new Date() },
    });
  const blocking = await tx.verificationIssue.count({
    where: {
      exception: { taskInstanceId: taskId },
      state: { not: "RESOLVED" },
      OR: [
        { requirementId: null },
        { requirementId: { in: required.map((r) => r.id) } },
        {
          reasonCode: {
            in: [
              "PRIVACY_HOLD",
              "DUPLICATE_EVIDENCE",
              "STALE_ASSIGNMENT",
              "SERVICE_FAILURE",
            ],
          },
        },
      ],
    },
  });
  const outcome = completionEligibility({
    requirements: aggregate.requirements,
    presenceAcceptable: attempts.every(
      (a) => a.session.presenceStatus === "ACCEPTABLE",
    ),
    contextAcceptable: attempts.every(
      (a) => a.session.contextStatus === "ACCEPTABLE",
    ),
    blockingIssues:
      blocking > 0 || attempts.some((a) => a.media?.privacyState !== "SAFE"),
    hasManualOverride: task.hasManualOverride,
    assignmentCurrent: true,
  });
  if (!outcome) return null;
  const currentIds = task.verificationItems
    .flatMap((i) => i.requirements)
    .map((r) => r.currentAttemptId)
    .filter((id): id is string => !!id);
  if (
    await tx.verificationAttempt.count({
      where: { id: { in: currentIds }, media: { privacyState: "HOLD" } },
    })
  )
    return null;
  const contributingIds = attempts.map((a) => a.id);
  const optionalIds = task.verificationItems
    .flatMap((i) =>
      i.requirements.filter(
        (r) => !i.mandatory || !r.mandatory || r.state === "WAIVED",
      ),
    )
    .map((r) => r.currentAttemptId)
    .filter((id): id is string => !!id);
  if (
    await tx.verificationJob.count({
      where: {
        OR: [
          { attemptId: { in: contributingIds } },
          {
            attemptId: { in: optionalIds },
            stage: { in: ["QUALITY", "PRIVACY", "COVERAGE"] },
          },
          {
            attempt: {
              contextKey: { not: null },
              sessionId: { in: attempts.map((a) => a.sessionId) },
            },
          },
        ],
        state: { in: ["PENDING", "RUNNING", "RETRY_WAIT"] },
      },
    })
  )
    return null;
  const now = new Date(),
    evidenceReadyAt = required.some((r) => r.state === "WAIVED")
      ? now
      : attempts.length
        ? new Date(Math.max(...attempts.map((a) => +a.claimedCapturedAt)))
        : now;
  const timing = required.some((r) => r.state === "WAIVED")
    ? "UNCERTAIN"
    : attempts.some((a) => a.timingEvidence === "UNCERTAIN")
      ? "UNCERTAIN"
      : evidenceReadyAt > task.shiftEnd
        ? "LATE"
        : attempts.some((a) => a.timingEvidence === "ON_TIME_DEVICE_REPORTED")
          ? "ON_TIME_DEVICE_REPORTED"
          : "ON_TIME_SERVER_OBSERVED";
  await tx.taskInstance.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",
      completedAt: now,
      verificationResolvedAt: now,
      evidenceReadyAt,
      completionTiming: timing,
      completionLateMinutes:
        timing === "LATE"
          ? Math.ceil((+evidenceReadyAt - +task.shiftEnd) / 60000)
          : 0,
      completionOutcome: outcome,
      verificationState:
        outcome === "VERIFIED_COMPLETE"
          ? "VERIFIED"
          : "RESOLVED_WITH_EXCEPTIONS",
      rowVersion: { increment: 1 },
    },
  });
  await tx.taskAssignment.update({
    where: { id: assignment.id },
    data: { status: "COMPLETED", completedAt: now, isCurrent: false },
  });
  await tx.captureSession.updateMany({
    where: { taskInstanceId: taskId, state: { in: ["ACTIVE", "PAUSED"] } },
    data: { state: "CLOSED", closedAt: now, rowVersion: { increment: 1 } },
  });
  const c = await tx.verificationException.findUnique({
    where: { taskInstanceId: taskId },
  });
  if (c) {
    await tx.verificationException.update({
      where: { id: c.id },
      data: {
        state: "RESOLVED",
        resolvedAt: now,
        nextReminderAt: null,
        rowVersion: { increment: 1 },
      },
    });
    await tx.exceptionEvent.upsert({
      where: { dedupeKey: `completed:${taskId}` },
      create: {
        exceptionId: c.id,
        type: "COMPLETED",
        dedupeKey: `completed:${taskId}`,
        payload: { outcome },
      },
      update: {},
    });
  }
  await writeAuditLog(
    {
      companyId: task.location.companyId,
      actorType: "SYSTEM",
      entityType: "TASK_INSTANCE",
      entityId: taskId,
      action: "VERIFICATION_COMPLETED",
      newValue: { outcome, assignmentEpoch: task.assignmentEpoch },
    },
    tx,
  );
  return outcome;
}
