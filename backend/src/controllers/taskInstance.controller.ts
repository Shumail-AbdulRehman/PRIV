import { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getKarachiDayRange } from "../utils/karachiTime.js";
import { uploadMultipleImages } from "../utils/cloudinary.js";


export const getTodaysTasksForStaff = async (req: Request, res: Response) => {
  const staffId = Number(req.params.staffId);

  if (isNaN(staffId)) {
    throw new ApiError(400, "Invalid staff id");
  }

  const staff = await prisma.staff.findUnique({ where: { id: staffId, isActive:true } });

  if (!staff || staff.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Staff not found in your company");
  }

const { start: today, end: tomorrow } = getKarachiDayRange();

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
      include: {
        location: true
      }
    }
  }
});

  res.status(200).json(new ApiResponse(200, tasks, "Today's tasks fetched successfully"));
};

export const startTask = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);
  const qrToken = req.query.qrToken;

  if (isNaN(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }

  if (typeof qrToken !== "string" || !qrToken.trim()) {
    throw new ApiError(400, "Invalid qr token");
  }

  const template = await prisma.taskTemplate.findUnique({
    where: { qrToken },
  });

  if (!template) {
    throw new ApiError(404, "Invalid QR code");
  }

  const task = await prisma.taskInstance.findUnique({
    where: { id: taskId },
  });

  if (!task || !task.isActive || task.staffId !== req.user!.id) {
    throw new ApiError(404, "Task not found for this staff");
  }

  if (!task.templateId) {
    throw new ApiError(400, "Task is not linked to a template");
  }

  if (task.templateId !== template.id) {
    throw new ApiError(400, "QR code does not belong to this task");
  }

  if (task.status !== "PENDING") {
    throw new ApiError(400, "Only pending tasks can be started");
  }

  const now = new Date();

  if (task.shiftEnd <= now) {
    throw new ApiError(400, "Task time ended");
  }

  const GRACE_PERIOD_MINUTES = 5;
  const nowPlusGrace = new Date(now.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000);

  if (task.shiftStart > nowPlusGrace) {
    throw new ApiError(400, "Task hasn't started yet");
  }

  const graceDeadline = new Date(task.shiftStart.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000);
  const isLate = now > graceDeadline;

  if (isLate) {
    const lateMinutes = Math.floor((now.getTime() - task.shiftStart.getTime()) / (1000 * 60));

    const taskStartedLate = await prisma.taskInstance.update({
      where: { id: taskId },
      data: {
        status: "IN_PROGRESS",
        startedAt: now,
        isLate: true,
        lateMinutes,
      },
    });

    return res.status(200).json(new ApiResponse(200, taskStartedLate, "Task started late"));
  }

  const taskStarted = await prisma.taskInstance.update({
    where: { id: taskId },
    data: {
      status: "IN_PROGRESS",
      startedAt: now,
    },
  });

  return res.status(200).json(new ApiResponse(200, taskStarted, "Task started successfully"));
};

export const completeTask = async (req: Request, res: Response) => {
    const files = Array.isArray(req.files) ? req.files : [];

    const taskId = Number(req.params.taskId);

    if (isNaN(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }

    if (!files.length) {
        throw new ApiError(400, "At least one completion image is required");
    }

    const task = await prisma.taskInstance.findUnique({
        where: { id: taskId }
    });

    if (!task || !task.isActive || task.staffId !== req.user!.id) {
        throw new ApiError(404, "Task not found for this staff");
    }
    
    if (task.status !== "IN_PROGRESS") {
        throw new ApiError(400, "Only in-progress tasks can be completed");
    }

    const now =new Date();

    if(task.shiftEnd <= now) 
    {
        throw new ApiError(400, "Task time ended")
    }

    const uploadedImages = await uploadMultipleImages(
        files,
        `task-instances/${taskId}/completion-proofs`
    );

    const proofImageUrls = uploadedImages.map((image) => image.secure_url);
    
    const taskCompleted = await prisma.taskInstance.update({
        where: { id: taskId },
        data: {
            status: "COMPLETED",
            completedAt: now,
            proofImageUrls,
        }
    });

    res.status(200).json(new ApiResponse(200, taskCompleted, "Task completed successfully"));


}

export const getTaskInstanceById = async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);

    if (isNaN(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }

    const task= await prisma.taskInstance.findUnique({
        where: {id: taskId, isActive:true},
    });

    if (!task || task.staffId !== req.user!.id) {
        throw new ApiError(404, "Task not found for this staff");
    }

    res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));  

};

export const getTasknstancesOfLocation = async (req: Request, res: Response) => {

    const locationId = Number(req.params.locationId);
    
    if (isNaN(locationId)) {
        throw new ApiError(400, "Invalid location id");
    }
    
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
            staff: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    shiftStart: true,
                    shiftEnd: true   
                }
            }
        }
    });

    res.status(200).json(new ApiResponse(200, tasks, "Task instances fetched successfully"));
};


  
