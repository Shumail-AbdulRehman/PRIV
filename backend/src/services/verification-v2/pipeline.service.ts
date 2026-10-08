import {requiredContextKeys} from './contextPolicy.js';
import {verificationEvent,jobTiming} from './latency.js';
import {spatialIdentity,spatialIdentityAction,type SpatialDecision} from './spatialIdentity.service.js';
import {spatialEvidenceSchema} from './spatial.contracts.js';
import {Prisma,type VerificationJob} from '@prisma/client';
import {prisma} from '../../prisma/prisma.js';
import {privateImageBytes} from './media.service.js';
import {inspectImage} from './quality.service.js';
import {ConfiguredImageProvider,ProviderServiceFailure,type ImageAssessmentProvider} from './provider.service.js';
import {assessPrivacy,assessCoverage} from './coverage.service.js';
import {autoPassAllowed,type CleanlinessProvider} from './cleanliness.service.js';
import {ClefCleanlinessProvider,clefEvaluatorVersion} from './clef.provider.js';
import {duplicateCandidates} from './duplicate.service.js';
import {publishJobResult,enqueueVerificationJob,type VerificationTransaction} from './jobQueue.service.js';
import {lockTask} from './captureSession.service.js';
import {raiseIssue} from './exception.service.js';
import {finalizeTask} from './completion.service.js';
import {resolvePolicy,requirementDecision} from './verificationPolicy.service.js';
export async function applyDecision(tx:VerificationTransaction,id:string,state:'PASSED'|'RECAPTURE_REQUIRED'|'CLEANING_REQUIRED'|'REVIEW_REQUIRED'|'PRIVACY_HOLD',reasonCode:string,cleanlinessAssessment?:Prisma.InputJsonObject){
 const initial=await tx.verificationAttempt.findUniqueOrThrow({where:{id},select:{session:{select:{taskInstanceId:true}}}});await lockTask(tx,initial.session.taskInstanceId);
 const a=await tx.verificationAttempt.findUniqueOrThrow({where:{id},include:{session:{include:{task:true}},slot:true}});
 const task=await tx.taskInstance.findUniqueOrThrow({where:{id:a.session.taskInstanceId},include:{location:{include:{company:true}}}});const completed=task.status==='COMPLETED';
 if(completed){
  await tx.verificationAttempt.update({where:{id},data:{state,...(cleanlinessAssessment&&a.cleanlinessResult===null?{cleanlinessResult:{...cleanlinessAssessment,policyDecisionReason:reasonCode}}:{})}});
  // Privacy publication already restricts media and links its serious issue.
  if(reasonCode==='DUPLICATE_EVIDENCE')await raiseIssue(tx,task.id,reasonCode,null,id);
  return;
 }
 const current=task.isActive&&task.assignmentEpoch===a.assignmentEpoch&&task.staffId===a.staffId&&a.session.state!=='REVOKED'&&['IN_PROGRESS','NOT_COMPLETED_INTIME'].includes(task.status);
 const staff=await tx.staff.findFirst({where:{id:a.staffId,isActive:true,locationId:task.locationId}}),area=await tx.area.findUniqueOrThrow({where:{id:a.session.areaId}});const allowed=current&&a.session.presenceStatus==='ACCEPTABLE'&&a.timingEvidence!=='UNCERTAIN'&&!!a.receivedAt&&a.receivedAt<=a.session.uploadExpiresAt&&!!staff&&task.location.isActive&&task.location.company.isActive&&area.qrVersion===a.session.qrVersion;
 const effective=state==='PRIVACY_HOLD'?state:allowed?state:'REVIEW_REQUIRED';
 const policyDecisionReason=effective==='PRIVACY_HOLD'?'PRIVACY_HOLD':!allowed?'STALE_ASSIGNMENT':reasonCode;
 await tx.verificationAttempt.update({where:{id},data:{state:effective,...(cleanlinessAssessment&&a.cleanlinessResult===null?{cleanlinessResult:{...cleanlinessAssessment,policyDecisionReason}}:{})}});
 if(a.requirementId){const r=await tx.taskEvidenceRequirement.findUniqueOrThrow({where:{id:a.requirementId}});if(r.currentAttemptId!==id||r.decisionVersion!==a.slot.generation||['PASSED','MANAGER_ACCEPTED','WAIVED'].includes(r.state))return;
  await tx.taskEvidenceRequirement.update({where:{id:r.id},data:{state:effective==='PRIVACY_HOLD'?'REVIEW_REQUIRED':effective,decisionVersion:{increment:1}}});
  const cleaning=effective==='CLEANING_REQUIRED',recapture=effective==='RECAPTURE_REQUIRED',policy=resolvePolicy(task.policySnapshot);
  const failures=cleaning||recapture?await tx.verificationAttempt.count({where:{requirementId:r.id,state:effective}}):0;
  if(!allowed||effective==='PRIVACY_HOLD'||effective==='REVIEW_REQUIRED'||cleaning&&failures>=policy.cleaningFailuresBeforeEscalation||recapture&&failures>=policy.recaptureFailuresBeforeEscalation)await raiseIssue(tx,task.id,!allowed?'STALE_ASSIGNMENT':reasonCode,r.id,id);
  else await tx.taskInstance.update({where:{id:task.id},data:{verificationState:effective==='PASSED'?'PROCESSING':'REWORK_REQUIRED'}});
  if(effective==='PASSED')await tx.verificationIssue.updateMany({where:{requirementId:r.id,reasonCode:{not:'PRIVACY_HOLD'}},data:{state:'RESOLVED',resolvedAt:new Date()}});
 }else{
  const latestSlot=await tx.captureSlot.findFirst({where:{sessionId:a.sessionId,contextKey:a.contextKey},orderBy:{generation:'desc'}});
  if(!latestSlot||latestSlot.generation!==a.slot.generation)return;
  const contexts=await tx.verificationAttempt.findMany({where:{sessionId:a.sessionId,contextKey:{not:null}},orderBy:{createdAt:'desc'}});const contextSlots=await tx.captureSlot.findMany({where:{sessionId:a.sessionId,contextKey:{not:null}},orderBy:{generation:'desc'}});
  const latestContexts=new Map<string,string|null>();for(const slot of contextSlots)if(slot.contextKey&&!latestContexts.has(slot.contextKey))latestContexts.set(slot.contextKey,slot.attemptId);
  const contextKeys=requiredContextKeys(a.session.locationCheck);
  const passed=contextKeys.every(key=>contexts.some(c=>c.id===latestContexts.get(key)&&c.state==='PASSED'));
  if(passed)await tx.captureSession.update({where:{id:a.sessionId},data:{contextAttemptIds:contextKeys.map(key=>latestContexts.get(key)!)} });
  await tx.captureSession.update({where:{id:a.sessionId},data:{contextStatus:passed?'ACCEPTABLE':effective==='PASSED'?'PENDING':'UNCERTAIN'}});
  const policy=resolvePolicy(task.policySnapshot);
  if(contextNeedsReview(effective,allowed,reasonCode,contexts.filter(c=>c.contextKey===a.contextKey&&c.state==='RECAPTURE_REQUIRED').length,policy.recaptureFailuresBeforeEscalation))await raiseIssue(tx,task.id,effective==='PRIVACY_HOLD'?'PRIVACY_HOLD':!allowed?'STALE_ASSIGNMENT':reasonCode,null,id);
 }
 // The publication transaction finalizes once after its stage and decision are recorded.
}
export async function processVerificationJob(job:VerificationJob,provider:ImageAssessmentProvider=new ConfiguredImageProvider(),read:typeof privateImageBytes=privateImageBytes,cleanlinessProvider:CleanlinessProvider=new ClefCleanlinessProvider()){
 const stageStarted=Date.now();const measurements:Record<string,unknown>={...jobTiming(job.result),stageStartedAt:new Date().toISOString()};
 const timed=async<T>(name:string,work:()=>Promise<T>)=>{const start=Date.now();measurements[name+'StartedAt']=new Date(start).toISOString();verificationEvent(name.toUpperCase()+'_STARTED',{attemptId:job.attemptId,jobId:job.id,stage:job.stage});try{return await work();}finally{measurements[name+'Ms']=Date.now()-start;measurements[name+'CompletedAt']=new Date().toISOString();verificationEvent(name.toUpperCase()+'_COMPLETED',{attemptId:job.attemptId,jobId:job.id,stage:job.stage},{durationMs:measurements[name+'Ms']});}};
 if(!await prisma.verificationJob.findFirst({where:{id:job.id,state:'RUNNING',leaseToken:job.leaseToken,leaseUntil:{gt:new Date()}},select:{id:true}}))return false;
 const successful=await prisma.verificationJob.findMany({where:{attemptId:job.attemptId,stage:job.stage,state:'SUCCEEDED'},select:{evaluatorVersion:true}});
 if(successful.some(j=>j.evaluatorVersion===job.evaluatorVersion))return false;
 const recheck=successful.length>0;
 const a=await prisma.verificationAttempt.findUniqueOrThrow({where:{id:job.attemptId},include:{media:true,session:true,requirement:{include:{item:true}}}});if(!a.media||a.media.companyId!==job.companyId||a.media.deliveryType!=='authenticated'||!a.media.sanitizedPublicId)throw new Error('EVIDENCE_NOT_READY');
 const stageState=job.stage==='COVERAGE'?'COVERAGE_CHECK':job.stage==='CLEANLINESS'?'CLEANLINESS_CHECK':'QUALITY_CHECK';
 await prisma.verificationAttempt.updateMany({where:{id:a.id,state:{notIn:['PASSED','RECAPTURE_REQUIRED','CLEANING_REQUIRED','REVIEW_REQUIRED','PRIVACY_HOLD','SERVICE_FAILURE']}},data:{state:stageState}});
 measurements.preparationMs=Date.now()-stageStarted;
 const image=job.stage==='QUALITY'?null:await timed('mediaRead',()=>read(a.media!.sanitizedPublicId!, 'jpg'));
 let result:unknown,next:string|null=null,decision:null|{state:'PASSED'|'RECAPTURE_REQUIRED'|'CLEANING_REQUIRED'|'REVIEW_REQUIRED'|'PRIVACY_HOLD';reason:string}=null;
 if(job.stage==='QUALITY'){const cached=(job.result as {qualityAtIngestion?:Record<string,unknown>}|null)?.qualityAtIngestion;
  if(job.evaluatorVersion==='quality-v1'&&cached?.version==='quality-thresholds-v1'&&cached?.hashAlgorithmVersion==='dct64-v1')result={...cached,evaluatorVersion:job.evaluatorVersion,source:'SERVER_INGESTION'};
  else {const info=await timed('quality',async()=>inspectImage(await read(a.media!.originalPublicId,a.media!.format)));result={...info.quality,hashVariants:info.hashVariants,evaluatorVersion:job.evaluatorVersion};}next='PRIVACY';}
 else if(job.stage==='PRIVACY'){const assessment=await timed('provider',()=>assessPrivacy(provider,image!));result=assessment;if(assessment.result.status==='SAFE'){const quality=a.qualityResult as {acceptable?:boolean;reasons?:string[]}|null;if(quality?.acceptable===true)next='COVERAGE';else decision={state:'RECAPTURE_REQUIRED',reason:quality?.reasons?.[0]??'CANNOT_ASSESS'};}else decision={state:'PRIVACY_HOLD',reason:'PRIVACY_HOLD'};}
 else if(job.stage==='COVERAGE'){
  if(a.media.privacyState!=='SAFE'||(a.qualityResult as {acceptable?:boolean}|null)?.acceptable!==true)throw new Error('PRIVACY_NOT_CLEARED');
  const duplicate=await timed('duplicate',()=>duplicateCandidates(a.media!.id,job.companyId,a.session.taskInstanceId,a.requirement?.item.typeSnapshot));
  if(duplicate.exact.length){result={duplicate};decision={state:'REVIEW_REQUIRED',reason:'DUPLICATE_EVIDENCE'};}
  else {const contextSlots=await prisma.captureSlot.findMany({where:{sessionId:a.sessionId,contextKey:{not:null}},orderBy:{generation:'desc'}});
   const latestContextIds=new Map<string,string|null>();for(const slot of contextSlots)if(slot.contextKey&&!latestContextIds.has(slot.contextKey))latestContextIds.set(slot.contextKey,slot.attemptId);
   const contexts=await prisma.verificationAttempt.findMany({where:{id:{in:[...latestContextIds.values()].filter((id):id is string=>!!id)},sessionId:a.sessionId,contextKey:{not:null},state:'PASSED',media:{privacyState:'SAFE'}},include:{media:true},orderBy:{contextKey:'asc'},take:2});
   const contextBytes=await Promise.all(contexts.map(c=>read(c.media!.sanitizedPublicId!,'jpg')));
   const candidates=duplicate.candidates.filter(c=>duplicate.near.includes(c.id)&&c.privacyState==='SAFE').slice(0,3);const candidateBytes=await Promise.all(candidates.map(c=>read(c.sanitizedPublicId!,'jpg')));
   const coverage=await timed('provider',()=>assessCoverage(provider,image!,a.requirement?{fixture:a.requirement.item.typeSnapshot,itemCodeSnapshot:a.requirement.item.itemCodeSnapshot,nameSnapshot:a.requirement.item.nameSnapshot,sourceAreaItemId:a.requirement.item.sourceAreaItemId,identity:a.requirement.item.identificationSnapshot,order:a.requirement.item.orderSnapshot,view:a.requirement.viewKey}: {contextKey:a.contextKey},contextBytes,candidateBytes));result={...coverage,duplicate};
   if(coverage.result.privacyFlag)decision={state:'PRIVACY_HOLD',reason:'PRIVACY_HOLD'};
   else if(coverage.result.verdict!=='MATCH'||!coverage.result.identityConsistent)decision={state:'RECAPTURE_REQUIRED',reason:coverage.result.verdict==='MATCH'?'IDENTITY_UNCERTAIN':coverage.result.reasonCode};
   else if(a.requirement)next='CLEANLINESS';else decision={state:'PASSED',reason:'CLEAN'};
  }
 }else if(job.stage==='CLEANLINESS'){
  if(!a.requirement||a.media.privacyState!=='SAFE'||(a.qualityResult as {acceptable?:boolean}|null)?.acceptable!==true)throw new Error('INVALID_CONTROLLED_CAPTURE');const coverage=a.coverageResult as any;if(coverage?.result?.verdict!=='MATCH'||!coverage.result.identityConsistent||coverage.result.privacyFlag)throw new Error('INVALID_CONTROLLED_CAPTURE');
  if(cleanlinessProvider instanceof ClefCleanlinessProvider&&job.evaluatorVersion!==clefEvaluatorVersion())throw new Error('PROVIDER_CONFIGURATION_CHANGED');
  if(!Array.isArray((a.duplicateResult as any)?.exact)||!Array.isArray(coverage.duplicate?.exact)||(a.duplicateResult as any).exact.length||coverage.duplicate.exact.length)throw new Error('INVALID_CONTROLLED_CAPTURE');
  const assessment=await timed('provider',()=>cleanlinessProvider.evaluate(image!,a.requirement!.item.rubricSnapshot,a.requirement!.viewKey,a.requirement!.item.typeSnapshot));
  // A new photograph cannot fix missing calibration or a malformed service response.
  // Keep the adapter's conservative outcome for evaluation, but classify operational
  // processing failures separately so the queue retries the same saved evidence.
  if(assessment.result.details?.assessmentStatus==='THRESHOLD_UNCONFIGURED')throw new ProviderServiceFailure('PROVIDER_THRESHOLD_NOT_CONFIGURED',{...assessment.metadata,assessmentStatus:'THRESHOLD_UNCONFIGURED'});
  if(assessment.result.details?.assessmentStatus==='INVALID_RESPONSE')throw new ProviderServiceFailure('PROVIDER_MALFORMED',{...assessment.metadata,assessmentStatus:'INVALID_RESPONSE'});
  result={...assessment,rubricVersion:(a.requirement.item.rubricSnapshot as {version:number}).version};const state=requirementDecision({qualityPass:true,coverage:'MATCH',cleanliness:assessment.result.verdict,surfaceVerdicts:assessment.result.surfaces.map(s=>s.verdict)});
  const held=state==='PASSED'&&!autoPassAllowed(a.requirement.item.typeSnapshot,(a.requirement.item.rubricSnapshot as {version:number}).version);
  decision={state:held?'REVIEW_REQUIRED':state as 'PASSED'|'RECAPTURE_REQUIRED'|'CLEANING_REQUIRED'|'REVIEW_REQUIRED',reason:held?'AUTO_PASS_NOT_VALIDATED':assessment.result.verdict==='CANNOT_ASSESS'?'CANNOT_ASSESS':state==='PASSED'?'CLEAN':assessment.result.reasonCode};
 }else throw new Error('UNSUPPORTED_STAGE');
 measurements.stageExecutionMs=Date.now()-stageStarted;
 result={...(result as object),timing:measurements,evaluatorVersion:job.evaluatorVersion,retryCount:Math.max(0,job.attempts-1),status:'SUCCEEDED'};
 const publicationStarted=Date.now();
 const published=await publishJobResult(job,JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue,async tx=>{
  await lockTask(tx,a.session.taskInstanceId);
  const privacyHold=job.stage==='PRIVACY'&&(result as any)?.result?.status!=='SAFE'||job.stage==='COVERAGE'&&(result as any)?.result?.privacyFlag===true;
  if(privacyHold){await tx.evidenceAsset.update({where:{id:a.media!.id},data:{privacyState:'HOLD'}});await raiseIssue(tx,a.session.taskInstanceId,'PRIVACY_HOLD',a.requirementId,a.id);}
  // Versioned rechecks retain job history without replacing canonical assessments or applying decisions.
  if(recheck||await tx.verificationJob.findFirst({where:{attemptId:a.id,stage:job.stage,state:'SUCCEEDED',id:{not:job.id}},select:{id:true}})){await finalizeTask(tx,a.session.taskInstanceId);return;}
  if(job.stage==='COVERAGE'&&(result as any)?.result?.privacyFlag)await tx.evidenceAsset.update({where:{id:a.media!.id},data:{privacyState:'HOLD'}});
  let spatial:SpatialDecision|undefined;
  if(job.stage==='COVERAGE'&&a.requirement){
    const spatialStarted=Date.now();
    const task=await tx.taskInstance.findUniqueOrThrow({where:{id:a.session.taskInstanceId}});
    const spatialPolicy=resolvePolicy(task.policySnapshot).spatial;
    const prior=await tx.verificationAttempt.findMany({where:{sessionId:a.sessionId,id:{not:a.id},requirementId:{not:null},media:{privacyState:'SAFE'},spatialEvidence:{not:Prisma.DbNull}},include:{requirement:true}});
    const observations=prior.flatMap(p=>{
      const parsed=spatialEvidenceSchema.safeParse(p.spatialEvidence);
      const coverage=p.coverageResult as {result?:{verdict?:string;identityConsistent?:boolean}}|null;
      const credited=p.requirement?.currentAttemptId===p.id&&['PASSED','MANAGER_ACCEPTED'].includes(p.requirement.state);
      const evaluationOnly=spatialPolicy.mode==='EVALUATE'&&coverage?.result?.verdict==='MATCH'&&coverage.result.identityConsistent===true;
      return parsed.success&&p.requirement&&(credited||evaluationOnly)?[{attemptId:p.id,fixtureId:p.requirement.taskVerificationItemId,observation:parsed.data}]:[];
    });
    spatial=spatialIdentity(a.spatialEvidence,a.requirement.taskVerificationItemId,observations,spatialPolicy);
    const duplicate=(result as any)?.duplicate;
    const coverage=(result as any)?.result;
    const nearMatchedPosition=spatial.comparisons.some(c=>c.reliable&&c.pointDistanceMeters!==null&&c.pointDistanceMeters<=spatialPolicy.samePositionMeters&&prior.some(p=>p.id===c.attemptId&&p.mediaAssetId&&duplicate?.near?.includes(p.mediaAssetId)));
    const action=spatialIdentityAction({decision:spatial,exactDuplicate:!!duplicate?.exact?.length,nearMatchedPosition,coverageMatch:coverage?.verdict==='MATCH',identityConsistent:coverage?.identityConsistent===true,contextAcceptable:a.session.contextStatus==='ACCEPTABLE'},process.env.VERIFICATION_SPATIAL_RECAPTURE_ENABLED==='true');
    verificationEvent('SPATIAL_COMPLETED',{taskId:a.session.taskInstanceId,sessionId:a.sessionId,attemptId:a.id,jobId:job.id,stage:job.stage},{durationMs:Date.now()-spatialStarted});
    if(action==='TARGETED_IDENTITY_RECAPTURE'&&decision?.state!=='PRIVACY_HOLD'){next=null;decision={state:'RECAPTURE_REQUIRED',reason:'FIXTURE_POSITION_TOO_CLOSE_TO_PREVIOUS'};}
  }
  const fields=job.stage==='QUALITY'?{qualityResult:result as Prisma.InputJsonValue}:job.stage==='COVERAGE'?{coverageResult:result as Prisma.InputJsonValue,duplicateResult:(result as any).duplicate,...(spatial?{spatialDecision:spatial as unknown as Prisma.InputJsonValue}:{})}:job.stage==='CLEANLINESS'?{cleanlinessResult:result as Prisma.InputJsonValue}:{};
  if(job.stage==='QUALITY')await tx.verificationAttempt.updateMany({where:{id:a.id,qualityResult:{equals:Prisma.DbNull}},data:fields});
  else if(job.stage==='COVERAGE')await tx.verificationAttempt.updateMany({where:{id:a.id,coverageResult:{equals:Prisma.DbNull}},data:fields});
  else if(job.stage==='CLEANLINESS'&&!decision)await tx.verificationAttempt.updateMany({where:{id:a.id,cleanlinessResult:{equals:Prisma.DbNull}},data:fields});
  if(job.stage==='PRIVACY')await tx.evidenceAsset.update({where:{id:a.media!.id},data:{privacyState:(result as any)?.result?.status==='SAFE'?'SAFE':'HOLD'}});
  if(next)await enqueueVerificationJob(tx,{companyId:job.companyId,attemptId:a.id,stage:next,evaluatorVersion:next==='CLEANLINESS'?clefEvaluatorVersion():`${next.toLowerCase()}-v1`});
  if(decision)await applyDecision(tx,a.id,decision.state,decision.reason,job.stage==='CLEANLINESS'?result as Prisma.InputJsonObject:undefined);
  // Manager acceptance or a newer generation may make applyDecision a no-op.
  // Successful job publication must still clear the pending-job completion gate.
  await finalizeTask(tx,a.session.taskInstanceId);
 });
 verificationEvent('POLICY_COMMITTED',{taskId:a.session.taskInstanceId,sessionId:a.sessionId,attemptId:a.id,jobId:job.id,stage:job.stage},{...measurements,publicationMs:Date.now()-publicationStarted,totalMs:Date.now()-stageStarted,published});
 return published;
}

export function contextNeedsReview(state:string,authorityValid:boolean,reason:string,failures:number,threshold:number){
 return !authorityValid||state==='PRIVACY_HOLD'||state==='REVIEW_REQUIRED'||['DUPLICATE_EVIDENCE','STALE_ASSIGNMENT','PRIVACY_HOLD'].includes(reason)||state!=='PASSED'&&failures>=threshold;
}
