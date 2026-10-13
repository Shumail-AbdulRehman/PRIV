import {beforeEach,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({attempt:null as any,store:vi.fn(),access:vi.fn(),decision:vi.fn(),finalize:vi.fn()}));
vi.mock('../../prisma/prisma.js',()=>({prisma:{
 verificationAttempt:{findUniqueOrThrow:vi.fn(async()=>m.attempt),update:vi.fn(async({data}:any)=>{Object.assign(m.attempt,data);return m.attempt;})},
 $transaction:vi.fn(async(fn:any)=>fn({verificationAttempt:{findUniqueOrThrow:async()=>m.attempt,update:async({data}:any)=>{Object.assign(m.attempt,data);return m.attempt;}},evidenceAsset:{upsert:async({create}:any)=>{m.attempt.media={id:'asset',...create};return m.attempt.media;}}}))
}}));
vi.mock('./authorization.service.js',()=>({requireTaskAccess:m.access}));
vi.mock('./captureSession.service.js',()=>({lockTask:vi.fn(),staffAttemptResult:()=>({})}));
vi.mock('./quality.service.js',()=>({sha256:()=> 'hash',inspectImage:async()=>({sha256:'hash',normalizedHash:'n',perceptualHash:'p',format:'jpeg',bytes:5,width:1800,height:1200,sanitized:Buffer.from('sanitized'),quality:{acceptable:true}})}));
vi.mock('./evidence.service.js',()=>({originalPublicId:()=> 'verification/1/attempts/a/original'}));
vi.mock('./photoDecision.service.js',()=>({applyDecision:m.decision}));
vi.mock('./completion.service.js',()=>({finalizeTask:m.finalize}));
vi.mock('./cleanliness.service.js',()=>({autoPassAllowed:()=>false}));
vi.mock('./bufferedPhoto.provider.js',()=>({BufferedClefProvider:class{},bufferedEvaluatorVersion:()=>"test-v1"}));
import {processDirectPhoto,directPhotoStatus} from './directPhoto.service.js';
const actor={id:1,companyId:1,role:'STAFF' as const};
const clean={originality:'DIRECT' as const,cleanliness:{verdict:'CLEAN' as const,surfaces:[{surface:'basin',verdict:'CLEAN' as const}],confidence:.99,reasonCode:'CLEAN' as const},metadata:{} as any};
beforeEach(()=>{vi.clearAllMocks();m.attempt={id:'a',staffId:1,committedHash:'hash',state:'RESERVED',session:{taskInstanceId:7,task:{locationId:2}},requirement:{id:'r',viewKey:'basin',item:{typeSnapshot:'SINK',rubricSnapshot:{version:1}}},media:null,qualityResult:null};m.store.mockResolvedValue({asset_id:'cloud'});m.decision.mockImplementation(async(_tx,_id,state)=>{m.attempt.state=state;});});
it('finishes AI then protected cloud storage before returning, with no job queue',async()=>{
 const provider={evaluate:vi.fn(async()=>clean)};
 const result=await processDirectPhoto(actor,'a',Buffer.from('photo'),provider,m.store);
 expect(provider.evaluate).toHaveBeenCalledOnce();expect(m.store).toHaveBeenCalledTimes(2);
 expect(provider.evaluate.mock.invocationCallOrder[0]).toBeLessThan(m.store.mock.invocationCallOrder[0]);
 expect(result).toMatchObject({attemptId:'a',state:'REVIEW_REQUIRED',storage:'cloud'});
 expect(m.decision).toHaveBeenCalledWith(expect.anything(),'a','REVIEW_REQUIRED','AUTO_PASS_NOT_VALIDATED',expect.anything());
});
it.each(['DIRTY','SCREEN'] as const)('rejects %s without uploading to cloud',async kind=>{
 const assessment=kind==='DIRTY'?{...clean,cleanliness:{...clean.cleanliness,verdict:'DIRTY' as const,surfaces:[{surface:'basin',verdict:'DIRTY' as const}],reasonCode:'CLEANING_REQUIRED' as const}}:{...clean,originality:'SCREEN_RECAPTURE' as const};
 const result=await processDirectPhoto(actor,'a',Buffer.from('photo'),{evaluate:async()=>assessment},m.store);
 expect(m.store).not.toHaveBeenCalled();expect(result.storage).toBe('discarded');
 expect(result.state).toBe(kind==='DIRTY'?'CLEANING_REQUIRED':'RECAPTURE_REQUIRED');
});
it('requires explicit retry after AI failure and does not accept missing evidence',async()=>{
 const evaluate=vi.fn().mockRejectedValue(new Error('AI unavailable'));
 await expect(processDirectPhoto(actor,'a',Buffer.from('photo'),{evaluate},m.store)).rejects.toMatchObject({statusCode:503});
 expect(evaluate).toHaveBeenCalledOnce();expect(m.store).not.toHaveBeenCalled();expect(m.attempt).toMatchObject({state:'RESERVED',media:null});
});
it('manual retry reuses a completed assessment after cloud failure',async()=>{
 const evaluate=vi.fn(async()=>clean);m.store.mockRejectedValueOnce(new Error('network'));
 await expect(processDirectPhoto(actor,'a',Buffer.from('photo'),{evaluate},m.store)).rejects.toMatchObject({statusCode:503});
 m.store.mockResolvedValue({asset_id:'cloud'});
 await processDirectPhoto(actor,'a',Buffer.from('photo'),{evaluate},m.store);
 expect(evaluate).toHaveBeenCalledOnce();expect(m.attempt.state).toBe('REVIEW_REQUIRED');
});
it('duplicate requests return the recorded result instead of calling AI again',async()=>{
 const provider={evaluate:vi.fn(async()=>clean)};
 await processDirectPhoto(actor,'a',Buffer.from('photo'),provider,m.store);
 await processDirectPhoto(actor,'a',Buffer.from('photo'),provider,m.store);
 expect(provider.evaluate).toHaveBeenCalledOnce();expect(m.store).toHaveBeenCalledTimes(2);
});
it('a concurrent upload is rejected while the first request owns the attempt',async()=>{
 m.attempt.directProcessingToken='other';m.attempt.directProcessingStartedAt=new Date();
 const provider={evaluate:vi.fn(async()=>clean)};
 await expect(processDirectPhoto(actor,'a',Buffer.from('photo'),provider,m.store)).rejects.toMatchObject({statusCode:409});
 expect(provider.evaluate).not.toHaveBeenCalled();
});
it('interrupted requests expire and can be checked or manually uploaded again',async()=>{
 m.attempt.state='CLEANLINESS_CHECK';m.attempt.directProcessingToken='old';m.attempt.directProcessingStartedAt=new Date(Date.now()-200000);
 expect((await directPhotoStatus(actor,'a')).state).toBe('RESERVED');
 await processDirectPhoto(actor,'a',Buffer.from('photo'),{evaluate:async()=>clean},m.store);
 expect(m.attempt.state).toBe('REVIEW_REQUIRED');
});
it('rejects another staff member and checks live access before AI',async()=>{
 m.attempt.staffId=2;const provider={evaluate:vi.fn(async()=>clean)};
 await expect(processDirectPhoto(actor,'a',Buffer.from('photo'),provider,m.store)).rejects.toMatchObject({statusCode:404});
 expect(provider.evaluate).not.toHaveBeenCalled();
});
