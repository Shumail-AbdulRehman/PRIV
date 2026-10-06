import {beforeEach,describe,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({tx:{} as any,access:vi.fn(),nonce:vi.fn()}));
vi.mock('../../prisma/prisma.js',()=>({prisma:{$transaction:(fn:any)=>fn(m.tx)}}));
vi.mock('./authorization.service.js',()=>({requireTaskAccess:m.access}));
vi.mock('./qr.service.js',()=>({verifyAreaQr:vi.fn(),slotNonce:()=> 'a'.repeat(40),hashNonce:m.nonce}));
import {createCaptureSession,reserveAttempt,resumeSession,retakeSlots,sessionResponse,staffAttemptResult} from './captureSession.service.js';
const actor={role:'STAFF' as const,id:7,companyId:1};
const sessionId='11111111-1111-4111-8111-111111111111',slotId='22222222-2222-4222-8222-222222222222';
const input=()=>({deviceId:'phone',clientCaptureId:'33333333-3333-4333-8333-333333333333',slotId,nonce:'a'.repeat(40),sha256:'b'.repeat(64),claimedCapturedAt:new Date().toISOString(),elapsedMs:1000,bootId:'boot'});
beforeEach(()=>{
 vi.resetAllMocks();const now=new Date();const task={assignmentEpoch:2,assignments:[{id:3,isCurrent:true}],shiftEnd:new Date(+now+60000)};
 const session={id:sessionId,staffId:7,taskInstanceId:9,assignmentId:3,assignmentEpoch:2,qrVersion:1,deviceId:'phone',clientBootId:'boot',state:'ACTIVE',issuedAt:new Date(+now-1000),captureExpiresAt:new Date(+now+60000),uploadExpiresAt:new Date(+now+120000),task};
 m.access.mockResolvedValue(task);m.nonce.mockReturnValue('hash');
 m.tx={auditLog:{create:vi.fn()},area:{findUnique:vi.fn().mockResolvedValue({qrVersion:1}),findUniqueOrThrow:vi.fn().mockResolvedValue({qrVersion:1})},$queryRaw:vi.fn(),captureSession:{findUnique:vi.fn().mockResolvedValue(session),update:vi.fn(),updateMany:vi.fn(),findUniqueOrThrow:vi.fn().mockResolvedValue({...session,slots:[],attempts:[]})},captureSlot:{findFirst:vi.fn().mockResolvedValue({id:slotId,nonceHash:'hash',contextKey:'ENTRANCE',expiresAt:session.captureExpiresAt,generation:0}),update:vi.fn(),count:vi.fn().mockResolvedValue(2),create:vi.fn().mockImplementation(({data}:any)=>data)},verificationAttempt:{findUnique:vi.fn().mockResolvedValue(null),count:vi.fn().mockResolvedValue(0),create:vi.fn().mockImplementation(({data}:any)=>({id:'attempt',...data}))}};
});
describe('capture authority',()=>{
 it('prevents a request ID from returning another task session',async()=>{m.access.mockResolvedValue({verificationVersion:2,areaId:4});m.tx.verificationRequest={findUnique:vi.fn().mockResolvedValue({resultEntityId:sessionId})};await expect(createCaptureSession(actor,10,{requestId:sessionId,areaQr:'qr',deviceId:'phone',clientBootId:'boot',location:{latitude:0,longitude:0,accuracy:5,sampledAt:new Date().toISOString()},clientTime:new Date().toISOString()})).rejects.toThrow('another task');});
 it('renews expired empty reservations without changing other processing views',async()=>{
 const now=new Date();m.access.mockResolvedValue({id:9,verificationVersion:2,areaId:4,status:'IN_PROGRESS',assignmentEpoch:2,shiftEnd:new Date(+now+60000),startedAt:new Date(+now-10000),location:{latitude:0,longitude:0,radiusMeters:100},assignments:[{id:3,isCurrent:true,staffId:7,status:'STARTED'}]});
 m.tx.area.findUniqueOrThrow=vi.fn().mockResolvedValue({qrVersion:1});m.tx.verificationRequest={findUnique:vi.fn().mockResolvedValue(null),create:vi.fn()};
 m.tx.captureSession.findFirst=vi.fn().mockResolvedValue(null);m.tx.captureSession.count=vi.fn().mockResolvedValue(0);m.tx.captureSession.create=vi.fn().mockResolvedValue({id:sessionId,captureExpiresAt:new Date(+now+60000)});
 m.tx.taskEvidenceRequirement={findMany:vi.fn().mockResolvedValueOnce([{id:'empty',currentAttemptId:'empty-attempt'},{id:'received',currentAttemptId:'received-attempt'}]).mockResolvedValueOnce([]),update:vi.fn()};
 m.tx.verificationAttempt.findMany=vi.fn().mockResolvedValue([{id:'empty-attempt'}]);m.tx.taskInstance={update:vi.fn()};
 await createCaptureSession(actor,9,{requestId:sessionId,areaQr:'qr',deviceId:'phone',clientBootId:'boot',location:{latitude:0,longitude:0,accuracy:5,sampledAt:now.toISOString()},clientTime:now.toISOString()});
 expect(m.tx.taskEvidenceRequirement.update).toHaveBeenCalledExactlyOnceWith({where:{id:'empty'},data:{state:'MISSING',currentAttemptId:null,decisionVersion:{increment:1}}});
 expect(m.tx.verificationAttempt.findMany.mock.calls[0][0].where).toMatchObject({state:{in:['RESERVED','STORING']},mediaAssetId:null});
 });
 it('withholds nonces from revoked expired and completed session responses',async()=>{
 for(const state of ['REVOKED','EXPIRED','CLOSED']){m.tx.captureSession.findUniqueOrThrow.mockResolvedValue({id:sessionId,state,captureExpiresAt:new Date(Date.now()+60000),slots:[{id:slotId,generation:0}]});const response=await sessionResponse(m.tx,sessionId);expect(response.requiresRenewal).toBe(true);expect(response.slots[0]?.nonce).toBeUndefined();}
 });
 it('withholds nonces after boot changes',async()=>{const session=await m.tx.captureSession.findUnique();m.tx.captureSession.findUniqueOrThrow.mockResolvedValue({...session,slots:[{id:slotId,generation:0}]});const response=await resumeSession(actor,sessionId,{deviceId:'phone',clientBootId:'reboot'});expect(response.requiresRenewal).toBe(true);expect(response.slots[0]?.nonce).toBeUndefined();});
 it('does not bypass tenant authorization for queued uploads',async()=>{m.access.mockRejectedValue(new Error('Task not found'));await expect(reserveAttempt({...actor,companyId:2},sessionId,input(),false)).rejects.toThrow('Task not found');expect(m.tx.verificationAttempt.create).not.toHaveBeenCalled();});
 it('returns only enumerated semantic results and catalog instructions',()=>{const result=staffAttemptResult({state:'RECAPTURE_REQUIRED',qualityResult:{acceptable:false,reasons:['BLURRY'],confidence:0.2},coverageResult:{result:{verdict:'WRONG_ITEM',reasonCode:'WRONG_ITEM',instructions:'malicious provider prose',confidence:0.9}},cleanlinessResult:{result:{verdict:'DIRTY',reasonCode:'CLEANING_REQUIRED',instructions:'raw prose'}}},true);expect(result.reasonCode).toBe('PHOTO_BLURRY');expect(result.instructions).toBe('Hold still and retake.');expect(JSON.stringify(result)).not.toMatch(/confidence|raw prose|malicious/);});
 it('suppresses coverage and cleanliness while privacy is held',()=>{const result=staffAttemptResult({state:'PRIVACY_HOLD',qualityResult:null,coverageResult:{result:{verdict:'MATCH'}},cleanlinessResult:{result:{verdict:'CLEAN'}}},false);expect(result.results.coverage).toBeNull();expect(result.results.cleanliness).toBeNull();expect(result.retryAction).toBeNull();expect(result.reasonCode).toBe('PRIVACY_HOLD');});
 it('distinguishes retrying an upload from retaking a photo and service retries',()=>{for(const [state,action] of [['RESERVED','RETRY_UPLOAD'],['CLEANING_REQUIRED','REQUEST_RETAKE_SLOT'],['SERVICE_FAILURE','WAIT_FOR_SERVICE']])expect(staffAttemptResult({state:state!,qualityResult:null,coverageResult:null,cleanlinessResult:null},true).retryAction).toBe(action);});
 it('renews unresolved generations while excluding passed and processing evidence',async()=>{
 const now=new Date(),old=await m.tx.captureSession.findUnique();old.state='EXPIRED';
 m.access.mockResolvedValue({id:9,verificationVersion:2,areaId:4,status:'IN_PROGRESS',assignmentEpoch:2,shiftEnd:new Date(+now+60000),startedAt:new Date(+now-10000),location:{latitude:0,longitude:0,radiusMeters:100},assignments:[{id:3,isCurrent:true,staffId:7,status:'STARTED'}]});
 m.tx.verificationRequest={findUnique:vi.fn().mockResolvedValue(null),create:vi.fn()};m.tx.captureSession.findFirst=vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(old);m.tx.captureSession.count=vi.fn().mockResolvedValue(0);m.tx.captureSession.create=vi.fn().mockResolvedValue({id:sessionId,captureExpiresAt:new Date(+now+60000)});
 m.tx.taskEvidenceRequirement={findMany:vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([{id:'missing',decisionVersion:0,state:'MISSING'}]),update:vi.fn()};m.tx.verificationAttempt.findMany=vi.fn().mockResolvedValue([]);m.tx.taskInstance={update:vi.fn()};
 await createCaptureSession(actor,9,{requestId:sessionId,areaQr:'qr',deviceId:'phone',clientBootId:'boot',location:{latitude:0,longitude:0,accuracy:5,sampledAt:now.toISOString()},clientTime:now.toISOString()});
 expect(m.tx.taskEvidenceRequirement.findMany.mock.calls[1][0].where.state.notIn).toEqual(['PASSED','MANAGER_ACCEPTED','WAIVED','PROCESSING']);
 expect(m.tx.taskEvidenceRequirement.update).toHaveBeenCalledExactlyOnceWith({where:{id:'missing'},data:{decisionVersion:1}});
 expect(m.tx.captureSlot.create.mock.calls[2][0].data).toMatchObject({requirementId:'missing',generation:1});
 m.tx.captureSession.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({...old,deviceId:'other-phone'});
 await expect(createCaptureSession(actor,9,{requestId:sessionId,areaQr:'qr',deviceId:'phone',clientBootId:'boot',location:{latitude:0,longitude:0,accuracy:5,sampledAt:now.toISOString()},clientTime:now.toISOString()})).rejects.toThrow('Explicit device takeover required');
 });
 it('suppresses held assets during session reconciliation',async()=>{const session=await m.tx.captureSession.findUnique();m.tx.captureSession.findUniqueOrThrow.mockResolvedValue({...session,slots:[],attempts:[{id:'held',state:'PRIVACY_HOLD',mediaAssetId:'secret',media:{privacyState:'HELD'}},{id:'safe',state:'PASSED',mediaAssetId:'visible',media:{privacyState:'SAFE'}}]});const response=await sessionResponse(m.tx,sessionId);expect(response.attempts[0]?.mediaAssetId).toBeNull();expect(response.attempts[1]?.mediaAssetId).toBe('visible');});
 it('accepts identical timestamps with equivalent ISO representations on retry',async()=>{const raw=input();raw.claimedCapturedAt='2026-10-06T10:00:00Z';m.tx.verificationAttempt.findUnique.mockResolvedValue({slotId,committedHash:raw.sha256,claimedCapturedAt:new Date(raw.claimedCapturedAt),anchoredElapsedMs:1000n});await expect(reserveAttempt(actor,sessionId,raw,false)).resolves.toMatchObject({slotId});});
 it('requires device binding',async()=>{const {deviceId,...raw}=input();await expect(reserveAttempt(actor,sessionId,raw,false)).rejects.toThrow();});
 it('rejects another device',async()=>{await expect(reserveAttempt(actor,sessionId,{...input(),deviceId:'other'},false)).rejects.toThrow('another device');});
 it('rejects a different boot',async()=>{await expect(reserveAttempt(actor,sessionId,{...input(),bootId:'reboot'},false)).rejects.toThrow('clock or boot');});
 it('allows offline upload after capture expiry within upload window',async()=>{const s=await m.tx.captureSession.findUnique();s.state='EXPIRED';await expect(reserveAttempt(actor,sessionId,input(),false)).resolves.toMatchObject({id:'attempt'});});
 it('retains late queued bytes as review-only',async()=>{const session=await m.tx.captureSession.findUnique();session.uploadExpiresAt=new Date(0);await expect(reserveAttempt(actor,sessionId,input(),false)).resolves.toMatchObject({state:'REVIEW_REQUIRED'});expect(m.tx.captureSlot.update).toHaveBeenCalled();});
 it('retains QR-rotated queued bytes as review-only',async()=>{const session=await m.tx.captureSession.findUnique();session.state='REVOKED';m.tx.area.findUnique.mockResolvedValue({qrVersion:2});m.tx.area.findUniqueOrThrow.mockResolvedValue({qrVersion:2});await expect(reserveAttempt(actor,sessionId,input(),false)).resolves.toMatchObject({state:'REVIEW_REQUIRED'});});
 it('keeps QR-rotated manifests and resume strict',async()=>{m.tx.area.findUnique.mockResolvedValue({qrVersion:2});await expect(reserveAttempt(actor,sessionId,input(),true)).rejects.toThrow('QR authority revoked');await expect(resumeSession(actor,sessionId,{deviceId:'phone',clientBootId:'boot'})).rejects.toThrow('QR authority revoked');});
 it('does not relax assignment epoch for review-only uploads',async()=>{m.access.mockResolvedValue({assignmentEpoch:3,assignments:[{id:3,isCurrent:true}]});await expect(reserveAttempt(actor,sessionId,input(),false)).rejects.toThrow('Assignment authority revoked');});
 it('retains stale requirement evidence without moving its pointer',async()=>{
 m.tx.captureSlot.findFirst.mockResolvedValue({id:slotId,requirementId:'requirement',nonceHash:'hash',generation:0,expiresAt:new Date(Date.now()+60000)});
 m.tx.taskEvidenceRequirement={findUniqueOrThrow:vi.fn().mockResolvedValue({id:'requirement',taskVerificationItemId:5,state:'PROCESSING',decisionVersion:0,currentAttemptId:'new-attempt'}),update:vi.fn()};m.tx.taskVerificationItem={findFirst:vi.fn().mockResolvedValue({id:5})};
 await expect(reserveAttempt(actor,sessionId,input(),false)).resolves.toMatchObject({state:'REVIEW_REQUIRED'});expect(m.tx.taskEvidenceRequirement.update).not.toHaveBeenCalled();
 });
 it('retains stale context uploads but rejects stale context manifests',async()=>{
 const slot={id:slotId,contextKey:'ENTRANCE',nonceHash:'hash',generation:0,expiresAt:new Date(Date.now()+60000)};
 m.tx.captureSlot.findFirst.mockResolvedValueOnce(slot).mockResolvedValueOnce({...slot,generation:1});
 await expect(reserveAttempt(actor,sessionId,input(),false)).resolves.toMatchObject({state:'REVIEW_REQUIRED'});
 m.tx.captureSlot.findFirst.mockResolvedValueOnce(slot).mockResolvedValueOnce({...slot,generation:1});
 await expect(reserveAttempt(actor,sessionId,input(),true)).rejects.toThrow('Context generation changed');
 });
 it('blocks same-QR device takeover revocation',async()=>{const s=await m.tx.captureSession.findUnique();s.state='REVOKED';await expect(reserveAttempt(actor,sessionId,input(),false)).rejects.toThrow('revoked');});
 it('rejects expired manifests',async()=>{const s=await m.tx.captureSession.findUnique();s.captureExpiresAt=new Date(0);await expect(reserveAttempt(actor,sessionId,input(),true)).rejects.toThrow('expired');});
 it('checks nonce on retries',async()=>{const raw=input();m.tx.verificationAttempt.findUnique.mockResolvedValue({slotId,committedHash:raw.sha256,claimedCapturedAt:new Date(raw.claimedCapturedAt),anchoredElapsedMs:1000n});m.nonce.mockReturnValue('wrong');await expect(reserveAttempt(actor,sessionId,raw,false)).rejects.toThrow('nonce');});
 it('rejects changed commitment',async()=>{const raw=input();m.tx.verificationAttempt.findUnique.mockResolvedValue({slotId,committedHash:'c'.repeat(64),claimedCapturedAt:new Date(raw.claimedCapturedAt),anchoredElapsedMs:1000n});await expect(reserveAttempt(actor,sessionId,raw,false)).rejects.toThrow('different evidence');});
 it('bounds capture rate',async()=>{m.tx.verificationAttempt.count.mockResolvedValue(50);await expect(reserveAttempt(actor,sessionId,input(),false)).rejects.toThrow('Too many');expect(m.tx.captureSlot.update).not.toHaveBeenCalled();});
 it('locks resume and signals reboot renewal',async()=>{await expect(resumeSession(actor,sessionId,{deviceId:'phone',clientBootId:'reboot'})).resolves.toMatchObject({requiresRenewal:true});expect(m.tx.$queryRaw).toHaveBeenCalled();});
 it('allocates failed context retakes',async()=>{m.tx.captureSlot.findFirst.mockResolvedValue({generation:0,attemptId:'old'});m.tx.verificationAttempt.findUnique.mockResolvedValue({state:'RECAPTURE_REQUIRED'});expect((await retakeSlots(actor,sessionId,{deviceId:'phone',contexts:[{contextKey:'ENTRANCE',expectedGeneration:0}]}))[0]).toMatchObject({contextKey:'ENTRANCE',generation:1});});
 it('preserves passed context',async()=>{m.tx.captureSlot.findFirst.mockResolvedValue({generation:0,attemptId:'old'});m.tx.verificationAttempt.findUnique.mockResolvedValue({state:'PASSED'});await expect(retakeSlots(actor,sessionId,{deviceId:'phone',contexts:[{contextKey:'ENTRANCE',expectedGeneration:0}]})).rejects.toThrow('not available');});
});
