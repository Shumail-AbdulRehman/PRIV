import {prisma} from '../../prisma/prisma.js';
import {ApiError} from '../../utils/ApiError.js';
import {requireTaskAccess,type VerificationActor} from './authorization.service.js';
import {lockTask} from './captureSession.service.js';
import {checkedAttempt} from './sequentialPolicy.js';
import {finalizeTask} from './completion.service.js';
import {raiseIssue} from './exception.service.js';
import {writeAuditLog} from '../auditLog.service.js';
/** Staff submission is final for staff, while manager verification remains independently unresolved. */
export async function finishStaffSubmission(actor:VerificationActor,taskId:number){
 if(actor.role!=='STAFF')throw new ApiError(403,'Staff account required');
 return prisma.$transaction(async tx=>{
  await lockTask(tx,taskId);const task=await requireTaskAccess(actor,taskId,{},tx);
  if(task.staffSubmittedAt||task.status==='COMPLETED')return {id:taskId,status:'COMPLETED',staffSubmittedAt:task.staffSubmittedAt??task.completedAt};
  if(!['IN_PROGRESS','NOT_COMPLETED_INTIME'].includes(task.status))throw new ApiError(409,'Start this task before submitting it.');
  const requirements=await tx.taskEvidenceRequirement.findMany({where:{item:{taskInstanceId:taskId,mandatory:true},mandatory:true},include:{item:true}});
  if(!requirements.length||requirements.some(r=>!r.currentAttemptId))throw new ApiError(409,'Capture all required photos before finishing.',[{code:'MISSING_EVIDENCE'}]);
  const attempts=await tx.verificationAttempt.findMany({where:{id:{in:requirements.map(r=>r.currentAttemptId!)}},include:{media:true}});
  if(attempts.length!==requirements.length||attempts.some(a=>!a.receivedAt||!a.media||!checkedAttempt(a.state)))throw new ApiError(409,'Wait for all required photos to upload and finish checking.',[{code:'PHOTOS_NOT_CHECKED'}]);
  if(await tx.verificationJob.count({where:{attemptId:{in:attempts.map(a=>a.id)},state:{in:['PENDING','RUNNING','RETRY_WAIT']}}}))throw new ApiError(409,'Photo checks are still running.',[{code:'PHOTOS_NOT_CHECKED'}]);
  const sessionIds=[...new Set(attempts.map(a=>a.sessionId))];
  const sessions=await tx.captureSession.findMany({where:{id:{in:sessionIds}}});
  // A required room-context photo must have been received and checked, including preserved QR renewals.
  for(const session of sessions.filter(s=>s.contextStatus==='PENDING')){const contextSlots=await tx.captureSlot.findMany({where:{sessionId:session.id,contextKey:{not:null}},include:{attempt:true}});if(!contextSlots.length||contextSlots.some(slot=>!slot.attempt?.receivedAt||!slot.attempt.mediaAssetId||!checkedAttempt(slot.attempt.state)))throw new ApiError(409,'Finish the room photo check before submitting.',[{code:'CONTEXT_NOT_CHECKED'}]);}
  await finalizeTask(tx,taskId);
  const fresh=await tx.taskInstance.findUniqueOrThrow({where:{id:taskId}});
  if(fresh.status!=='COMPLETED'){
   const review=attempts.filter(a=>a.state!=='PASSED');
   if(!review.length)await raiseIssue(tx,taskId,'IDENTITY_UNCERTAIN');
   for(const attempt of review){const reason=(attempt.coverageResult as {originality?:{status?:string};result?:{reasonCode?:string}}|null)?.originality?.status==='SCREEN_RECAPTURE'?'PHOTO_OF_SCREEN':attempt.state==='SERVICE_FAILURE'?'SERVICE_FAILURE':attempt.state==='PRIVACY_HOLD'?'PRIVACY_HOLD':(attempt.cleanlinessResult as {policyDecisionReason?:string}|null)?.policyDecisionReason??'CANNOT_ASSESS';await raiseIssue(tx,taskId,reason,attempt.requirementId,attempt.id);}
  }
  const now=new Date();await tx.taskInstance.update({where:{id:taskId},data:{staffSubmittedAt:now,rowVersion:{increment:1}}});
  await tx.captureSession.updateMany({where:{taskInstanceId:taskId,state:{in:['ACTIVE','PAUSED']}},data:{state:'CLOSED',closedAt:now,rowVersion:{increment:1}}});
  await writeAuditLog({companyId:actor.companyId,actorType:'STAFF',actorId:actor.id,entityType:'TASK_INSTANCE',entityId:taskId,action:'STAFF_SUBMISSION_FINISHED',newValue:{submittedAt:now,managerReviewPending:fresh.status!=='COMPLETED'}},tx);
  return {id:taskId,status:'COMPLETED',staffSubmittedAt:now};
 },{maxWait:10000,timeout:30000});
}
