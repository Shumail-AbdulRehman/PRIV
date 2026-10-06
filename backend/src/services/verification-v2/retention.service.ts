import {prisma} from '../../prisma/prisma.js';
import {ApiError} from '../../utils/ApiError.js';
import {writeAuditLog} from '../auditLog.service.js';
import {requireOperationalRole,requireLocationAccess,requireActiveActor,type VerificationActor} from './authorization.service.js';
import type {VerificationTransaction} from './jobQueue.service.js';
export type RetainedEntity='location'|'staff'|'manager'|'taskTemplate';
export async function assertDeletionAllowed(tx:VerificationTransaction,entity:RetainedEntity,id:number) {
 let retained=false;
 if(entity==='location')retained=await tx.area.count({where:{locationId:id}})>0||await tx.evidenceAsset.count({where:{locationId:id}})>0||await tx.verificationException.count({where:{locationId:id}})>0;
 if(entity==='taskTemplate')retained=await tx.taskTemplateItem.count({where:{templateId:id}})>0||await tx.taskInstance.count({where:{templateId:id,verificationVersion:2}})>0;
 if(entity==='staff')retained=await tx.captureSession.count({where:{staffId:id}})>0||await tx.verificationAttempt.count({where:{staffId:id}})>0||await tx.taskAssignment.count({where:{staffId:id,taskInstance:{verificationVersion:2}}})>0;
 if(entity==='manager')retained=await tx.verificationDecision.count({where:{actorManagerId:id}})>0||await tx.areaStandardPhoto.count({where:{createdByManagerId:id}})>0||await tx.exceptionReadReceipt.count({where:{managerId:id}})>0;
 if(retained)throw new ApiError(409,'Verification history is retained. Archive or deactivate this record instead.',[{code:'EVIDENCE_RETAINED',archivePath:`/${entity==='taskTemplate'?'task-template':entity}/${id}/archive`}]);
}
export async function archiveRetainedEntity(entity:RetainedEntity,id:number,actor:VerificationActor) {
 requireOperationalRole(actor);await requireActiveActor(actor);
 if((entity==='location'||entity==='manager')&&actor.role!=='ADMIN')throw new ApiError(403,'Admin account required');
 return prisma.$transaction(async tx=>{
  let locationId:number|null=null;
  if(entity==='location'){const row=await tx.location.findFirst({where:{id,companyId:actor.companyId}});if(!row)throw new ApiError(404,'Location not found');locationId=row.id;}
  if(entity==='taskTemplate'){const row=await tx.taskTemplate.findFirst({where:{id,location:{companyId:actor.companyId}}});if(!row)throw new ApiError(404,'Task schedule not found');locationId=row.locationId;}
  if(entity==='staff'){const row=await tx.staff.findFirst({where:{id,companyId:actor.companyId}});if(!row)throw new ApiError(404,'Staff not found');locationId=row.locationId;if(locationId===null&&actor.role==='MANAGER')throw new ApiError(403,'Staff location access required');}
  if(entity==='manager'){if(id===actor.id)throw new ApiError(400,'You cannot deactivate your own account');if(!await tx.manager.findFirst({where:{id,companyId:actor.companyId,role:'MANAGER'}}))throw new ApiError(404,'Manager not found');}
  if(locationId!==null)await requireLocationAccess(actor,locationId);
  if(entity==='location')await tx.location.update({where:{id},data:{isActive:false}});
  if(entity==='staff')await tx.staff.update({where:{id},data:{isActive:false,refreshToken:null}});
  if(entity==='manager')await tx.manager.update({where:{id},data:{isActive:false,refreshToken:null}});
  if(entity==='taskTemplate')await tx.taskTemplate.update({where:{id},data:{isActive:false}});
  if(entity==='location'||entity==='staff')await tx.captureSession.updateMany({where:{state:{in:['ACTIVE','PAUSED']},...(entity==='staff'?{staffId:id}:{task:{locationId:id}})},data:{state:'REVOKED',closedAt:new Date(),rowVersion:{increment:1}}});
  await writeAuditLog({companyId:actor.companyId,actorType:actor.role,actorId:actor.id,entityType:entity,entityId:id,action:'ARCHIVE',reason:'Preserve inventory verification history'},tx);
  return {id,isActive:false,evidenceRetained:true};
 });
}
