import {requireLocationAccess} from '../services/verification-v2/authorization.service.js';
import { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { markCurrentAssignmentsForTasks } from "../services/taskAssignment.service.js";
import { assertLocationAccess } from "../utils/scope.js";

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

  if (staff.locationId) {
    assertLocationAccess(req.user!, staff.locationId);
  }

  const location = await prisma.location.findUnique({ where: { id: locationId } });

  if (!location || location.companyId !== req.user!.companyId || !location.isActive) {
    throw new ApiError(404, "Location not found in your company");
  }

  assertLocationAccess(req.user!, locationId);

  const updated=await prisma.$transaction(async tx=>{
    await tx.$queryRaw`SELECT id FROM "Staff" WHERE id=${staffId} FOR UPDATE`;
    const current=await tx.staff.findUniqueOrThrow({where:{id:staffId}});
    if(!current.isActive||current.companyId!==req.user!.companyId)throw new ApiError(403,'Staff account is inactive');
    await requireLocationAccess(req.user!,locationId,tx);
    if(current.locationId!==null)await requireLocationAccess(req.user!,current.locationId,tx);
    if(current.locationId!==null&&current.locationId!==locationId){
      const affected=await tx.$queryRaw<{id:number}[]>`SELECT id FROM "TaskInstance" WHERE "staffId"=${staffId} AND "locationId"=${current.locationId} AND status IN ('PENDING','IN_PROGRESS','NOT_COMPLETED_INTIME') ORDER BY id FOR UPDATE`;
      await tx.taskTemplate.updateMany({where:{staffId,locationId:current.locationId,isActive:true},data:{staffId:null}});
      await tx.taskInstance.updateMany({where:{id:{in:affected.map(t=>t.id)}},data:{staffId:null}});
      await markCurrentAssignmentsForTasks(affected.map(t=>t.id),'CANCELLED','STAFF_LOCATION_CHANGED',tx as typeof prisma);
    }
    return tx.staff.update({where:{id:staffId},data:{locationId},select:{id:true,name:true,email:true,role:true,locationId:true,companyId:true}});
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

  assertLocationAccess(req.user!, template.locationId);

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
