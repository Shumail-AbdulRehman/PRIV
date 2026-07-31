import { prisma } from "../prisma/prisma.js";
import { addUtcDays } from "../utils/karachiTime.js";
import { writeAuditLog } from "./auditLog.service.js";

type DbClient = typeof prisma;

type TaskForAssignment = {
  id: number;
  title: string;
  date: Date;
  shiftStart: Date;
  shiftEnd: Date;
  status: string;
  isActive: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
  staffId: number | null;
  locationId: number;
  location: {
    companyId: number;
  };
};

const getUtcMinutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();

const normalizeEnd = (startMin: number, endMin: number) =>
  endMin <= startMin ? endMin + 24 * 60 : endMin;

const shiftCoversTask = (
  staffShiftStart: Date | null,
  staffShiftEnd: Date | null,
  taskStart: Date,
  taskEnd: Date
) => {
  if (!staffShiftStart || !staffShiftEnd) return false;

  const staffStartMin = getUtcMinutes(staffShiftStart);
  const staffEndMin = normalizeEnd(staffStartMin, getUtcMinutes(staffShiftEnd));
  const taskStartMin = getUtcMinutes(taskStart);
  let normalizedTaskStartMin = taskStartMin;
  let taskEndMin = normalizeEnd(taskStartMin, getUtcMinutes(taskEnd));

  if (normalizedTaskStartMin < staffStartMin && staffEndMin > 24 * 60) {
    normalizedTaskStartMin += 24 * 60;
    taskEndMin += 24 * 60;
  }

  return normalizedTaskStartMin >= staffStartMin && taskEndMin <= staffEndMin;
};

const taskWindowsOverlap = (
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date
) => firstStart < secondEnd && secondStart < firstEnd;

const getTaskWithCompany = async (taskInstanceId: number, client: DbClient = prisma) => {
  return client.taskInstance.findUnique({
    where: { id: taskInstanceId },
    include: {
      location: {
        select: {
          companyId: true,
        },
      },
    },
  });
};

const mapTaskStatusToAssignmentStatus = (status: string) => {
  if (status === "IN_PROGRESS") return "STARTED";
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "MISSED" || status === "NOT_COMPLETED_INTIME") return "MISSED";
  if (status === "CANCELLED") return "CANCELLED";
  return "ASSIGNED";
};

const isTaskAssignable = (task: TaskForAssignment) =>
  task.isActive && ["PENDING", "IN_PROGRESS"].includes(task.status);

const getCurrentAssignment = async (taskInstanceId: number, client: DbClient = prisma) => {
  return client.taskAssignment.findFirst({
    where: {
      taskInstanceId,
      isCurrent: true,
    },
    orderBy: { assignedAt: "desc" },
  });
};

const getAttendanceForTaskWindow = async (
  staffId: number,
  task: TaskForAssignment,
  client: DbClient = prisma
) => {
  return client.attendance.findFirst({
    where: {
      staffId,
      expectedStart: { lte: task.shiftEnd },
      expectedEnd: { gte: task.shiftStart },
    },
    orderBy: { expectedStart: "desc" },
  });
};

const isAttendanceEligible = async (
  staffId: number,
  task: TaskForAssignment,
  now: Date,
  client: DbClient = prisma
) => {
  const attendance = await getAttendanceForTaskWindow(staffId, task, client);

  if (!attendance) {
    return now < task.shiftStart;
  }

  if (attendance.status === "CHECKED_OUT" && attendance.checkOutTime && attendance.checkOutTime <= task.shiftStart) {
    return false;
  }

  if (now >= task.shiftStart) {
    return (
      !!attendance.checkInTime &&
      !attendance.checkOutTime &&
      ["CHECKED_IN", "LATE", "MISSED_CHECKOUT"].includes(attendance.status)
    );
  }

  return attendance.status !== "CHECKED_OUT";
};

const getStaffWorkloadScore = async (
  staffId: number,
  task: TaskForAssignment,
  client: DbClient = prisma
) => {
  const dayStart = task.date;
  const dayEnd = addUtcDays(dayStart, 1);

  const currentAssignments = await client.taskAssignment.findMany({
    where: {
      staffId,
      isCurrent: true,
      status: { in: ["ASSIGNED", "STARTED"] },
      taskInstance: {
        date: { gte: dayStart, lt: dayEnd },
        isActive: true,
      },
    },
    include: {
      taskInstance: {
        select: {
          id: true,
          shiftStart: true,
          shiftEnd: true,
        },
      },
    },
  });

  const hasOverlap = currentAssignments.some((assignment) =>
    assignment.taskInstance.id !== task.id &&
    taskWindowsOverlap(
      assignment.taskInstance.shiftStart,
      assignment.taskInstance.shiftEnd,
      task.shiftStart,
      task.shiftEnd
    )
  );

  if (hasOverlap) return null;

  return currentAssignments.length;
};

export const findBestStaffForTask = async (
  task: TaskForAssignment,
  options: { excludeStaffIds?: number[]; now?: Date; client?: DbClient } = {}
) => {
  const client = options.client ?? prisma;
  const now = options.now ?? new Date();
  const excludeStaffIds = options.excludeStaffIds ?? [];

  const staffMembers = await client.staff.findMany({
    where: {
      companyId: task.location.companyId,
      locationId: task.locationId,
      isActive: true,
      id: excludeStaffIds.length ? { notIn: excludeStaffIds } : undefined,
      shiftStart: { not: null },
      shiftEnd: { not: null },
    },
    select: {
      id: true,
      name: true,
      shiftStart: true,
      shiftEnd: true,
    },
    orderBy: { id: "asc" },
  });

  const candidates = [];

  for (const staff of staffMembers) {
    if (!shiftCoversTask(staff.shiftStart, staff.shiftEnd, task.shiftStart, task.shiftEnd)) {
      continue;
    }

    const attendanceEligible = await isAttendanceEligible(staff.id, task, now, client);
    if (!attendanceEligible) {
      continue;
    }

    const workloadScore = await getStaffWorkloadScore(staff.id, task, client);
    if (workloadScore === null) {
      continue;
    }

    candidates.push({
      staff,
      score: workloadScore,
    });
  }

  candidates.sort((a, b) => a.score - b.score || a.staff.id - b.staff.id);

  return candidates[0]?.staff ?? null;
};

export const ensureCurrentAssignmentForTask = async (
  taskInstanceId: number,
  reason = "SCHEDULER_SYNC"
) => {
  const task = await getTaskWithCompany(taskInstanceId);
  if (!task || !isTaskAssignable(task)) {
    return null;
  }

  const existing = await getCurrentAssignment(taskInstanceId);
  if (existing) {
    return existing;
  }

  const staffId = task.staffId ?? (await findBestStaffForTask(task))?.id ?? null;

  if (!staffId) {
    await writeAuditLog({
      companyId: task.location.companyId,
      actorType: "SYSTEM",
      entityType: "TASK_INSTANCE",
      entityId: task.id,
      action: "AUTO_ASSIGNMENT_SKIPPED",
      reason: "NO_ELIGIBLE_STAFF",
      newValue: { taskInstanceId: task.id },
    });
    return null;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const current = await getCurrentAssignment(taskInstanceId, tx as DbClient);
      if (current) {
        return current;
      }

      if (task.staffId !== staffId) {
        await tx.taskInstance.update({
          where: { id: task.id },
          data: { staffId },
        });
      }

      const createResult = await tx.taskAssignment.createMany({
        data: [{
          taskInstanceId: task.id,
          staffId,
          status: mapTaskStatusToAssignmentStatus(task.status),
          reason,
          isCurrent: true,
          startedAt: task.status === "IN_PROGRESS" ? task.startedAt : null,
          completedAt: task.status === "COMPLETED" ? task.completedAt : null,
        }],
        skipDuplicates: true,
      });

      const assignment = await getCurrentAssignment(taskInstanceId, tx as DbClient);
      if (!assignment) {
        return null;
      }

      if (createResult.count > 0) {
        await writeAuditLog(
          {
            companyId: task.location.companyId,
            actorType: "SYSTEM",
            entityType: "TASK_ASSIGNMENT",
            entityId: assignment.id,
            action: "ASSIGNMENT_CREATED",
            reason,
            newValue: {
              taskInstanceId: task.id,
              staffId,
              status: assignment.status,
            },
          },
          tx as DbClient
        );
      }

      return assignment;
    });
  } catch (error) {
    const current = await getCurrentAssignment(taskInstanceId);
    if (current) {
      return current;
    }
    throw error;
  }
};

export const ensureAssignmentsForToday = async () => {
  const now = new Date();
  const tasks = await prisma.taskInstance.findMany({
    where: {
      isActive: true,
      status: { in: ["PENDING", "IN_PROGRESS"] },
      shiftEnd: { gte: now },
    },
    select: { id: true },
  });

  let ensured = 0;

  for (const task of tasks) {
    const assignment = await ensureCurrentAssignmentForTask(task.id);
    if (assignment) ensured += 1;
  }

  return ensured;
};

export const markCurrentAssignmentStarted = async (
  taskInstanceId: number,
  staffId: number,
  startedAt: Date,
  client: DbClient = prisma
) => {
  await client.taskAssignment.updateMany({
    where: {
      taskInstanceId,
      staffId,
      isCurrent: true,
      status: "ASSIGNED",
    },
    data: {
      status: "STARTED",
      startedAt,
    },
  });
};

export const markCurrentAssignmentCompleted = async (
  taskInstanceId: number,
  staffId: number,
  completedAt: Date,
  client: DbClient = prisma
) => {
  await client.taskAssignment.updateMany({
    where: {
      taskInstanceId,
      staffId,
      isCurrent: true,
      status: { in: ["ASSIGNED", "STARTED"] },
    },
    data: {
      status: "COMPLETED",
      completedAt,
      isCurrent: false,
    },
  });
};

export const markCurrentAssignmentsForTasks = async (
  taskInstanceIds: number[],
  status: "MISSED" | "CANCELLED" | "FAILED",
  reason: string,
  client: DbClient = prisma
) => {
  if (taskInstanceIds.length === 0) return;

  await client.taskAssignment.updateMany({
    where: {
      taskInstanceId: { in: taskInstanceIds },
      isCurrent: true,
      status: { in: ["ASSIGNED", "STARTED"] },
    },
    data: {
      status,
      reason,
      failedAt: new Date(),
      isCurrent: false,
    },
  });
};

export const reassignExpiredAssignments = async (graceMinutes: number) => {
  const now = new Date();
  const graceCutoff = new Date(now.getTime() - graceMinutes * 60 * 1000);
  const maxReassignments = Number.parseInt(process.env.MAX_TASK_REASSIGNMENTS ?? "", 10);
  const reassignmentLimit = Number.isFinite(maxReassignments) && maxReassignments >= 0
    ? maxReassignments
    : 3;

  const expiredAssignments = await prisma.taskAssignment.findMany({
    where: {
      isCurrent: true,
      status: "ASSIGNED",
      taskInstance: {
        isActive: true,
        status: "PENDING",
        shiftStart: { lt: graceCutoff },
        shiftEnd: { gt: now },
      },
    },
    include: {
      taskInstance: {
        include: {
          location: {
            select: { companyId: true },
          },
        },
      },
    },
    orderBy: { assignedAt: "asc" },
  });

  let reassigned = 0;
  let failedWithoutReplacement = 0;

  for (const assignment of expiredAssignments) {
    const task = assignment.taskInstance;
    const previousAssignmentCount = await prisma.taskAssignment.count({
      where: { taskInstanceId: task.id },
    });
    const hasReachedLimit = Math.max(previousAssignmentCount - 1, 0) >= reassignmentLimit;

    if (hasReachedLimit) {
      await prisma.$transaction(async (tx) => {
        const stillCurrent = await tx.taskAssignment.findFirst({
          where: {
            id: assignment.id,
            isCurrent: true,
            status: "ASSIGNED",
            taskInstance: {
              status: "PENDING",
            },
          },
        });

        if (!stillCurrent) {
          return;
        }

        await tx.taskAssignment.update({
          where: { id: assignment.id },
          data: {
            status: "MISSED",
            reason: "MAX_REASSIGNMENTS_REACHED",
            failedAt: now,
            isCurrent: false,
          },
        });

        await tx.taskInstance.update({
          where: { id: task.id },
          data: { staffId: null },
        });

        await writeAuditLog(
          {
            companyId: task.location.companyId,
            actorType: "SYSTEM",
            entityType: "TASK_INSTANCE",
            entityId: task.id,
            action: "REASSIGNMENT_LIMIT_REACHED",
            reason: "MAX_TASK_REASSIGNMENTS",
            oldValue: { staffId: assignment.staffId, assignmentCount: previousAssignmentCount },
            newValue: { staffId: null, maxReassignments: reassignmentLimit },
          },
          tx as DbClient
        );
      });

      failedWithoutReplacement += 1;
      continue;
    }

    const replacement = await findBestStaffForTask(task, {
      excludeStaffIds: [assignment.staffId],
      now,
    });

    await prisma.$transaction(async (tx) => {
      const stillCurrent = await tx.taskAssignment.findFirst({
        where: {
          id: assignment.id,
          isCurrent: true,
          status: "ASSIGNED",
          taskInstance: {
            status: "PENDING",
          },
        },
      });

      if (!stillCurrent) {
        return;
      }

      await tx.taskAssignment.update({
        where: { id: assignment.id },
        data: {
          status: replacement ? "REASSIGNED" : "MISSED",
          reason: "MISSED_START_GRACE_PERIOD",
          failedAt: now,
          isCurrent: false,
        },
      });

      if (!replacement) {
        await tx.taskInstance.update({
          where: { id: task.id },
          data: { staffId: null },
        });

        await writeAuditLog(
          {
            companyId: task.location.companyId,
            actorType: "SYSTEM",
            entityType: "TASK_INSTANCE",
            entityId: task.id,
            action: "REASSIGNMENT_FAILED",
            reason: "NO_ELIGIBLE_STAFF",
            oldValue: { staffId: assignment.staffId },
            newValue: { staffId: null },
          },
          tx as DbClient
        );
        failedWithoutReplacement += 1;
        return;
      }

      const newAssignment = await tx.taskAssignment.create({
        data: {
          taskInstanceId: task.id,
          staffId: replacement.id,
          status: "ASSIGNED",
          reason: "AUTO_REASSIGNED_AFTER_MISSED_START",
          isCurrent: true,
        },
      });

      await tx.taskInstance.update({
        where: { id: task.id },
        data: { staffId: replacement.id },
      });

      await writeAuditLog(
        {
          companyId: task.location.companyId,
          actorType: "SYSTEM",
          entityType: "TASK_ASSIGNMENT",
          entityId: newAssignment.id,
          action: "TASK_REASSIGNED",
          reason: "MISSED_START_GRACE_PERIOD",
          oldValue: { assignmentId: assignment.id, staffId: assignment.staffId },
          newValue: { assignmentId: newAssignment.id, staffId: replacement.id },
        },
        tx as DbClient
      );
      reassigned += 1;
    });
  }

  return {
    scanned: expiredAssignments.length,
    reassigned,
    failedWithoutReplacement,
  };
};
