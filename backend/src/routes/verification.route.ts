import { verificationCapabilities,requireNativeVerification } from '../services/verification-v2/compatibility.service.js';
import {Router} from 'express';
import multer from 'multer';
import {z} from 'zod';
import {prisma} from '../prisma/prisma.js';
import {verifyJwt} from '../middlewares/auth.middleware.js';
import {ApiError} from '../utils/ApiError.js';
import {requireActiveActor,requireTaskAccess,requireOperationalRole} from '../services/verification-v2/authorization.service.js';
import {createCaptureSession,resumeSession,reserveAttempt,retakeSlots,authorizedSession,staffAttemptResult} from '../services/verification-v2/captureSession.service.js';
import {storeReservedEvidence} from '../services/verification-v2/evidence.service.js';
import {sha256} from '../services/verification-v2/quality.service.js';
import {verificationManifestSchema} from '../services/verification-v2/contracts.js';
import {resolvePolicy,taskDeadlines} from '../services/verification-v2/verificationPolicy.service.js';
const router=Router();router.use(verifyJwt);
router.get('/verification-capabilities',async(req,res)=>{await requireActiveActor(req.user!);res.json({success:true,data:verificationCapabilities()});});
router.use((req,res,next)=>{if(req.method==='POST'&&(/^\/capture-session\//.test(req.path)||/\/capture-sessions$/.test(req.path)))return requireNativeVerification(req,res,next);next();});
const send=(res:any,data:unknown,status=200)=>res.status(status).json({success:true,data:JSON.parse(JSON.stringify(data,(_k,v)=>typeof v==='bigint'?v.toString():v))});
router.get('/task-instance/staff/me/verification-work',async(req,res)=>{
 const actor=req.user!;if(actor.role!=='STAFF')throw new ApiError(403,'Staff required');await requireActiveActor(actor);const staff=await prisma.staff.findFirstOrThrow({where:{id:actor.id,companyId:actor.companyId,isActive:true},select:{locationId:true}});
 const cursor=req.query.cursor?z.coerce.number().int().positive().parse(req.query.cursor):undefined;
 const tasks=await prisma.taskInstance.findMany({where:{staffId:actor.id,locationId:staff.locationId??-1,location:{companyId:actor.companyId,isActive:true},verificationVersion:2,isActive:true,status:{in:['IN_PROGRESS','NOT_COMPLETED_INTIME','PENDING']},assignments:{some:{staffId:actor.id,isCurrent:true,status:{in:['ASSIGNED','STARTED']}}},...(cursor?{id:{gt:cursor}}:{})},orderBy:{id:'asc'},take:51,select:{id:true,title:true,verificationVersion:true,areaId:true,areaNameSnapshot:true,status:true,verificationState:true,completionOutcome:true,assignmentEpoch:true,shiftStart:true,shiftEnd:true,verificationDeadline:true,uploadDeadline:true,location:{select:{id:true,name:true,timezone:true}}}});
 send(res,{workflowVersion:2,tasks:tasks.slice(0,50),nextCursor:tasks.length>50?tasks[49]!.id:null});
});
router.get('/task-instance/:taskId/verification',async(req,res)=>{
 const task=await requireTaskAccess(req.user!,z.coerce.number().int().positive().parse(req.params.taskId));
 if(task.verificationVersion!==2)throw new ApiError(409,'Inventory verification required');
 const [items,pendingJobs,caseSummary,sessions]=await Promise.all([
 prisma.taskVerificationItem.findMany({where:{taskInstanceId:task.id},include:{requirements:true},orderBy:{orderSnapshot:'asc'}}),
 prisma.verificationJob.count({where:{attempt:{session:{taskInstanceId:task.id}},state:{in:['PENDING','RUNNING','RETRY_WAIT']}}}),
 prisma.verificationException.findUnique({where:{taskInstanceId:task.id},select:{id:true,state:true,priority:true,rowVersion:true,updatedAt:true,issues:{where:{state:{not:'RESOLVED'}},select:{id:true,requirementId:true,reasonCode:true,state:true,recommendedAction:true}}}}),
 prisma.captureSession.findMany({where:{taskInstanceId:task.id},orderBy:{issuedAt:'desc'},take:20,select:{id:true,state:true,assignmentEpoch:true,captureExpiresAt:true,uploadExpiresAt:true,presenceStatus:true,contextStatus:true,slots:{where:{contextKey:{not:null}},orderBy:{generation:'desc'},select:{id:true,contextKey:true,generation:true,sequence:true,expiresAt:true,attemptId:true}},attempts:{where:{contextKey:{not:null}},select:{id:true,slotId:true,state:true}}}})
 ]);
 const base=verificationManifestSchema.parse({workflowVersion:2,taskId:task.id,areaId:task.areaId,areaName:task.areaNameSnapshot,inventoryVersion:task.inventoryVersion,assignmentEpoch:task.assignmentEpoch,locationTimezone:task.location.timezone,items:items.map(i=>({id:i.id,name:i.nameSnapshot,mandatory:i.mandatory,state:i.state,requirements:i.requirements.map(r=>({id:r.id,viewKey:r.viewKey,instructions:r.instructionsSnapshot,mandatory:r.mandatory,state:r.state,decisionVersion:r.decisionVersion}))}))});
 const deadlines=taskDeadlines(task.shiftEnd,resolvePolicy(task.policySnapshot)),verificationDeadline=task.verificationDeadline??deadlines.verificationDeadline,uploadDeadline=task.uploadDeadline??deadlines.uploadDeadline,now=new Date();
 const current=task.isActive&&task.location.isActive&&req.user!.role==='STAFF'&&task.assignments.some(a=>a.staffId===req.user!.id&&a.isCurrent&&['ASSIGNED','STARTED'].includes(a.status));
 const canCapture=current&&!!task.startedAt&&['IN_PROGRESS','NOT_COMPLETED_INTIME'].includes(task.status)&&now<verificationDeadline;
 const live=sessions.find(s=>s.assignmentEpoch===task.assignmentEpoch&&['ACTIVE','PAUSED'].includes(s.state));
 const captureDeadline=live&&live.captureExpiresAt<verificationDeadline?live.captureExpiresAt:verificationDeadline;
 const deadlineWarning=canCapture&&captureDeadline>now&&+captureDeadline-+now<=5*60000?{reasonCode:'CAPTURE_WINDOW_ENDING',deadline:captureDeadline,remainingSeconds:Math.ceil((+captureDeadline-+now)/1000)}:undefined;
 const attemptIds=items.flatMap(i=>i.requirements.map(r=>r.currentAttemptId)).filter((id):id is string=>!!id);
 const attempts=await prisma.verificationAttempt.findMany({where:{id:{in:attemptIds}},include:{media:{select:{privacyState:true}}}});
 send(res,{...base,task:{id:task.id,title:task.title,status:task.status,verificationVersion:2,verificationState:task.verificationState,completionOutcome:task.completionOutcome,completionTiming:task.completionTiming,areaNameSnapshot:task.areaNameSnapshot,shiftEnd:task.shiftEnd,verificationDeadline,uploadDeadline,location:{id:task.location.id,name:task.location.name,timezone:task.location.timezone}},
 items:base.items.map(i=>({...i,...{itemCodeSnapshot:items.find(x=>x.id===i.id)!.itemCodeSnapshot,typeSnapshot:items.find(x=>x.id===i.id)!.typeSnapshot,orderSnapshot:items.find(x=>x.id===i.id)!.orderSnapshot,identificationSnapshot:items.find(x=>x.id===i.id)!.identificationSnapshot},requirements:i.requirements.map(r=>{const a=attempts.find(a=>a.id===items.flatMap(i=>i.requirements).find(x=>x.id===r.id)?.currentAttemptId);return {...r,currentAttempt:a?{id:a.id,state:a.state,...staffAttemptResult(a,a.media?.privacyState==='SAFE')}:null};})})),spatialCaptureEnabled:resolvePolicy(task.policySnapshot).spatial.mode!=='OFF',serverTime:now,deadlineWarning,verificationState:task.verificationState,outcome:task.completionOutcome,verificationDeadline,uploadDeadline,pendingJobs,caseSummary,
 allowedActions:{createSession:canCapture&&!live,resumeSession:current&&!!live,renewSession:canCapture&&!!live,retakeSlots:canCapture&&live?.state==='ACTIVE'&&live.captureExpiresAt>now,upload:current&&task.status!=='COMPLETED',uploadReviewOnly:current&&now>=uploadDeadline,reportIssue:current&&task.status!=='COMPLETED'},
 sessions:sessions.map(s=>({...s,slots:s.slots.map(slot=>({...slot,state:s.attempts.find(a=>a.id===slot.attemptId)?.state??'AVAILABLE'})),attempts:undefined}))});
});
// Explicit evaluation export, scoped to operational roles; no photos, GPS, tokens or AR maps.
router.get('/task-instance/:taskId/verification/spatial-evaluation',async(req,res)=>{
 requireOperationalRole(req.user!);
 const task=await requireTaskAccess(req.user!,z.coerce.number().int().positive().parse(req.params.taskId));
 const cursor=z.uuid().optional().parse(req.query.cursor);
 if(cursor&&!await prisma.verificationAttempt.findFirst({where:{id:cursor,session:{taskInstanceId:task.id}}}))throw new ApiError(404,'Evaluation cursor not found');
 const rows=await prisma.verificationAttempt.findMany({where:{session:{taskInstanceId:task.id}},orderBy:[{createdAt:'asc'},{id:'asc'}],take:101,...(cursor?{cursor:{id:cursor},skip:1}:{}),select:{id:true,sessionId:true,requirementId:true,contextKey:true,spatialEvidence:true,spatialDecision:true,coverageResult:true,duplicateResult:true,state:true}});
 send(res,{version:1,autoIdentityAcceptance:false,policy:resolvePolicy(task.policySnapshot).spatial,attempts:rows.slice(0,100).map(a=>({id:a.id,sessionId:a.sessionId,requirementId:a.requirementId,contextKey:a.contextKey,state:a.state,spatialEvidence:a.spatialEvidence,spatialDecision:a.spatialDecision,coverage:(a.coverageResult as {result?:{verdict?:string;identityConsistent?:boolean}}|null)?.result?{verdict:(a.coverageResult as any).result.verdict,identityConsistent:(a.coverageResult as any).result.identityConsistent}:null,duplicate:a.duplicateResult,humanGroundTruth:'UNKNOWN'})),nextCursor:rows.length>100?rows[99]!.id:null});
});
router.get('/task-instance/:taskId/verification/history',async(req,res)=>{
 const task=await requireTaskAccess(req.user!,z.coerce.number().int().positive().parse(req.params.taskId));
 const cursor=z.uuid().optional().parse(req.query.cursor);
 if(cursor&&!await prisma.verificationAttempt.findFirst({where:{id:cursor,session:{taskInstanceId:task.id}}}))throw new ApiError(404,'History cursor not found');
 const rows=await prisma.verificationAttempt.findMany({where:{session:{taskInstanceId:task.id}},orderBy:[{createdAt:'desc'},{id:'desc'}],take:51,...(cursor?{cursor:{id:cursor},skip:1}:{}),include:{media:{select:{privacyState:true}},requirement:{select:{viewKey:true,item:{select:{nameSnapshot:true}}}}}});
 const staff=await prisma.staff.findMany({where:{companyId:req.user!.companyId,id:{in:rows.map(a=>a.staffId)}},select:{id:true,name:true}});
 send(res,{attempts:rows.slice(0,50).map(a=>({id:a.id,requirementId:a.requirementId,contextKey:a.contextKey,state:a.state,createdAt:a.createdAt,receivedAt:a.receivedAt,staff:staff.find(s=>s.id===a.staffId)??null,requirement:a.requirement,privacyState:a.media?.privacyState,mediaAssetId:a.media?.privacyState==='SAFE'&&a.state!=='PRIVACY_HOLD'?a.mediaAssetId:null,...staffAttemptResult(a,a.media?.privacyState==='SAFE')})),nextCursor:rows.length>50?rows[49]!.id:null});
});
router.post('/task-instance/:taskId/capture-sessions',async(req,res)=>send(res,await createCaptureSession(req.user!,z.coerce.number().int().positive().parse(req.params.taskId),req.body),201));
router.post('/capture-session/:id/resume',async(req,res)=>send(res,await resumeSession(req.user!,String(req.params.id),req.body)));
router.post('/capture-session/:id/renew',async(req,res)=>{const s=await authorizedSession(req.user!,String(req.params.id),prisma);send(res,await createCaptureSession(req.user!,s.taskInstanceId,req.body,s.id),201);});
router.post('/capture-session/:id/retake-slots',async(req,res)=>send(res,await retakeSlots(req.user!,String(req.params.id),req.body)));
router.post('/capture-session/:id/attempts/manifest',async(req,res)=>send(res,await reserveAttempt(req.user!,String(req.params.id),req.body,true),201));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:1,fields:9,fieldSize:4096}});
router.post('/capture-session/:id/attempts',async(req,_res,next)=>{await authorizedSession(req.user!,String(req.params.id),prisma,undefined,true);next();},upload.single('photo'),async(req,res)=>{if(!req.file)throw new ApiError(400,'Photo required');if(sha256(req.file.buffer)!==req.body.sha256)throw new ApiError(409,'Photo bytes do not match commitment');const a=await reserveAttempt(req.user!,String(req.params.id),req.body,false);send(res,await storeReservedEvidence(req.user!,a.id,req.file.buffer),202);});
router.get('/verification-attempt/:id',async(req,res)=>{
 const a=await prisma.verificationAttempt.findUnique({where:{id:z.uuid().parse(req.params.id)},include:{session:{select:{taskInstanceId:true}},media:{select:{privacyState:true}},jobs:{orderBy:{createdAt:'asc'},select:{stage:true,state:true}}}});
 if(!a)throw new ApiError(404,'Attempt not found');await requireTaskAccess(req.user!,a.session.taskInstanceId);
 const safe=a.media?.privacyState==='SAFE'&&a.state!=='PRIVACY_HOLD';
 send(res,{workflowVersion:2,id:a.id,state:a.state,requirementId:a.requirementId,contextKey:a.contextKey,assetId:safe?a.mediaAssetId:null,...staffAttemptResult(a,safe),stages:a.jobs.map(j=>({stage:j.stage,state:j.state}))});
});
router.use((error:any,_req:any,_res:any,next:any)=>{if(error instanceof z.ZodError)return next(new ApiError(400,'Invalid verification request',[{code:'INVALID_REQUEST'},...error.issues]));if(error instanceof multer.MulterError)return next(new ApiError(error.code==='LIMIT_FILE_SIZE'?413:400,'Upload limit exceeded',[{code:error.code}]));if(error instanceof ApiError){if(!error.errors.length)error.errors=[{code:({400:'INVALID_REQUEST',403:'FORBIDDEN',404:'NOT_FOUND',409:'CONFLICT',410:'AUTHORITY_EXPIRED',422:'INVALID_CAPTURE',429:'RATE_LIMITED'} as Record<number,string>)[error.statusCode]??'SERVICE_FAILURE'}];if(error.statusCode===429)_res.setHeader('Retry-After','60');}next(error);});
export default router;
