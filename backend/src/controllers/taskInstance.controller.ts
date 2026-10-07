import { requireTaskAccess, requireLocationAccess } from '../services/verification-v2/authorization.service.js';
import { lockTask } from '../services/verification-v2/captureSession.service.js';
import { Request, Response } from 'express';
import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { getUtcDayRange, getZonedDayRange } from '../utils/dateTime.js';
import { markCurrentAssignmentStarted } from '../services/taskAssignment.service.js';

export const getTodaysTasksForStaff = async (req: Request, res: Response) => {
  const staffId = Number(req.params.staffId);

  if (!Number.isSafeInteger(staffId) || staffId < 1) {
    throw new ApiError(400, "Invalid staff id");
  }
  if (req.user!.role === 'STAFF' && req.user!.id !== staffId) throw new ApiError(403, 'Only your assigned tasks are available');

  const staff = await prisma.staff.findUnique({
    where: { id: staffId, isActive:true },
    include: { location: { select: { timezone: true } } },
  });

  if (!staff || staff.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Staff not found in your company");
  }

  if (staff.locationId) await requireLocationAccess(req.user!, staff.locationId);

const { start: today, end: tomorrow } = staff.location?.timezone
  ? getZonedDayRange(new Date(), staff.location.timezone)
  : getUtcDayRange();

const tasks = await prisma.taskInstance.findMany({
  where: {
    staffId,
    date: {
      gte: today,
      lt: tomorrow
    },
    isActive: true
  },
  include: {
    template: {
      select: {
        id: true,
        title: true,
        shiftStart: true,
        shiftEnd: true,
        location: {
          select: { id: true, name: true, timezone:true },
        },
      },
    }
  }
});

  res.status(200).json(new ApiResponse(200, tasks, "Today's tasks fetched successfully"));
};

export const startTask = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);
  if (!Number.isSafeInteger(taskId) || taskId < 1) throw new ApiError(400, 'Invalid task id');
  const started = await prisma.$transaction(async tx => {
    await lockTask(tx, taskId);
    const task = await requireTaskAccess(req.user!, taskId, { staffMutation: true }, tx);
    if (task.verificationVersion !== 2) throw inventorySetupRequired();
    const now = new Date();
    if (task.status === 'IN_PROGRESS') return task;
    if (task.status !== 'PENDING' || task.shiftEnd <= now || +task.shiftStart > +now + 300000)
      throw new ApiError(409, 'Task cannot start in this window');
    const isLate = +now > +task.shiftStart + 300000;
    const updated = await tx.taskInstance.update({ where: { id: taskId }, data: {
      status: 'IN_PROGRESS', startedAt: now, isLate,
      lateMinutes: isLate ? Math.floor((+now - +task.shiftStart) / 60000) : 0,
      rowVersion: { increment: 1 },
    } });
    await markCurrentAssignmentStarted(taskId, req.user!.id, now, tx as typeof prisma);
    return updated;
  });
  res.json(new ApiResponse(200, started, 'Cleaning started'));
};

function inventorySetupRequired() {
  return new ApiError(409, 'This task was created before guided verification. Ask your manager to map its schedule to an area inventory and replace this task.', [{ code: 'INVENTORY_SETUP_REQUIRED' }]);
}

/** Old clients get an actionable response before any file parsing or storage. */
export const retiredEvidenceEndpoint = async (req: Request, _res: Response) => {
  await requireTaskAccess(req.user!, Number(req.params.taskId), { staffMutation: true });
  throw new ApiError(410, 'Use Finish task in the updated app to scan the room QR and capture guided photos.', [{ code: 'GUIDED_VERIFICATION_REQUIRED' }]);
};

export const getAreaSubmissions = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);

  if (isNaN(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }

  await requireTaskAccess(req.user!, taskId);

  const submissions = await prisma.taskAreaSubmission.findMany({
    where: { taskInstanceId: taskId },
    orderBy: { referenceImage: { sortOrder: "asc" } },
    include: {
      referenceImage: { select: { id: true, name: true, imageUrl: true } },
      staff: { select: { id: true, name: true } },
    },
  });

  res.status(200).json(
    new ApiResponse(200, submissions, "Area submissions fetched successfully")
  );
};

/** Completion is a read of server policy state, never a gallery/manual bypass. */
export const completeTask = async (req: Request, res: Response) => {
  const task = await requireTaskAccess(req.user!, Number(req.params.taskId));
  if (task.verificationVersion !== 2) throw inventorySetupRequired();
  if (task.status !== 'COMPLETED') throw new ApiError(409, 'Finish the required guided photos and resolve verification issues before this task can complete.', [{ code: 'VERIFICATION_UNRESOLVED', verificationState: task.verificationState }]);
  res.json(new ApiResponse(200, { id: task.id, status: task.status, completionOutcome: task.completionOutcome }, 'Task completion confirmed'));
};

export const getTaskInstanceById = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);

    if (isNaN(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }

    await requireTaskAccess(req.user!, taskId);

    const task= await prisma.taskInstance.findUnique({
        where: {id: taskId, isActive:true},
        include: {
            referenceImages: {
                orderBy: { sortOrder: "asc" },
            },
            assignments: {
                orderBy: { assignedAt: "asc" },
                include: {
                    staff: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            completionAttempts: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    if (!task) {
        throw new ApiError(404, "Task not found for this staff");
    }

    res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));  

};

export const getTasknstancesOfLocation = async (req: Request, res: Response) => {

    const locationId = Number(req.params.locationId);
    
    if (isNaN(locationId)) {
        throw new ApiError(400, "Invalid location id");
    }

    await requireLocationAccess(req.user!, locationId);
    
    const location = await prisma.location.findUnique({
        where: { id: locationId }
    });

    if (!location) {
        throw new ApiError(404, "Location not found");
    }

    if (location.companyId !== req.user!.companyId) {
        throw new ApiError(403, "Location does not belong to your company");
    }

    const tasks = await prisma.taskInstance.findMany({
        where: { locationId, isActive: true },
        include: {
            referenceImages: {
                orderBy: { sortOrder: "asc" },
            },
            staff: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    shiftStart: true,
                    shiftEnd: true
                }
            },
            assignments: {
                orderBy: { assignedAt: "asc" },
                include: {
                    staff: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        }
    });

    res.status(200).json(new ApiResponse(200, tasks, "Task instances fetched successfully"));
};


  
