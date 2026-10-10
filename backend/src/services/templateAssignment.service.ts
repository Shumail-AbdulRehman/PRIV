import { prisma } from '../prisma/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { getZonedClockMinutes, getZonedDayRange } from '../utils/dateTime.js';
import { writeAuditLog } from './auditLog.service.js';
import { requireLocationAccess, requireOperationalRole, type VerificationActor } from './verification-v2/authorization.service.js';

function ranges(start: Date, end: Date, zone: string) {
  const a=getZonedClockMinutes(start,zone),b=getZonedClockMinutes(end,zone);
  return b>a?[[a,b]]:[[a,1440],[0,b]];
}

/** Template and its eligible existing instances receive one atomic assignment. */
export async function assignTemplateStaff(actor: VerificationActor, templateId: number, staffId: number, now=new Date()) {
  requireOperationalRole(actor);
  if(!Number.isSafeInteger(templateId)||templateId<1||!Number.isSafeInteger(staffId)||staffId<1)throw new ApiError(400,'Invalid template or staff id');
  return prisma.$transaction(async tx=>{
    const initial=await tx.taskTemplate.findFirst({where:{id:templateId,location:{companyId:actor.companyId}},select:{locationId:true,areaId:true}});
    if(!initial)throw new ApiError(404,'Task template not found in your company');
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(872120, ${initial.locationId})::text`;
    if(initial.areaId)await tx.$queryRaw`SELECT id FROM "Area" WHERE id=${initial.areaId} FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM "TaskTemplate" WHERE id=${templateId} FOR UPDATE`;
    const template=await tx.taskTemplate.findUniqueOrThrow({where:{id:templateId},include:{location:true}});
    if(template.locationId!==initial.locationId||template.areaId!==initial.areaId)throw new ApiError(409,'Schedule changed. Refresh and assign again.');
    const location=await requireLocationAccess(actor,template.locationId,tx);
    if(!template.isActive||!location.isActive)throw new ApiError(400,'Task template or location is inactive');
    const staff=await tx.staff.findFirst({where:{id:staffId,companyId:actor.companyId,isActive:true,locationId:location.id}});
    if(!staff)throw new ApiError(404,'Choose active staff at this location in your company');
    if(staff.shiftStart&&staff.shiftEnd){
      const staffRanges=ranges(staff.shiftStart,staff.shiftEnd,location.timezone);
      if(!ranges(template.shiftStart,template.shiftEnd,location.timezone).every(([a,b])=>staffRanges.some(([x,y])=>a!>=x!&&b!<=y!)))
        throw new ApiError(400,"Task falls outside staff's attendance shift. Update the staff shift or choose another time.");
    }
    const others=await tx.taskTemplate.findMany({where:{id:{not:templateId},staffId,isActive:true,locationId:location.id},select:{title:true,shiftStart:true,shiftEnd:true}});
    if(others.some(other=>ranges(template.shiftStart,template.shiftEnd,location.timezone).some(([a,b])=>ranges(other.shiftStart,other.shiftEnd,location.timezone).some(([x,y])=>a!<y!&&x!<b!))))
      throw new ApiError(400,'Staff already has an overlapping schedule. Choose a different time or staff member.');
    const dayStart=getZonedDayRange(now,location.timezone).start;
    const locked=await tx.$queryRaw<{id:number}[]>`SELECT id FROM "TaskInstance" WHERE "templateId"=${templateId} AND "locationId"=${location.id} AND "isActive"=true AND status='PENDING' AND "startedAt" IS NULL AND date>=${dayStart} AND "shiftEnd">${now} ORDER BY id FOR UPDATE`;
    const candidates=await tx.taskInstance.findMany({where:{id:{in:locked.map(t=>t.id)},status:'PENDING',startedAt:null,completedAt:null,hasManualOverride:false},include:{assignments:{where:{isCurrent:true}},_count:{select:{captureSessions:true,evidenceAssets:true,completionAttempts:true,areaSubmissions:true}}}});
    const eligible=candidates.filter(task=>!Object.values(task._count).some(Boolean)&&task.assignments.every(a=>a.status==='ASSIGNED'&&!a.startedAt));
    const changed:number[]=[];
    for(const task of eligible){
      if(task.staffId===staffId&&task.assignments.length===1&&task.assignments[0]!.staffId===staffId)continue;
      await tx.taskAssignment.updateMany({where:{taskInstanceId:task.id,isCurrent:true},data:{isCurrent:false,status:'REASSIGNED',reason:'TEMPLATE_STAFF_CHANGED',failedAt:now}});
      await tx.taskInstance.update({where:{id:task.id},data:{staffId}});
      const assignment=await tx.taskAssignment.create({data:{taskInstanceId:task.id,staffId,status:'ASSIGNED',isCurrent:true,assignedAt:now,reason:'MANAGER_TEMPLATE_ASSIGNMENT'}});
      await writeAuditLog({companyId:actor.companyId,actorType:actor.role,actorId:actor.id,entityType:'TASK_INSTANCE',entityId:task.id,action:'TEMPLATE_STAFF_ASSIGNMENT_SYNC',reason:'Manager selected staff for the schedule',oldValue:{staffId:task.staffId,assignmentIds:task.assignments.map(a=>a.id)},newValue:{staffId,assignmentId:assignment.id,templateId}},tx);
      changed.push(task.id);
    }
    const updated=await tx.taskTemplate.update({where:{id:templateId},data:{staffId}});
    await writeAuditLog({companyId:actor.companyId,actorType:actor.role,actorId:actor.id,entityType:'TASK_TEMPLATE',entityId:templateId,action:'ASSIGN_STAFF',oldValue:{staffId:template.staffId},newValue:{staffId,updatedTaskIds:changed,preservedTaskIds:candidates.filter(t=>!eligible.includes(t)).map(t=>t.id)}},tx);
    return {...updated,assignmentSync:{updatedTaskIds:changed,preservedTaskIds:candidates.filter(t=>!eligible.includes(t)).map(t=>t.id)}};
  },{maxWait:10000,timeout:30000});
}
