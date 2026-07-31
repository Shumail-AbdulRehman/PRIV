import { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { markCurrentAssignmentsForTasks } from "../services/taskAssignment.service.js";

const getUtcMinutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();

const toTimeRanges = (start: Date, end: Date) => {
  const startMin = getUtcMinutes(start);
  const endMin = getUtcMinutes(end);

  if (endMin > startMin) {
    return [{ start: startMin, end: endMin }];
  }

  return [
    { start: startMin, end: 24 * 60 },
    { start: 0, end: endMin },
  ];
};

const timeRangesOverlap = (firstStart: Date, firstEnd: Date, secondStart: Date, secondEnd: Date) => {
  const firstRanges = toTimeRanges(firstStart, firstEnd);
  const secondRanges = toTimeRanges(secondStart, secondEnd);

  return firstRanges.some((first) =>
    secondRanges.some((second) => first.start < second.end && second.start < first.end)
  );
};

const formatUtcTime = (date: Date) =>
  `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;

export const assignStaffToLocation = async (req: Request, res: Response) => {
  const staffId = Number(req.params.staffId);
  const locationId = Number(req.params.locationId);

  if (isNaN(staffId) || isNaN(locationId)) {
    throw new ApiError(400, "Invalid staff or location id");
  }

  const staff = await prisma.staff.findUnique({ where: { id: staffId, isActive:true } });

  if (!staff || staff.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Staff not found in your company");
  }

  const location = await prisma.location.findUnique({ where: { id: locationId } });

  if (!location || location.companyId !== req.user!.companyId || !location.isActive) {
    throw new ApiError(404, "Location not found in your company");
  }

  if (staff.locationId && staff.locationId !== locationId) {
    const affectedTasks = await prisma.taskInstance.findMany({
      where: {
        staffId,
        locationId: staff.locationId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.taskTemplate.updateMany({
        where: { staffId, locationId: staff.locationId, isActive: true },
        data: { staffId: null },
      }),
      prisma.taskInstance.updateMany({
        where: {
          staffId,
          locationId: staff.locationId,
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        data: { staffId: null },
      }),
    ]);

    await markCurrentAssignmentsForTasks(
      affectedTasks.map((task) => task.id),
      "CANCELLED",
      "STAFF_LOCATION_CHANGED"
    );
  }

  const updated = await prisma.staff.update({
    where: { id: staffId },
    data: { locationId },
    select: { id: true, name: true, email: true, role: true, locationId: true, companyId: true }
  });

  res.status(200).json(new ApiResponse(200, updated, "Staff assigned to location successfully"));
};

export const assignStaffToTaskTemplate = async (req: Request, res: Response) => {
  const templateId = Number(req.params.templateId);
  const staffId = Number(req.params.staffId);

  if (isNaN(templateId) || isNaN(staffId)) {
    throw new ApiError(400, "Invalid template or staff id");
  }

  const template = await prisma.taskTemplate.findUnique({
    where: { id: templateId },
    include: { location: true }
  });

  if (!template || template.location.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Task template not found in your company");
  }

  if (!template.isActive) {
    throw new ApiError(400, "Task template is inactive");
  }

  const staff = await prisma.staff.findUnique({ where: { id: staffId, isActive: true } });

  if (!staff || staff.companyId !== req.user!.companyId) {
    throw new ApiError(404, "Staff not found in your company");
  }

  if (staff.locationId !== template.locationId) {
    throw new ApiError(400, "Staff must belong to the same location");
  }

  if (staff.shiftStart && staff.shiftEnd) {
    const staffStartMin = staff.shiftStart.getUTCHours() * 60 + staff.shiftStart.getUTCMinutes();
    const staffEndMin = staff.shiftEnd.getUTCHours() * 60 + staff.shiftEnd.getUTCMinutes();
    const taskStartMin = template.shiftStart.getUTCHours() * 60 + template.shiftStart.getUTCMinutes();
    const taskEndMin = template.shiftEnd.getUTCHours() * 60 + template.shiftEnd.getUTCMinutes();

   
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
        `Task shift (${template.shiftStart.toISOString()} - ${template.shiftEnd.toISOString()}) falls outside staff's attendance shift. Please update the staff's shift or choose a different time.`
      );
    }
  }

  const assignedTemplates = await prisma.taskTemplate.findMany({
    where: {
      id: { not: templateId },
      staffId,
      isActive: true,
    },
    select: {
      title: true,
      shiftStart: true,
      shiftEnd: true,
    },
  });

  const overlappingTemplate = assignedTemplates.find((assignedTemplate) =>
    timeRangesOverlap(
      template.shiftStart,
      template.shiftEnd,
      assignedTemplate.shiftStart,
      assignedTemplate.shiftEnd
    )
  );

  if (overlappingTemplate) {
    throw new ApiError(
      400,
      `Staff is already assigned to "${overlappingTemplate.title}" during ${formatUtcTime(overlappingTemplate.shiftStart)} - ${formatUtcTime(overlappingTemplate.shiftEnd)}. Choose a different time or staff member.`
    );
  }

  const updated = await prisma.taskTemplate.update({
    where: { id: templateId },
    data: { staffId }
  });

  res.status(200).json(new ApiResponse(200, updated, "Staff assigned to task template successfully"));
};
