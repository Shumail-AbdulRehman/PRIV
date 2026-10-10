import { assignTemplateStaff } from '../services/templateAssignment.service.js';
import {requireLocationAccess} from '../services/verification-v2/authorization.service.js';
import { Request, Response } from "express";
import { prisma } from "../prisma/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { markCurrentAssignmentsForTasks } from "../services/taskAssignment.service.js";
import { assertLocationAccess } from "../utils/scope.js";

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
  const updated=await assignTemplateStaff(req.user!,Number(req.params.templateId),Number(req.params.staffId));
  res.status(200).json(new ApiResponse(200,updated,'Staff assigned to schedule and eligible existing tasks'));
};
