import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { requireTaskAccess, type VerificationActor } from './authorization.service.js';
import { lockTask, staffAttemptResult } from './captureSession.service.js';
import { inspectImage, sha256 } from './quality.service.js';
import { storePrivateImage } from './media.service.js';
import { originalPublicId } from './evidence.service.js';
import { BufferedClefProvider, bufferedEvaluatorVersion, type BufferedAssessment, type BufferedPhotoProvider } from './bufferedPhoto.provider.js';
import { bufferedDecision } from './photoResultPolicy.js';
import { autoPassAllowed } from './cleanliness.service.js';
import { applyDecision } from './photoDecision.service.js';
import { finalizeTask } from './completion.service.js';
import { reviewableMedia, photoStorageState } from './evidenceBuffer.js';
import { verificationEvent } from './latency.js';

const WORKFLOW = 'DIRECT_PHOTO_V1';
// A request owns this attempt only while its bounded AI/storage calls run.
// Expired ownership is reclaimed by a manual upload, never a background retry.
import {DIRECT_REQUEST_TTL_MS,directRequestExpired} from './directProcessing.js';
type Processing = { directProcessingToken?:string|null;directProcessingStartedAt?:Date|null;directAssessment?:unknown };
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;

export async function directPhotoStatus(actor: VerificationActor, id: string) {
  const a = await prisma.verificationAttempt.findUniqueOrThrow({where:{id},include:{session:true,media:true,requirement:{include:{item:true}}}});
  await requireTaskAccess(actor,a.session.taskInstanceId);
  return {attemptId:a.id,assetId:a.mediaAssetId,state:directRequestExpired(a)?'RESERVED':a.state,storage:photoStorageState(a.media),
    ...staffAttemptResult(a,reviewableMedia(a.media?.privacyState),a.requirement?.currentAttemptId===a.id?a.requirement.state:undefined,a.requirement?{fixtureType:a.requirement.item.typeSnapshot,viewKey:a.requirement.viewKey}:undefined)};
}

/** AI and conditional cloud storage finish in the upload request. No queue or disk buffer. */
export async function processDirectPhoto(actor: VerificationActor, attemptId: string, bytes: Buffer,
  provider: BufferedPhotoProvider = new BufferedClefProvider(), store = storePrivateImage) {
  if(actor.role!=='STAFF')throw new ApiError(403,'Staff account required');
  const initial=await prisma.verificationAttempt.findUniqueOrThrow({where:{id:attemptId},include:{session:true}});
  if(initial.staffId!==actor.id)throw new ApiError(404,'Capture not found');
  await requireTaskAccess(actor,initial.session.taskInstanceId,{staffMutation:true});
  if(sha256(bytes)!==initial.committedHash)throw new ApiError(409,'This photo changed before it finished uploading. Please take a new photo.');
  const info=await inspectImage(bytes), token=randomUUID(), started=Date.now();
  const claim=await prisma.$transaction(async tx=>{
    await lockTask(tx,initial.session.taskInstanceId);
    const a=await tx.verificationAttempt.findUniqueOrThrow({where:{id:attemptId},include:{media:true,session:true,requirement:{include:{item:true}}}});
    if(a.media&&['PASSED','REVIEW_REQUIRED','PRIVACY_HOLD','RECAPTURE_REQUIRED','CLEANING_REQUIRED'].includes(a.state))return {finished:true as const,attempt:a};
    const prior=a as Processing;
    if(prior.directProcessingToken&&started-+(prior.directProcessingStartedAt??new Date(0))<DIRECT_REQUEST_TTL_MS)
      throw new ApiError(409,'This photo is still being checked. Tap Check result before uploading again.',[{code:'PHOTO_PROCESSING'}]);
    const quality={...info.quality,workflow:WORKFLOW};
    await tx.verificationAttempt.update({where:{id:attemptId},data:{state:'CLEANLINESS_CHECK',receivedAt:a.receivedAt??new Date(started),directProcessingToken:token,directProcessingStartedAt:new Date(started),...(a.qualityResult===null?{qualityResult:json(quality)}:{})}});
    return {finished:false as const,attempt:a,quality};
  });
  if(claim.finished)return directPhotoStatus(actor,attemptId);
  try {
    const cached=claim.attempt.directAssessment as {assessment?:BufferedAssessment;evaluatorVersion?:string}|null;
    const evaluatorVersion=bufferedEvaluatorVersion();
    let assessment=cached?.evaluatorVersion===evaluatorVersion?cached.assessment:undefined;
    let decision:ReturnType<typeof bufferedDecision>;
    if(!info.quality.acceptable)decision={state:'RECAPTURE_REQUIRED',reason:info.quality.reasons?.[0]??'CANNOT_ASSESS',keep:false};
    else {
      assessment??=await provider.evaluate(info.sanitized,claim.attempt.requirement?.item.rubricSnapshot,claim.attempt.requirement?.viewKey,claim.attempt.requirement?.item.typeSnapshot);
      decision=bufferedDecision(assessment,!claim.attempt.requirement||autoPassAllowed(claim.attempt.requirement.item.typeSnapshot,
        (claim.attempt.requirement.item.rubricSnapshot as {version:number}).version),!!claim.attempt.requirement);
      await prisma.$transaction(async tx=>{
        await lockTask(tx,initial.session.taskInstanceId);
        const fresh=await tx.verificationAttempt.findUniqueOrThrow({where:{id:attemptId}});
        if(fresh.directProcessingToken!==token)throw new ApiError(409,'Photo processing changed. Refresh its result.',[{code:'PHOTO_PROCESSING'}]);
        await tx.verificationAttempt.update({where:{id:attemptId},data:{directAssessment:json({assessment,evaluatorVersion})}});
      });
    }
    const publicId=originalPublicId(actor.companyId,attemptId),reviewId=publicId.replace(/\/original$/,'/review');
    let cloudId:string|undefined;
    if(decision.keep){
      const uploaded=await Promise.all([store(bytes,publicId,info.sha256),store(info.sanitized,reviewId,sha256(info.sanitized))]);
      cloudId=uploaded[0]!.asset_id;
    }
    await prisma.$transaction(async tx=>{
      await lockTask(tx,initial.session.taskInstanceId);
      const fresh=await tx.verificationAttempt.findUniqueOrThrow({where:{id:attemptId},include:{session:{include:{task:true}}}});
      if(fresh.directProcessingToken!==token)throw new ApiError(409,'Photo processing changed. Refresh its result.',[{code:'PHOTO_PROCESSING'}]);
      const media=await tx.evidenceAsset.upsert({where:{originalPublicId:publicId},create:{
        companyId:actor.companyId,locationId:fresh.session.task.locationId,taskInstanceId:fresh.session.taskInstanceId,
        originalPublicId:publicId,sanitizedPublicId:decision.keep?reviewId:null,cloudinaryAssetId:cloudId,
        deliveryType:'authenticated',privacyState:decision.keep?'NOT_REQUIRED':'DISCARDED',
        format:info.format,bytes:info.bytes,width:info.width,height:info.height,sha256:info.sha256,normalizedHash:info.normalizedHash,perceptualHash:info.perceptualHash,
      },update:{}});
      await tx.verificationAttempt.update({where:{id:attemptId},data:{mediaAssetId:media.id,
        directProcessingToken:null,directProcessingStartedAt:null}});
      await applyDecision(tx,attemptId,decision.state,decision.reason,json({workflow:WORKFLOW,
        ...(claim.attempt.requirement?{photoContext:{fixtureType:claim.attempt.requirement.item.typeSnapshot,viewKey:claim.attempt.requirement.viewKey,...(assessment?.toiletStyle?{toiletStyle:assessment.toiletStyle}:{}),...(assessment?.missingSurfaces?.length?{missingSurfaces:assessment.missingSurfaces}:{})}}:{}),
        ...(assessment?.cleanliness?{result:assessment.cleanliness,metadata:assessment.metadata}:{})}));
      await finalizeTask(tx,initial.session.taskInstanceId);
    });
    verificationEvent('DIRECT_PHOTO_FINISHED',{attemptId,taskId:initial.session.taskInstanceId},{durationMs:Date.now()-started,state:decision.state});
    return directPhotoStatus(actor,attemptId);
  } catch(error) {
    // Leave no accepted evidence on failure. Staff must explicitly upload again.
    await prisma.$transaction(async tx=>{
      await lockTask(tx,initial.session.taskInstanceId);
      const a=await tx.verificationAttempt.findUniqueOrThrow({where:{id:attemptId}});
      if(a.directProcessingToken===token)await tx.verificationAttempt.update({where:{id:attemptId},data:{
        state:'RESERVED',directProcessingToken:null,directProcessingStartedAt:null}});
    });
    if(error instanceof ApiError)throw error;
    throw new ApiError(503,'We could not finish uploading or checking your photo. Check your internet and tap Upload again.',[{code:'PHOTO_UPLOAD_AGAIN',attemptId}]);
  }
}
