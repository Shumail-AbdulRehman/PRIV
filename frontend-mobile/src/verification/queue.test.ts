import { after,before,test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync,mkdirSync,writeFileSync,existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
const directory=mkdtempSync(join(tmpdir(),'hygene-queue-'));process.env.QUEUE_TEST_DIRECTORY=directory;
let queue:typeof import('./queue');let setFreeBytes:(bytes:number)=>void;let setConnectivity:(value:boolean)=>void;let setAppState:(value:string)=>void;
before(async()=>{({queue,setFreeBytes,setConnectivity,setAppState}=await import('../../tests/nativeQueueHarness.mts'));});
test('SIGKILL after durable save recovers bytes, slot identity and interrupted upload',async()=>{
 const child=spawn(process.execPath,['--import','tsx','tests/nativeQueueHarness.mts','--seed-and-wait'],{cwd:process.cwd(),env:{...process.env,QUEUE_TEST_DIRECTORY:directory},stdio:['ignore','pipe','pipe']});
 let errors='';child.stderr.on('data',data=>{errors+=data;});
 await new Promise<void>((resolve,reject)=>{const timeout=setTimeout(()=>{child.kill('SIGKILL');reject(new Error(errors||'Child never saved'));},10000);child.stdout.on('data',data=>{if(String(data).includes('DURABLE')){clearTimeout(timeout);resolve();}});child.once('exit',code=>{clearTimeout(timeout);reject(new Error(`Unexpected child exit ${code}: ${errors}`));});});
 child.kill('SIGKILL');await new Promise(resolve=>child.once('exit',resolve));
 await queue.unlockQueue({companyId:1,id:1});assert.equal((await queue.queueRows())[0].state,'SAVED');assert.equal((await queue.queueRows())[0].slotId,'original-slot');assert.deepEqual(Array.from(await queue.queueBytes('capture-id')),[4,5,6]);
});
test('logout retains pending bytes; different company/worker cannot read them; same worker resumes',async()=>{
 await queue.lockQueue();await assert.rejects(queue.queueRows(),/locked/);await queue.unlockQueue({companyId:1,id:2});assert.equal((await queue.queueRows()).length,0);await assert.rejects(queue.queueBytes('capture-id'));
 await queue.unlockQueue({companyId:2,id:1});assert.equal((await queue.queueRows()).length,0);await queue.unlockQueue({companyId:1,id:1});assert.equal(await queue.pendingCount(),1);
});
test('low storage refuses new evidence without dropping pending work; slot uniqueness is atomic',async()=>{
 const metadata={...(await queue.queueRows())[0].metadata,slotId:'second',clientCaptureId:'second'};
 setFreeBytes(0);await assert.rejects(queue.saveCapture(metadata,new Uint8Array([7])),/storage is low/);assert.equal(await queue.pendingCount(),1);setFreeBytes(1000*1024*1024);
 await assert.rejects(queue.saveCapture({...metadata,slotId:'original-slot'},new Uint8Array([7])));assert.equal(await queue.pendingCount(),1);
});
test('offline and suspended sync retain bytes; reconnect uploads exact metadata and server acknowledgment',async()=>{
 const {syncEvidence}=await import('./sync');const {configureApiAuth,client}=await import('../api/client');
 configureApiAuth({getScope:()=>queue.queueAccount(),getTokens:async()=>({accessToken:'access',refreshToken:'refresh'}),setTokens:async()=>{},clearSession:async()=>{}});
 const fetch=globalThis.fetch;const adapter=client.defaults.adapter;let uploads=0;
 client.defaults.adapter=async(config)=>({data:{data:{id:'server-attempt',state:'REVIEW_REQUIRED'}},status:200,statusText:'OK',headers:{},config});
 globalThis.fetch=async(_url,input)=>{uploads++;const body=input!.body as FormData;assert.deepEqual([...(body as unknown as {keys():IterableIterator<string>}).keys()].sort(),['photo','clientCaptureId','slotId','nonce','sha256','claimedCapturedAt','elapsedMs','bootId','deviceId'].sort());assert.equal(body.get('clientCaptureId'),'capture-id');return new Response(JSON.stringify({data:{attemptId:'server-attempt',assetId:'stored-asset',state:'RECEIVED'}}),{status:202});};
 try{setConnectivity(false);await syncEvidence();assert.equal(await queue.pendingCount(),1);assert.equal(uploads,0);setConnectivity(true);setAppState('background');await syncEvidence();assert.equal(uploads,0);setAppState('active');await syncEvidence();assert.equal(uploads,1);assert.equal(await queue.pendingCount(),0);await syncEvidence();assert.equal((await queue.queueRows())[0].state,'FINAL');}finally{globalThis.fetch=fetch;client.defaults.adapter=adapter;}
});
test('only durable server acknowledgment releases bytes; metadata remains resumable',async()=>{
 await queue.updateQueue('capture-id','SERVER_ACCEPTED',{attemptId:'server-attempt',releaseBytes:true});assert.equal(await queue.pendingCount(),0);assert.equal((await queue.queueRows())[0].attemptId,'server-attempt');await queue.lockQueue();
});

test('startup removes previous-process plaintext capture/upload caches and preserves encrypted work',async()=>{
 await queue.unlockQueue({companyId:1,id:1});
 for(const name of ['Camera','ImageManipulator']){mkdirSync(join(directory,name));writeFileSync(join(directory,name,'orphan.jpg'),'plaintext');}
 writeFileSync(join(directory,'verification-upload-orphan.jpg'),'plaintext');
 queue.cleanPreviousProcessCaptureCache();
 for(const name of ['Camera','ImageManipulator','verification-upload-orphan.jpg'])assert.equal(existsSync(join(directory,name)),false);
 assert.equal((await queue.queueRows())[0].attemptId,'server-attempt');
});
test('50-photo ceiling retains existing evidence and acknowledged upload frees capacity',async()=>{
 await queue.unlockQueue({companyId:3,id:3});
 const metadata={taskId:7,sessionId:'limits',nonce:'nonce',sha256:'hash',claimedCapturedAt:'2026-10-06T10:00:00Z',elapsedMs:1,bootId:'boot',deviceId:'device'};
 for(let i=0;i<50;i++)await queue.saveCapture({...metadata,clientCaptureId:`limit-${i}`,slotId:`limit-${i}`},new Uint8Array([1]));
 await assert.rejects(queue.saveCapture({...metadata,clientCaptureId:'overflow',slotId:'overflow'},new Uint8Array([1])),/storage is full/);assert.equal(await queue.pendingCount(),50);
 await queue.updateQueue('limit-0','SERVER_ACCEPTED',{attemptId:'acknowledged',releaseBytes:true});
 await queue.saveCapture({...metadata,clientCaptureId:'replacement',slotId:'replacement'},new Uint8Array([2]));assert.equal(await queue.pendingCount(),50);
});
test('fresh sessions require network; lost session response replays durable identity; renewal uses existing session',async()=>{
 const {openCaptureSession}=await import('./api');const {client}=await import('../api/client');
 setConnectivity(false);await assert.rejects(openCaptureSession(99,'room-qr'),/Connect to the internet/);assert.equal(await queue.getRequest('session:99'),null);
 setConnectivity(true);const adapter=client.defaults.adapter;const bodies:Record<string,unknown>[]=[];const paths:string[]=[];let fail=true;
 client.defaults.adapter=async config=>{bodies.push(JSON.parse(config.data));paths.push(config.url!);if(fail){fail=false;throw new Error('network response lost');}return {data:{data:{id:'recovered-session'}},status:200,statusText:'OK',headers:{},config};};
 try{
   await assert.rejects(openCaptureSession(99,'room-qr'),/response lost/);const persisted=await queue.getRequest('session:99');assert.ok(persisted?.body.requestId);
   assert.equal((await openCaptureSession(99,'room-qr')).id,'recovered-session');assert.deepEqual(bodies[0],bodies[1]);assert.equal(paths[0],paths[1]);
   await queue.removeRequest('session:99');await openCaptureSession(99,'room-qr','expired-session');assert.equal(paths.at(-1),'/capture-session/expired-session/renew');assert.notEqual(bodies.at(-1)?.requestId,bodies[0].requestId);
 }finally{client.defaults.adapter=adapter;}
});
test('unavailable encryption preserves its real error and retry reopens existing saved work',async()=>{
 const {setCipherAvailable}=await import('../../tests/nativeQueueHarness.mts');
 await queue.unlockQueue({companyId:3,id:3});const count=await queue.pendingCount();
 await queue.lockQueue();setCipherAvailable(false);
 try {
   await assert.rejects(queue.unlockQueue({companyId:3,id:3}),/Encrypted photo storage requires a native build/);
   assert.equal(queue.queueAccount(),null);
   await assert.rejects(queue.getSession(7),/Encrypted photo storage requires a native build/);
   await assert.rejects(queue.queueRows(),/Encrypted photo storage requires a native build/);
 }finally{setCipherAvailable(true);}
 await queue.unlockQueue({companyId:3,id:3});assert.equal(await queue.pendingCount(),count);
});
test('an existing Android database without its SecureStore key is never replaced',async()=>{
 await queue.lockQueue();
 const database=join(directory,'verification_9_9.db');
 writeFileSync(database,'retained encrypted evidence');
 await assert.rejects(queue.unlockQueue({companyId:9,id:9}),/encryption key.*unavailable/);
 assert.equal(existsSync(join(directory,'hygene_verification_key_9_9')),false);
 assert.equal(queue.queueAccount(),null);
 await queue.unlockQueue({companyId:3,id:3});
});
test('spatial observation and checkpoint commit with bytes, survive logout, and retain interruption through manifest refresh',async()=>{
 await queue.unlockQueue({companyId:4,id:4});
 const local={session:{id:'spatial-session'},manifest:{task:{id:88,status:'IN_PROGRESS'}},anchorElapsedMs:0,anchorBootId:'boot',savedAt:0,paused:false} as any;
 await queue.saveSession(local);
 const spatialEvidence={version:1,sessionId:'spatial-session',worldId:'world',sequence:1,requirementId:'requirement',contextKey:null,capability:'NO_SPATIAL',tracking:'UNAVAILABLE',continuity:'CONTINUOUS',capturedElapsedMs:1,worldStartedElapsedMs:0,nativeTimestampMs:null,camera:null,worldPoint:null,movementMeters:null,interruptionReasons:[]} as const;
 const checkpoint={worldId:'world',sequence:1,worldStartedElapsedMs:0,continuity:'CONTINUOUS' as const,interruptionReasons:[]};
 await queue.saveCapture({taskId:88,sessionId:'spatial-session',clientCaptureId:'spatial',slotId:'spatial-slot',nonce:'n',sha256:'hash',claimedCapturedAt:'2026-10-07T00:00:00Z',elapsedMs:1,bootId:'boot',deviceId:'device',spatialEvidence:{...spatialEvidence,interruptionReasons:[]}},new Uint8Array([8]),checkpoint);
 await queue.lockQueue();await queue.unlockQueue({companyId:4,id:4});
 assert.deepEqual((await queue.queueRows(88))[0].metadata.spatialEvidence,spatialEvidence);assert.equal((await queue.getSession(88))?.spatialCheckpoint?.sequence,1);
 await queue.persistSpatialCheckpoint(88,'spatial-session',{...checkpoint,continuity:'BROKEN',interruptionReasons:['BACKGROUND']});
 await queue.saveSession(local);assert.equal((await queue.getSession(88))?.spatialCheckpoint?.continuity,'BROKEN');
 assert.deepEqual(Array.from(await queue.queueBytes('spatial')),[8]);
});
test('spatial JSON accompanies both multipart retry and optional manifest without uploading frames',async()=>{
 await queue.unlockQueue({companyId:4,id:4});const row=(await queue.queueRows(88))[0];
 const {uploadCapture,commitManifest}=await import('./api');const {client}=await import('../api/client');
 const originalFetch=globalThis.fetch,adapter=client.defaults.adapter;
 globalThis.fetch=async(_url,input)=>{const form=input!.body as FormData;assert.deepEqual(JSON.parse(String(form.get('spatialEvidence'))),row.metadata.spatialEvidence);assert.equal(form.get('photo')!==null,true);assert.equal(form.get('video'),null);return new Response(JSON.stringify({data:{attemptId:'spatial-attempt',assetId:'asset',state:'RECEIVED'}}),{status:202});};
 client.defaults.adapter=async config=>{assert.deepEqual(JSON.parse(config.data).spatialEvidence,row.metadata.spatialEvidence);return {data:{data:{}},status:201,statusText:'OK',headers:{},config};};
 try{await uploadCapture(row,queue.queueAccount()!);await commitManifest(row);assert.deepEqual(Array.from(await queue.queueBytes('spatial')),[8]);}finally{globalThis.fetch=originalFetch;client.defaults.adapter=adapter;}
});
after(async()=>{await queue.lockQueue();rmSync(directory,{recursive:true,force:true});});
