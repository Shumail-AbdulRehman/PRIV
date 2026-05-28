import { Request, Response } from "express";
import { createTaskSchema,editTaskSchema } from "../validations/taskTemplate.validation.js";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getMinutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();

const validateTaskAgainstStaffShift = (
  staff: { shiftStart: Date | null; shiftEnd: Date | null },
  taskShiftStart: Date,
  taskShiftEnd: Date
) => {
  if (!staff.shiftStart || !staff.shiftEnd) return;

  const staffStartMin = getMinutes(staff.shiftStart);
  const staffEndMin = getMinutes(staff.shiftEnd);
  const taskStartMin = getMinutes(taskShiftStart);
  const taskEndMin = getMinutes(taskShiftEnd);

  const isOvernightShift = staffEndMin < staffStartMin;
  let taskFitsInShift: boolean;

  if (isOvernightShift) {
    const isOvernightTask = taskEndMin < taskStartMin;
    if (isOvernightTask) {
      taskFitsInShift = taskStartMin >= staffStartMin && taskEndMin <= staffEndMin;
    } else {
      taskFitsInShift = taskStartMin >= staffStartMin || taskEndMin <= staffEndMin;
    }
  } else {
    taskFitsInShift = taskStartMin >= staffStartMin && taskEndMin <= staffEndMin;
  }

  if (!taskFitsInShift) {
    throw new ApiError(
      400,
      `Task shift (${taskShiftStart.toISOString()} - ${taskShiftEnd.toISOString()}) falls outside staff's attendance shift. Please update the staff's shift or choose a different time.`
    );
  }
};

export const createTaskTemplate = async (req: Request, res: Response) => {
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join("."),
      message: e.message
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const { locationId } = result.data;

  const location = await prisma.location.findUnique({ where: { id: locationId } });

  if (!location || location.companyId !== req.user!.companyId || !location.isActive) {
    throw new ApiError(404, "Location not found in your company");
  }

  

  const taskTemplate = await prisma.taskTemplate.create({
    data: result.data
  });

  res.status(201).json(new ApiResponse(201, taskTemplate, "Task template created successfully"));
};

export const editTaskTemplate = async (req: Request, res: Response) => {
  const taskTemplateId = Number(req.params.id);
  if (isNaN(taskTemplateId)) throw new ApiError(400, "Invalid task template id");

  const result = editTaskSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join("."),
      message: e.message
    }));
    throw new ApiError(400, "Validation failed", errors);
  }
  const template = await prisma.taskTemplate.findUnique({
    where: { id: taskTemplateId },
    include: { location: true , staff:true}
  });

  if (!template || template.location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Task template not found in your company");
  }

  if (!template.isActive) {
    throw new ApiError(400, "Task template is inactive");
  }

  if (result.data.locationId) {
    const location = await prisma.location.findUnique({
      where: { id: result.data.locationId }
    });

    if (!location || location.companyId !== req.user!.companyId || !location.isActive) {
      throw new ApiError(404, "New location not found in your company");
    }
  }

  const nextLocationId = result.data.locationId ?? template.locationId;
  const nextShiftStart = result.data.shiftStart ?? template.shiftStart;
  const nextShiftEnd = result.data.shiftEnd ?? template.shiftEnd;
  const assignedStaff = template.staff;

  if (assignedStaff) {
    if (assignedStaff.companyId !== req.user!.companyId || !assignedStaff.isActive) {
      throw new ApiError(400, "Assigned staff is no longer active for this company");
    }

    if (assignedStaff.locationId !== nextLocationId) {
      throw new ApiError(400, "Assigned staff must belong to the same location");
    }

    validateTaskAgainstStaffShift(assignedStaff, nextShiftStart, nextShiftEnd);
  }

  const updated = await prisma.taskTemplate.update({
    where: { id: taskTemplateId },
    data: result.data
  });

  res.status(200).json(new ApiResponse(200, updated, "Task template updated successfully"));
};

export const deleteTaskTemplate = async (req: Request, res: Response) => {
  const taskTemplateId = Number(req.params.id);
  if (isNaN(taskTemplateId)) throw new ApiError(400, "Invalid task template id");

  const template = await prisma.taskTemplate.findUnique({
    where: { id: taskTemplateId },
    include: { location: true }
  });

  if (!template || template.location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Task template not found in your company");
  }

  await prisma.$transaction([
    prisma.taskTemplate.update({ where: { id: taskTemplateId }, data: { isActive: false } }),
    prisma.taskInstance.updateMany({
        where: { templateId: taskTemplateId, status: { in: ["PENDING", "IN_PROGRESS"] } },
        data: { status: "MISSED", isActive: false }
    })
]);

  res.status(200).json(new ApiResponse(200, {}, "Task template deleted successfully"));
};

export const getTaskTemplate=async (req:Request, res: Response)=>
{
  const templateId=Number(req.params.id);

  if(isNaN(templateId)) throw new ApiError(400, "Invalid task template id");

  const taskTemplate=await prisma.taskTemplate.findFirst({
    where:{
      id:templateId,
      isActive:true
    },
    include:{
      location:true
    }
  });

  if(!taskTemplate) throw new ApiError(404,"task template not found");

  if(taskTemplate.location.companyId !== req.user?.companyId) throw new ApiError(404,"task tenplate not found in your company");

  res.status(200).json(
    new ApiResponse(200,taskTemplate,"task template fetched successfully")
  );

};

export const getTaskTemplatesByLocation=async (req:Request, res: Response)=>
{
  const locationId=Number(req.params.locationId);

  if(isNaN(locationId)) throw new ApiError(400, "Invalid location id");

  const location=await prisma.location.findUnique({
    where:{id:locationId}
  });

  if(!location) throw new ApiError(404,"Location not found");

  if(location.companyId !== req.user?.companyId) throw new ApiError(404,"Location not found in your company");

  const taskTemplates=await prisma.taskTemplate.findMany({
    where:{
      locationId,
      isActive:true
    }
  });

  res.status(200).json(
    new ApiResponse(200,taskTemplates,"Task templates fetched successfully")
  );  
};
