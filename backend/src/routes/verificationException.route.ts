import { sha256 } from '../services/verification-v2/quality.service.js';
import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  requireActiveActor,
  requireOperationalRole,
  requireTaskAccess,
} from "../services/verification-v2/authorization.service.js";
import {
  caseAccess,
  managerDecision,
  raiseIssue,
} from "../services/verification-v2/exception.service.js";
import {
  resolvePolicy,
  reasonInstructions,
} from "../services/verification-v2/verificationPolicy.service.js";
import { lockTask } from "../services/verification-v2/captureSession.service.js";
import { writeAuditLog } from "../services/auditLog.service.js";
import { ApiError } from "../utils/ApiError.js";
const router = Router();
router.use([
  /^\/verification-exceptions(?=\/|$)/,
  /^\/task-instance\/[^/]+\/verification-issues(?=\/|$)/,
], verifyJwt);
const idSchema = z.coerce.number().int().positive();
const cursorSchema = idSchema.optional();
const issueSchema = z
  .object({
    reasonCode: z.enum([
      "OCCUPIED",
      "INACCESSIBLE",
      "DAMAGED",
      "IDENTITY_UNCERTAIN",
      "GPS_UNCERTAIN",
      "SERVICE_FAILURE",
    ]),
    requestId:z.uuid().optional(),
    note: z.string().trim().max(1000).optional(),
    requestHelp: z.boolean().default(false),
    requirementId: z.uuid().optional(),
  })
  .strict();
router.post("/task-instance/:taskId/verification-issues", async (req, res) => {
  const body = issueSchema.parse(req.body),
    taskId = idSchema.parse(req.params.taskId);
  await requireTaskAccess(req.user!, taskId, { staffMutation: true });
  const c = await prisma.$transaction(async (tx) => {
    await lockTask(tx, taskId);
    const task = await requireTaskAccess(
      req.user!,
      taskId,
      { staffMutation: true },
      tx,
    );
    const key=body.requestId?{companyId:req.user!.companyId,actorRole:req.user!.role,actorId:req.user!.id,operation:`report-issue:${taskId}`,requestId:body.requestId}:null;
    const bodyHash=sha256(JSON.stringify(body));
    if(key){const prior=await tx.verificationRequest.findUnique({where:{companyId_actorRole_actorId_operation_requestId:key}});if(prior){if(prior.bodyHash!==bodyHash)throw new ApiError(409,'Report ID was used for different data');return tx.verificationException.findUnique({where:{taskInstanceId:taskId}});}}
    if (
      task.verificationVersion !== 2 ||
      !["IN_PROGRESS", "NOT_COMPLETED_INTIME"].includes(task.status)
    )
      throw new ApiError(409, "Task is not accepting verification issues");
    if (
      body.requirementId &&
      !(await tx.taskEvidenceRequirement.findFirst({
        where: { id: body.requirementId, item: { taskInstanceId: task.id } },
      }))
    )
      throw new ApiError(404, "Requirement not found");
    if (body.reasonCode === "OCCUPIED")
      await tx.captureSession.updateMany({
        where: { taskInstanceId: task.id, state: "ACTIVE" },
        data: { state: "PAUSED", rowVersion: { increment: 1 } },
      });
    await writeAuditLog(
      {
        companyId: req.user!.companyId,
        actorType: "STAFF",
        actorId: req.user!.id,
        entityType: "TASK_INSTANCE",
        entityId: task.id,
        action: "VERIFICATION_ISSUE_REPORTED",
        reason: body.reasonCode,
        newValue: {
          requirementId: body.requirementId ?? null,
          note: body.note ?? null,
          requestHelp: body.requestHelp,
        },
      },
      tx,
    );
    if(key)await tx.verificationRequest.create({data:{...key,bodyHash,resultEntityId:String(taskId)}});
    if (
      body.reasonCode === "OCCUPIED" &&
      !body.requestHelp &&
      new Date() < task.shiftEnd
    )
      return null;
    return raiseIssue(tx, task.id, body.reasonCode, body.requirementId ?? null);
  });
  res.json({ success: true, data: c });
});
router.get("/verification-exceptions", async (req, res) => {
  const actor = req.user!;
  requireOperationalRole(actor);
  await requireActiveActor(actor);
  const q = z
    .object({
      cursor: cursorSchema,
      locationId: cursorSchema,
      areaId: cursorSchema,
      workerId: cursorSchema,
      reasonCode: z.string().max(80).optional(),
      priority: z.coerce.number().int().min(0).max(5).optional(),
      state: z
        .enum([
          "OPEN",
          "STAFF_ACTION_REQUIRED",
          "MANAGER_REVIEW",
          "WAITING_SERVICE",
          "RESOLVED",
        ])
        .optional(),
    })
    .parse(req.query);
  const locations = await prisma.location.findMany({
    where: {
      companyId: actor.companyId,
      ...(actor.role === "MANAGER"
        ? { managerAssignments: { some: { managerId: actor.id } } }
        : {}),
    },
    select: { id: true, name: true, timezone: true },
  });
  const scope: Prisma.VerificationExceptionWhereInput = {
    companyId: actor.companyId,
    locationId: { in: locations.map((l) => l.id) },
  };
  const where: Prisma.VerificationExceptionWhereInput = {
    AND: [
      scope,
      {
        ...(q.locationId ? { locationId: q.locationId } : {}),
        ...(q.areaId ? { areaId: q.areaId } : {}),
        ...(q.workerId ? { task: { staffId: q.workerId } } : {}),
        ...(q.reasonCode
          ? { issues: { some: { reasonCode: q.reasonCode } } }
          : {}),
        ...(q.priority !== undefined ? { priority: q.priority } : {}),
        ...(q.state ? { state: q.state } : {}),
      },
    ],
  };
  const [cases, total, actionable] = await Promise.all([
    prisma.verificationException.findMany({
      where,
      include: {
        issues: true,
        area: { select: { id: true, name: true } },
        task: {
          select: {
            id: true,
            title: true,
            areaNameSnapshot: true,
            shiftEnd: true,
            staff: { select: { id: true, name: true } },
          },
        },
        readReceipts: { where: { managerId: actor.id } },
        events: { take: 1, orderBy: { id: "desc" }, select: { id: true } },
      },
      take: 51,
      orderBy: { id: "asc" },
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
    }),
    prisma.verificationException.count({ where }),
    prisma.verificationException.findMany({
      where: { AND: [scope, { state: { in: ["OPEN", "MANAGER_REVIEW"] } }] },
      select: {
        readReceipts: {
          where: { managerId: actor.id },
          select: { lastReadEventId: true },
        },
        events: { take: 1, orderBy: { id: "desc" }, select: { id: true } },
      },
    }),
  ]);
  const unread = (c: {
    readReceipts: { lastReadEventId: number | null }[];
    events: { id: number }[];
  }) => (c.events[0]?.id ?? 0) > (c.readReceipts[0]?.lastReadEventId ?? 0);
  res.json({
    success: true,
    data: {
      cases: cases.slice(0, 50).map(({ readReceipts, events, ...c }) => ({
        ...c,
        unread: unread({ readReceipts, events }),
        location: locations.find((l) => l.id === c.locationId),
      })),
      nextCursor: cases.length > 50 ? String(cases[49]!.id) : null,
      total,
      unreadCount: actionable.filter(unread).length,
    },
  });
});
router.get("/verification-exceptions/:id", async (req, res) => {
  const c = await caseAccess(req.user!, idSchema.parse(req.params.id));
  const eventCursor = cursorSchema.parse(
      req.query.eventCursor ?? req.query.cursor,
    ),
    attemptCursor = z.uuid().optional().parse(req.query.attemptCursor),
    decisionCursor = cursorSchema.parse(req.query.decisionCursor);
  if (
    attemptCursor &&
    (!c.taskInstanceId ||
      !(await prisma.verificationAttempt.findFirst({
        where: {
          id: attemptCursor,
          session: { taskInstanceId: c.taskInstanceId },
        },
        select: { id: true },
      })))
  )
    throw new ApiError(404, "Attempt cursor not found");
  const [events, issues, decisions, attempts, task, area, location] =
    await Promise.all([
      prisma.exceptionEvent.findMany({
        where: {
          exceptionId: c.id,
          ...(eventCursor ? { id: { gt: eventCursor } } : {}),
        },
        orderBy: { id: "asc" },
        take: 51,
      }),
      prisma.verificationIssue.findMany({
        where: { exceptionId: c.id },
        include: { requirement: { include: { item: true } } },
      }),
      prisma.verificationDecision.findMany({
        where: {
          exceptionId: c.id,
          ...(decisionCursor ? { id: { lt: decisionCursor } } : {}),
        },
        take: 51,
        orderBy: { id: "desc" },
      }),
      c.taskInstanceId
        ? prisma.verificationAttempt.findMany({
            where: { session: { taskInstanceId: c.taskInstanceId } },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: 51,
            ...(attemptCursor
              ? { cursor: { id: attemptCursor }, skip: 1 }
              : {}),
            select: {
              id: true,
              requirementId: true,
              contextKey: true,
              staffId: true,
              state: true,
              createdAt: true,
              receivedAt: true,
              mediaAssetId: true,
              media: { select: { privacyState: true } },
              assignmentEpoch: true,
              timingEvidence: true,
            },
          })
        : Promise.resolve([]),
      c.taskInstanceId
        ? prisma.taskInstance.findUnique({
            where: { id: c.taskInstanceId },
            select: {
              id: true,
              title: true,
              areaNameSnapshot: true,
              shiftEnd: true,
              verificationDeadline: true,
              uploadDeadline: true,
              status: true,
              verificationState: true,
              completionOutcome: true,
              isActive: true,
              verificationVersion: true,
              startedAt: true,
              policySnapshot: true,
              staff: { select: { id: true, name: true } },
            },
          })
        : Promise.resolve(null),
      c.areaId
        ? prisma.area.findUnique({
            where: { id: c.areaId },
            select: { id: true, name: true },
          })
        : Promise.resolve(null),
      prisma.location.findUnique({
        where: { id: c.locationId },
        select: { id: true, name: true, timezone: true },
      }),
    ]);
  const latestIds=issues.map(i=>i.latestAttemptId).filter((id):id is string=>!!id);
  const latestAttempts=c.taskInstanceId?await prisma.verificationAttempt.findMany({where:{id:{in:latestIds},session:{taskInstanceId:c.taskInstanceId}},select:{id:true,requirementId:true,contextKey:true,staffId:true,state:true,createdAt:true,receivedAt:true,mediaAssetId:true,media:{select:{privacyState:true}},assignmentEpoch:true,timingEvidence:true}}):[];
  const managers=await prisma.manager.findMany({where:{companyId:req.user!.companyId,id:{in:decisions.map(d=>d.actorManagerId)}},select:{id:true,name:true}});
  const staff=await prisma.staff.findMany({where:{companyId:req.user!.companyId,id:{in:[...attempts,...latestAttempts].map(a=>a.staffId)}},select:{id:true,name:true}});
  const safeAttempt=(a:(typeof latestAttempts)[number])=>({
    ...a,
    staff:staff.find(s=>s.id===a.staffId)??null,
    mediaAssetId: a.media?.privacyState === "SAFE" && a.state!=='PRIVACY_HOLD' ? a.mediaAssetId : null,
  });
  const page=attempts.slice(0,50).map(safeAttempt);
  const latestPage=latestAttempts.map(safeAttempt);
  const policy = task ? resolvePolicy(task.policySnapshot) : null;
  const mutable =
    !!task &&
    task.isActive &&
    task.verificationVersion === 2 &&
    !["COMPLETED", "CANCELLED"].includes(task.status);
  const extensionUsed =
    (await prisma.verificationDecision.count({
      where: { exceptionId: c.id, action: "EXTEND_WINDOW" },
    })) > 0;
  const canExtend =
    mutable &&
    !!task?.startedAt &&
    task.startedAt <= task.shiftEnd &&
    !!policy &&
    policy.maxExtensionMinutes > 0 &&
    !extensionUsed &&
    +task.shiftEnd + policy.maxExtensionMinutes * 60000 > Date.now() &&
    +task.shiftEnd + policy.maxExtensionMinutes * 60000 >
      +(task.verificationDeadline ?? task.shiftEnd);
  const requiresFollowUp =
    task?.verificationVersion === 2 && task.status === "COMPLETED";
  const allowedActions = requiresFollowUp
    ? c.state === "RESOLVED"
      ? []
      : ["RESOLVE_ISSUE"]
    : mutable
      ? [
          "ACCEPT_EVIDENCE",
          "ACCEPT_CONTEXT",
          "REJECT_EVIDENCE",
          "REQUEST_RECAPTURE",
          "REQUEST_CLEANING",
          "MARK_MAINTENANCE",
          "WAIVE_REQUIREMENT",
          "RESOLVE_ISSUE",
          ...(canExtend ? ["EXTEND_WINDOW"] : []),
        ]
      : [];
  const { policySnapshot: _policy, ...taskSummary } = task ?? {};
  res.json({
    success: true,
    data: {
      ...c,
      task: task ? taskSummary : null,
      area,
      location,
      allowedActions,
      requiresFollowUp,
      policyBounds: policy
        ? {
            maxExtensionMinutes: policy.maxExtensionMinutes,
            uploadMinutes: policy.uploadMinutes,
            reworkMinutes: policy.reworkMinutes,
            extensionUsed,
            extensionDeadline: new Date(
              +task!.shiftEnd + policy.maxExtensionMinutes * 60000,
            ),
          }
        : null,
      reasonInstructions,
      issues: issues.map((i) => ({
        ...i,
        recommendedAction:
          i.reasonCode==='CLEAN'?'Review this photo before accepting the evidence.':reasonInstructions[i.reasonCode] ?? i.recommendedAction,
        latestAttempt: latestPage.find((a) => a.id === i.latestAttemptId) ?? null,
        requiresFollowUp,
        allowedActions: (i.state === "RESOLVED" ? [] : allowedActions).filter(
          (action) =>
            action === "EXTEND_WINDOW" ||
            action === "RESOLVE_ISSUE" ||
            (i.requirementId
              ? action !== "ACCEPT_CONTEXT"
              : action === "ACCEPT_CONTEXT"),
        ),
      })),
      decisions: decisions.slice(0, 50).map(d=>({...d,actorManager:managers.find(m=>m.id===d.actorManagerId)??null})),
      events: events.slice(0, 50),
      attempts: page,
      nextCursor: events.length > 50 ? String(events[49]!.id) : null,
      nextEventCursor: events.length > 50 ? String(events[49]!.id) : null,
      eventsNextCursor: events.length > 50 ? String(events[49]!.id) : null,
      nextAttemptCursor: attempts.length > 50 ? attempts[49]!.id : null,
      nextDecisionCursor:
        decisions.length > 50 ? String(decisions[49]!.id) : null,
    },
  });
});
router.post("/verification-exceptions/:id/actions", async (req, res) =>
  res.json({
    success: true,
    data: await managerDecision(
      req.user!,
      idSchema.parse(req.params.id),
      req.body,
    ),
  }),
);
router.post("/verification-exceptions/:id/read", async (req, res) => {
  const receipt = await prisma.$transaction(async (tx) => {
    const id = idSchema.parse(req.params.id);
    await caseAccess(req.user!, id, tx);
    await tx.$queryRaw`SELECT id FROM "VerificationException" WHERE id=${id} FOR UPDATE`;
    await caseAccess(req.user!, id, tx);
    const latest = await tx.exceptionEvent.findFirst({
        where: { exceptionId: id },
        orderBy: { id: "desc" },
      }),
      key = { exceptionId: id, managerId: req.user!.id };
    return tx.exceptionReadReceipt.upsert({
      where: { exceptionId_managerId: key },
      create: { ...key, lastReadEventId: latest?.id },
      update: { lastReadEventId: latest?.id, readAt: new Date() },
    });
  });
  res.json({ success: true, data: receipt });
});
router.use((error: any, _req: any, _res: any, next: any) =>
  next(
    error instanceof z.ZodError
      ? new ApiError(400, "Invalid request", error.issues)
      : error,
  ),
);
export default router;
