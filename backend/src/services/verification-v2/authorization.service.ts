import type { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
export type VerificationActor = {id:number;companyId:number;role:'ADMIN'|'MANAGER'|'STAFF';locationIds?:number[];locationId?:number|null};
type Db = import('./jobQueue.service.js').VerificationTransaction;
const defaultDb = prisma as unknown as Db;
export function requireOperationalRole(actor:VerificationActor) {
 if (!['ADMIN','MANAGER'].includes(actor.role)) throw new ApiError(403,'Manager or admin account required');
}
export async function requireActiveActor(actor:VerificationActor,db:Db=defaultDb) {
 const user = actor.role==='STAFF'
  ? await db.staff.findFirst({where:{id:actor.id,companyId:actor.companyId,role:'STAFF',isActive:true,company:{isActive:true}}})
  : await db.manager.findFirst({where:{id:actor.id,companyId:actor.companyId,role:actor.role,isActive:true,company:{isActive:true}}});
 if (!user) throw new ApiError(403,'Active account required');
 return user;
}
export async function requireLocationAccess(actor:VerificationActor,id:number,db:Db=defaultDb) {
 await requireActiveActor(actor,db);
 const location=await db.location.findFirst({where:{id,companyId:actor.companyId}});
 if(!location) throw new ApiError(404,'Location not found');
 if(actor.role==='MANAGER' && !await db.managerLocation.findUnique({where:{managerId_locationId:{managerId:actor.id,locationId:id}}})) throw new ApiError(403,'Location access denied');
 if(actor.role==='STAFF' && !await db.staff.findFirst({where:{id:actor.id,locationId:id,isActive:true,companyId:actor.companyId}})) throw new ApiError(403,'Location access denied');
 return location;
}
export async function requireAreaAccess(actor:VerificationActor,id:number,db:Db=defaultDb) {
 const area=await db.area.findUnique({where:{id},include:{location:true}});
 if(!area||area.location.companyId!==actor.companyId) throw new ApiError(404,'Area not found');
 await requireLocationAccess(actor,area.locationId,db);return area;
}
export async function requireTaskAccess(actor:VerificationActor,id:number,options:{staffMutation?:boolean}={},db:Db=defaultDb) {
 if(options.staffMutation&&actor.role!=='STAFF') throw new ApiError(403,'Staff account required');
 await requireActiveActor(actor,db);
 const task=await db.taskInstance.findUnique({where:{id},include:{location:true,assignments:{where:{OR:[{isCurrent:true},...(actor.role==='STAFF'&&!options.staffMutation?[{staffId:actor.id,status:'COMPLETED' as const}]:[])]}}}});
 if(!task||task.location.companyId!==actor.companyId) throw new ApiError(404,'Task not found');
 if(actor.role==='STAFF') {
  const location=await requireLocationAccess(actor,task.locationId,db);
  if(options.staffMutation&&!location.isActive)throw new ApiError(403,'Location is inactive');
  if(!task.isActive||task.staffId!==actor.id||!task.assignments.some(a=>a.staffId===actor.id&&((a.isCurrent!==false&&!['CANCELLED','REASSIGNED'].includes(a.status))||(!options.staffMutation&&task.status==='COMPLETED'&&a.status==='COMPLETED')))) throw new ApiError(403,'Current active assignment required');
 } else await requireLocationAccess(actor,task.locationId,db);
 return task;
}
export async function requireAssignmentAccess(actor:VerificationActor,taskId:number,assignmentId:number,epoch:number,db:Db=defaultDb) {
 const task=await requireTaskAccess(actor,taskId,{staffMutation:true},db);
 const assignment=task.assignments.find(a=>a.id===assignmentId&&a.staffId===actor.id);
 if(task.assignmentEpoch!==epoch||!assignment||!['ASSIGNED','STARTED'].includes(assignment.status)) throw new ApiError(409,'Assignment changed');
 return {task,assignment};
}
