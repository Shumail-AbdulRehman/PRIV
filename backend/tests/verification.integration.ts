import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import pg from 'pg';
// This suite creates a fresh database on an explicitly local PostgreSQL server.
// It never resets/drops the supplied database and never loads the customer URL.
const source=process.env.VERIFICATION_TEST_DATABASE_URL;
if(!source)throw new Error('Set VERIFICATION_TEST_DATABASE_URL to isolated local PostgreSQL');
const url=new URL(source);
if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||!url.pathname.startsWith('/priv_verification_test'))throw new Error('Integration tests require local priv_verification_test database');
const database=`priv_verification_test_${Date.now()}_${Math.floor(Math.random()*10000)}`;
const admin=new pg.Client({connectionString:source});await admin.connect();
await admin.query(`CREATE DATABASE "${database}"`);await admin.end();
url.pathname=`/${database}`;process.env.DATABASE_URL=url.toString();process.env.NODE_ENV="test";
const client=new pg.Client({connectionString:url.toString()});await client.connect();
const migrations=fileURLToPath(new URL('../prisma/migrations/',import.meta.url));
const names=(await readdir(migrations)).filter(n=>/^\d/.test(n)).sort();
for(const name of names.filter(n=>n<'20261004'))await client.query(await readFile(`${migrations}/${name}/migration.sql`,'utf8'));
const company=(await client.query(`INSERT INTO "Company" (name,"updatedAt") VALUES ('Historical migration fixture',NOW()) RETURNING id`)).rows[0].id;
const location=(await client.query(`INSERT INTO "Location" (name,address,"companyId",latitude,longitude,"updatedAt") VALUES ('Historical room','test',$1,'0','0',NOW()) RETURNING id`,[company])).rows[0].id;
const oldTask=(await client.query(`INSERT INTO "TaskInstance" (title,date,"shiftStart","shiftEnd",status,"locationId","updatedAt") VALUES ('Historical completion',NOW(),NOW(),NOW(),'COMPLETED',$1,NOW()) RETURNING id`,[location])).rows[0].id;
for(const name of names.filter(n=>n>='20261004'))await client.query(await readFile(`${migrations}/${name}/migration.sql`,'utf8'));
assert.deepEqual((await client.query(`SELECT "verificationVersion","completionOutcome" FROM "TaskInstance" WHERE id=$1`,[oldTask])).rows[0],{verificationVersion:1,completionOutcome:'LEGACY_RECORDED'});
const {prisma}=await import('../src/prisma/prisma.js');
const {claimVerificationJob,publishJobResult,failVerificationJob,enqueueVerificationJob}=await import('../src/services/verification-v2/jobQueue.service.js');
const manager=await prisma.manager.create({data:{name:'Admin',email:`${randomUUID()}@test.invalid`,password:'test-only',role:'ADMIN',companyId:company}});
const actor={id:manager.id,role:'ADMIN' as const,companyId:company};
const staff=await prisma.staff.create({data:{name:'Worker',email:`${randomUUID()}@test.invalid`,password:'test-only',companyId:company,locationId:location}});
const area=await prisma.area.create({data:{locationId:location,name:'Test washroom',roomType:'WASHROOM',status:'ACTIVE'}});
const task=await prisma.taskInstance.create({data:{title:'Queue task',locationId:location,staffId:staff.id,date:new Date(),shiftStart:new Date(),shiftEnd:new Date(),areaId:area.id,verificationVersion:2,areaNameSnapshot:area.name,inventoryVersion:1,policySnapshot:{version:1},verificationDeadline:new Date(),uploadDeadline:new Date()}});
const assignment=await prisma.taskAssignment.create({data:{taskInstanceId:task.id,staffId:staff.id}});
const session=await prisma.captureSession.create({data:{taskInstanceId:task.id,areaId:area.id,staffId:staff.id,assignmentId:assignment.id,assignmentEpoch:0,deviceId:'test',qrVersion:1,policyVersion:1,captureExpiresAt:new Date(Date.now()+600000),uploadExpiresAt:new Date(Date.now()+900000),presenceStatus:'ACCEPTABLE',locationCheck:{},serverTimeAnchor:new Date(),clientBootId:'test'}});
async function attempt(hash='a'.repeat(64)){const slot=await prisma.captureSlot.create({data:{sessionId:session.id,contextKey:'entrance',sequence:1,nonceHash:'hash',expiresAt:session.captureExpiresAt}});return prisma.verificationAttempt.create({data:{contextKey:'entrance',sessionId:session.id,slotId:slot.id,staffId:staff.id,assignmentEpoch:0,clientCaptureId:randomUUID(),claimedCapturedAt:new Date(),anchoredElapsedMs:0n,timingEvidence:'UNCERTAIN',committedHash:hash}});}
const attempts=await Promise.all(Array.from({length:5},attempt));
await prisma.$transaction(async tx=>{for(const a of attempts)await enqueueVerificationJob(tx,{companyId:company,attemptId:a.id,stage:'COVERAGE',evaluatorVersion:'v1'});});
const claims=await Promise.all(Array.from({length:5},()=>claimVerificationJob()));
assert.equal(claims.filter(Boolean).length,2,'at most two jobs per company across concurrent claims');
const first=claims.find(Boolean)!;
assert.equal(await publishJobResult(first,{result:'ok'}),true);
assert.equal(await publishJobResult(first,{result:'changed'}),false,'result publication is exactly once');
const second=claims.filter(Boolean)[1]!;
await prisma.verificationJob.update({where:{id:second.id},data:{leaseUntil:new Date(Date.now()-1)}});
assert.equal(await publishJobResult(second,{result:'stale'}),false,'expired leases cannot publish');
const reclaimed=await claimVerificationJob();assert.ok(reclaimed);assert.equal(reclaimed.id,second.id);assert.notEqual(reclaimed.leaseToken,second.leaseToken);
assert.equal(await failVerificationJob(second),false,'previous lease owner cannot fail new owner work');
assert.equal(await failVerificationJob(reclaimed),true);
const retry=await prisma.verificationJob.findUniqueOrThrow({where:{id:reclaimed.id}});assert.equal(retry.state,'RETRY_WAIT');
assert.ok(+retry.availableAt>Date.now());
const foreignCompany=await prisma.company.create({data:{name:'Other tenant'}});
await assert.rejects(()=>prisma.verificationJob.create({data:{companyId:foreignCompany.id,attemptId:attempts[0]!.id,stage:'CROSS_TENANT',evaluatorVersion:'v1'}}));
await assert.rejects(()=>prisma.captureSession.create({data:{taskInstanceId:oldTask,areaId:area.id,staffId:staff.id,assignmentId:assignment.id,assignmentEpoch:0,deviceId:'x',qrVersion:1,policyVersion:1,captureExpiresAt:new Date(),uploadExpiresAt:new Date(),presenceStatus:'ACCEPTABLE',locationCheck:{},serverTimeAnchor:new Date(),clientBootId:'x'}}));
console.log('PASS: restored legacy migration/backfill, tenant/session bindings, concurrent queue caps, lease expiry, stale workers, retries and exactly-once publication');

const {createArea,bulkItems,updateItem,areaDetail}=await import('../src/services/area.service.js');
const {permanentlyDelete}=await import('../src/services/deletion.service.js');
const {archiveRetainedEntity}=await import('../src/services/verification-v2/retention.service.js');
const inventory=await createArea(actor,location,{name:'Inventory fixtures',roomType:'WASHROOM',counts:[{fixtureType:'TOILET',count:2}]});
const before=await areaDetail(actor,inventory.id);assert.equal(before.items.length,2);
await assert.rejects(()=>bulkItems(actor,inventory.id,99,[{fixtureType:'SINK',count:1}]));
assert.equal((await areaDetail(actor,inventory.id)).items.length,2,'stale edits roll back');
await updateItem(actor,inventory.id,before.items[0]!.id,{expectedInventoryVersion:1,status:'RETIRED'});
await bulkItems(actor,inventory.id,2,[{fixtureType:'TOILET',count:1}]);
const after=await areaDetail(actor,inventory.id);assert.equal(after.items[2]!.stableCode,'TOILET-03');
await assert.rejects(()=>updateItem(actor,inventory.id,before.items[0]!.id,{expectedInventoryVersion:3,status:'ACTIVE'}));
await assert.rejects(()=>updateItem(actor,inventory.id,999999,{expectedInventoryVersion:3,displayName:'Foreign fixture'}));
const outboxBefore=await prisma.deletedMedia.count();
await assert.rejects(()=>permanentlyDelete('location',location,actor));
assert.equal(await prisma.deletedMedia.count(),outboxBefore,'deletion protection executes before media enqueue');
const sharp=(await import('sharp')).default;
const photo=await sharp({create:{width:600,height:600,channels:3,background:'#888888'}}).jpeg().toBuffer();
const {sha256}=await import('../src/services/verification-v2/quality.service.js');
const {storeReservedEvidence,storeStandardEvidence,evidenceContent}=await import('../src/services/verification-v2/evidence.service.js');
const reserved=await attempt(sha256(photo));const stored=new Map<string,string>();let uploads=0;
let lostAcknowledgement=true;
const io={store:async(bytes:Buffer,id:string,hash:string)=>{if(stored.has(id)){assert.equal(stored.get(id),hash);}else{uploads++;stored.set(id,hash);}if(lostAcknowledgement&&id.endsWith('/review')){lostAcknowledgement=false;throw new Error('Simulated storage response lost');}return {asset_id:id};},read:async()=>photo};
const staffActor={id:staff.id,companyId:company,role:'STAFF' as const};
await assert.rejects(()=>storeReservedEvidence(staffActor,reserved.id,photo,io));
assert.equal((await prisma.verificationAttempt.findUniqueOrThrow({where:{id:reserved.id}})).mediaAssetId,null);
const receipt=await storeReservedEvidence(staffActor,reserved.id,photo,io);
assert.equal(receipt.state,'RECEIVED');assert.equal(uploads,2,'original and stripped review derivative stored privately');
const retryReceipt=await storeReservedEvidence(staffActor,reserved.id,photo,io);assert.equal(retryReceipt.assetId,receipt.assetId);assert.equal(uploads,2);
assert.equal(await prisma.verificationJob.count({where:{attemptId:reserved.id,stage:'QUALITY'}}),1);
await assert.rejects(()=>storeReservedEvidence(staffActor,reserved.id,Buffer.from('different bytes'),io));
await assert.rejects(()=>evidenceContent(actor,receipt.assetId,'review',io));
await prisma.evidenceAsset.update({where:{id:receipt.assetId},data:{privacyState:'SAFE'}});
assert.equal((await evidenceContent(staffActor,receipt.assetId,'review',io)).bytes.length,photo.length);
await assert.rejects(()=>evidenceContent(staffActor,receipt.assetId,'original',io));
assert.equal((await evidenceContent(actor,receipt.assetId,'original',io)).bytes.length,photo.length);
await assert.rejects(()=>prisma.evidenceAsset.delete({where:{id:receipt.assetId}}));
await archiveRetainedEntity('staff',staff.id,actor);
assert.equal((await prisma.staff.findUniqueOrThrow({where:{id:staff.id}})).isActive,false);
assert.equal((await prisma.captureSession.findUniqueOrThrow({where:{id:session.id}})).state,'REVOKED');
assert.equal(await prisma.verificationAttempt.count({where:{sessionId:session.id}}),6,'archive preserves attempts');
console.log('PASS: inventory version conflicts, stable replacement codes, cross-area edits, deletion outbox protection and archive preservation');

const {configureTemplateInventory,validateInventorySelection,createTaskInstanceWithSnapshot,repairUnstartedInventoryTask}=await import('../src/services/verification-v2/inventorySnapshot.service.js');
const {getZonedDayRange}=await import('../src/utils/dateTime.js');
const now=new Date();const base=getZonedDayRange(now,'Asia/Karachi').start;
const worker=await prisma.staff.create({data:{name:'Assigned worker',email:`${randomUUID()}@test.invalid`,password:'test-only',companyId:company,locationId:location,shiftStart:new Date(+base+8*3600000),shiftEnd:new Date(+base+18*3600000)}});
async function template(title:string,recurringType:'DAILY'|'ONCE'|null,mode:'ALL'|'SUBSET'='ALL'){
 const row=await prisma.taskTemplate.create({data:{title,locationId:location,staffId:worker.id,shiftStart:new Date(+base+9*3600000),shiftEnd:new Date(+base+10*3600000),effectiveDate:base,recurringType}});
 await prisma.$transaction(tx=>configureTemplateInventory(tx,row.id,location,{areaId:inventory.id,inventorySelection:mode,expectedInventoryVersion:3,selectedItems:mode==='SUBSET'?[{areaItemId:after.items[1]!.id,mandatory:true}]:[]}));
 return row;
}
const all=await template('All inventory daily','DAILY');const subset=await template('Subset once','ONCE','SUBSET');
await assert.rejects(()=>prisma.$transaction(tx=>validateInventorySelection(tx,location,{areaId:inventory.id,inventorySelection:'SUBSET',expectedInventoryVersion:3,selectedItems:[{areaItemId:999999,mandatory:true}]})));
await assert.rejects(()=>prisma.$transaction(tx=>validateInventorySelection(tx,location,{areaId:inventory.id,inventorySelection:'SUBSET',expectedInventoryVersion:3,selectedItems:[]})));
const {runDailyTaskScheduler}=await import('../src/cron/dailyTaskScheduler.js');
const {runOnceTaskScheduler}=await import('../src/cron/onceTaskScheduler.js');
const {runStartupCron}=await import('../src/cron/startupCron.js');
await runDailyTaskScheduler(now);await runOnceTaskScheduler(now);
const dailyInstance=await prisma.taskInstance.findFirstOrThrow({where:{templateId:all.id},include:{verificationItems:{include:{requirements:true}},assignments:true}});
const onceInstance=await prisma.taskInstance.findFirstOrThrow({where:{templateId:subset.id},include:{verificationItems:true}});
assert.equal(dailyInstance.verificationItems.length,2);assert.equal(dailyInstance.verificationItems.flatMap(i=>i.requirements).length,4);assert.equal(dailyInstance.assignments.length,1);
assert.equal(onceInstance.verificationItems.length,1);assert.equal(onceInstance.verificationItems[0]!.sourceAreaItemId,after.items[1]!.id);
const startup=await template('Startup snapshot','DAILY');
const legacy=await prisma.taskTemplate.create({data:{title:'Legacy startup',locationId:location,staffId:worker.id,shiftStart:new Date(+base+11*3600000),shiftEnd:new Date(+base+12*3600000),effectiveDate:base,recurringType:'DAILY',referenceImageUrl:'https://legacy.test/reference.jpg',referenceImages:{create:[{name:'Legacy reference',imageUrl:'https://legacy.test/reference.jpg',sortOrder:0}]}}});
await runStartupCron(now);
assert.equal(await prisma.taskInstance.count({where:{templateId:all.id}}),1);assert.equal(await prisma.taskInstance.count({where:{templateId:subset.id}}),1);
const startupInstance=await prisma.taskInstance.findFirstOrThrow({where:{templateId:startup.id},include:{verificationItems:true}});assert.equal(startupInstance.verificationItems.length,2);
const legacyInstance=await prisma.taskInstance.findFirstOrThrow({where:{templateId:legacy.id},include:{referenceImages:true}});assert.equal(legacyInstance.verificationVersion,1);assert.equal(legacyInstance.referenceImages.length,1);
const concurrent=await template('Concurrent generation',null);
const input={templateId:concurrent.id,title:'Stale scheduler title',locationId:location,date:base,baseDate:base,shiftStart:all.shiftStart,shiftEnd:all.shiftEnd};
const generated=await Promise.all(Array.from({length:5},()=>createTaskInstanceWithSnapshot(input)));
assert.equal(generated.filter(g=>g?.created).length,1);assert.equal(new Set(generated.map(g=>g?.id)).size,1);
assert.equal(await prisma.taskAssignment.count({where:{taskInstanceId:generated[0]!.id}}),1);
const originalName=dailyInstance.verificationItems[0]!.nameSnapshot;
const repairTemplate=await template('Explicit unstarted repair',null);
const pendingRepair=await prisma.taskInstance.create({data:{templateId:repairTemplate.id,title:'Pending old-contract task',locationId:location,staffId:worker.id,date:new Date(Date.now()+12345),shiftStart:new Date(),shiftEnd:new Date(Date.now()+3600000),referenceImageUrl:'https://legacy.test/keep.jpg',assignments:{create:{staffId:worker.id}}},include:{assignments:true}});
const repairInput={taskId:pendingRepair.id,templateId:repairTemplate.id,locationId:location,expectedInventoryVersion:3};
await assert.rejects(()=>repairUnstartedInventoryTask({...repairInput,locationId:location+99999}));
await assert.rejects(()=>repairUnstartedInventoryTask({...repairInput,expectedInventoryVersion:999}));
assert.equal((await prisma.taskInstance.findUniqueOrThrow({where:{id:pendingRepair.id}})).verificationVersion,1);
await prisma.taskInstance.update({where:{id:pendingRepair.id},data:{proofImageUrls:['https://legacy.test/evidence.jpg']}});
await assert.rejects(()=>repairUnstartedInventoryTask(repairInput));
await prisma.taskInstance.update({where:{id:pendingRepair.id},data:{proofImageUrls:[],status:'IN_PROGRESS',startedAt:new Date()}});
await assert.rejects(()=>repairUnstartedInventoryTask(repairInput));
await prisma.taskInstance.update({where:{id:pendingRepair.id},data:{status:'PENDING',startedAt:null,shiftEnd:new Date(Date.now()-1000)}});
await assert.rejects(()=>repairUnstartedInventoryTask(repairInput));
await prisma.taskInstance.update({where:{id:pendingRepair.id},data:{shiftEnd:pendingRepair.shiftEnd}});
const repairs=await Promise.allSettled([repairUnstartedInventoryTask(repairInput),repairUnstartedInventoryTask(repairInput)]);
assert.equal(repairs.filter(r=>r.status==='fulfilled').length,1,'single-task repair is serialized and cannot duplicate snapshots');
const repaired=await prisma.taskInstance.findUniqueOrThrow({where:{id:pendingRepair.id},include:{assignments:true,verificationItems:{include:{requirements:true}}}});
assert.equal(repaired.verificationVersion,2);assert.equal(repaired.areaId,inventory.id);
assert.equal(repaired.verificationItems.length,2);assert.equal(repaired.verificationItems.flatMap(i=>i.requirements).length,4);
assert.equal(repaired.assignments[0]!.id,pendingRepair.assignments[0]!.id);assert.equal(+repaired.shiftEnd,+pendingRepair.shiftEnd);
assert.equal(repaired.referenceImageUrl,pendingRepair.referenceImageUrl);assert.equal(repaired.status,'PENDING');assert.equal(repaired.completionOutcome,null);
assert.ok(repaired.verificationDeadline);assert.ok(repaired.uploadDeadline);
assert.equal(await prisma.auditLog.count({where:{entityId:repaired.id,action:'REPAIR_UNSTARTED_INVENTORY_TASK'}}),1);
assert.equal(await prisma.verificationAttempt.count({where:{session:{taskInstanceId:repaired.id}}}),0);
console.log('PASS: explicit pending-task repair preserves assignments/history, creates full inventory gates, rejects started/evidenced/expired/stale tasks and serializes concurrent repairs');
await updateItem(actor,inventory.id,after.items[1]!.id,{expectedInventoryVersion:3,displayName:'Renamed fixture'});
assert.equal((await prisma.taskVerificationItem.findUniqueOrThrow({where:{id:dailyInstance.verificationItems[0]!.id}})).nameSnapshot,originalName);
await assert.rejects(()=>prisma.taskVerificationItem.update({where:{id:dailyInstance.verificationItems[0]!.id},data:{nameSnapshot:'Rewrite history'}}));
await assert.rejects(()=>prisma.taskInstance.update({where:{id:dailyInstance.id},data:{policySnapshot:{version:99}}}));
await bulkItems(actor,inventory.id,4,[{fixtureType:'SINK',count:1}]);
const future=await createTaskInstanceWithSnapshot({...input,templateId:all.id,date:new Date(+base+86400000),baseDate:new Date(+base+86400000)});
assert.ok(future);assert.equal(await prisma.taskVerificationItem.count({where:{taskInstanceId:future.id}}),3);
assert.equal(await prisma.taskVerificationItem.count({where:{taskInstanceId:dailyInstance.id}}),2);
const {markCurrentAssignmentStarted,markCurrentAssignmentCompleted}=await import('../src/services/taskAssignment.service.js');
await markCurrentAssignmentStarted(dailyInstance.id,worker.id,now);assert.equal((await prisma.taskAssignment.findUniqueOrThrow({where:{id:dailyInstance.assignments[0]!.id}})).status,'STARTED');
await markCurrentAssignmentCompleted(dailyInstance.id,worker.id,now);assert.equal((await prisma.taskAssignment.findUniqueOrThrow({where:{id:dailyInstance.assignments[0]!.id}})).status,'STARTED','v2 assignment cannot complete independently of guarded task finalization');
await updateItem(actor,inventory.id,after.items[1]!.id,{expectedInventoryVersion:5,status:'RETIRED'});
assert.equal((await prisma.taskTemplate.findUniqueOrThrow({where:{id:all.id}})).setupStatus,'NEEDS_REVIEW');
const blocked=await createTaskInstanceWithSnapshot({...input,templateId:all.id,date:new Date(+base+2*86400000),baseDate:new Date(+base+2*86400000)});assert.equal(blocked,null);
assert.equal(await prisma.taskInstance.count({where:{templateId:all.id}}),2,'retirement never silently shrinks required inventory');
assert.equal(await prisma.verificationException.count({where:{dedupeKey:`setup:template:${all.id}`}}),1);
console.log('PASS: daily/once/startup snapshots, legacy reference drain, atomic concurrent generation and assignments, subsets, immutable history, future ALL expansion and retirement review');
const captureStaff=await prisma.staff.create({data:{name:'Capture worker',email:`${randomUUID()}@test.invalid`,password:'test-only',companyId:company,locationId:location}});
const captureActor={id:captureStaff.id,companyId:company,role:'STAFF' as const};
// Steps 9–14: real transaction tests, external storage/provider calls are injected.
process.env.VERIFICATION_QR_SECRET='q'.repeat(64);process.env.VERIFICATION_SLOT_SECRET='s'.repeat(64);
const {createCaptureSession,reserveAttempt,retakeSlots,resumeSession}=await import('../src/services/verification-v2/captureSession.service.js');
const {signAreaQr}=await import('../src/services/verification-v2/qr.service.js');
const {finalizeTask}=await import('../src/services/verification-v2/completion.service.js');
const {managerDecision,raiseIssue}=await import('../src/services/verification-v2/exception.service.js');
const {assessCleanliness}=await import('../src/services/verification-v2/cleanliness.service.js');
const {processVerificationJob}=await import('../src/services/verification-v2/pipeline.service.js');
const {defaultVerificationPolicy}=await import('../src/services/verification-v2/verificationPolicy.service.js');
await prisma.location.update({where:{id:location},data:{isActive:true}});
await prisma.staff.update({where:{id:captureStaff.id},data:{isActive:true}});
const captureArea=await createArea(actor,location,{name:'Capture room',roomType:'WASHROOM',counts:[{fixtureType:'TOILET',count:1}]});
const start=new Date(Date.now()-60000),end=new Date(Date.now()+3600000);
const captureTemplate=await prisma.taskTemplate.create({data:{title:'Capture test',locationId:location,staffId:captureStaff.id,shiftStart:start,shiftEnd:end,effectiveDate:new Date(),verificationVersion:2,areaId:captureArea.id,inventoryConfigVersion:1,inventorySelection:'ALL',setupStatus:'READY'}});
const capturedTask=await createTaskInstanceWithSnapshot({templateId:captureTemplate.id,title:'Capture test',locationId:location,date:new Date(),shiftStart:start,shiftEnd:end});assert.ok(capturedTask);
await prisma.taskInstance.update({where:{id:capturedTask.id},data:{status:'IN_PROGRESS',startedAt:start}});
await prisma.taskAssignment.updateMany({where:{taskInstanceId:capturedTask.id},data:{status:'STARTED',startedAt:start}});
const sessionBody={requestId:randomUUID(),areaQr:signAreaQr(captureArea),deviceId:'device-a',clientBootId:'boot-a',location:{latitude:0,longitude:0,accuracy:1,sampledAt:new Date().toISOString()},clientTime:new Date().toISOString()};
const sessions=await Promise.all(Array.from({length:3},()=>createCaptureSession(captureActor,capturedTask.id,sessionBody)));
assert.equal(new Set(sessions.map(s=>s.id)).size,1,'concurrent identical session requests create one session');
const activeSession=sessions[0]!;assert.equal(activeSession.slots.length,4);assert.equal(activeSession.presenceStatus,'ACCEPTABLE');
await assert.rejects(()=>createCaptureSession(captureActor,capturedTask.id,{...sessionBody,requestId:randomUUID()}));
await assert.rejects(()=>createCaptureSession(captureActor,capturedTask.id,{...sessionBody,deviceId:'different'}),'same request cannot change device');
await assert.rejects(()=>createCaptureSession({...captureActor,companyId:foreignCompany.id},capturedTask.id,sessionBody));
const rawNoise=Buffer.alloc(640*640*3);for(let i=0;i<rawNoise.length;i++)rawNoise[i]=(i*31+(i>>8)*17)%256;
const noise=await sharp(rawNoise,{raw:{width:640,height:640,channels:3}}).jpeg().toBuffer();
const privateStore=new Map<string,Buffer>();const captureIo={store:async(bytes:Buffer,id:string,_hash:string)=>{if(!privateStore.has(id))privateStore.set(id,bytes);return {asset_id:id};},read:async(id:string)=>{const bytes=privateStore.get(id);assert.ok(bytes);return bytes;}};
const slot=activeSession.slots.find(s=>s.requirementId)!;
const metadata={deviceId:'device-a',clientCaptureId:randomUUID(),slotId:slot.id,nonce:slot.nonce,sha256:sha256(noise),claimedCapturedAt:activeSession.issuedAt.toISOString(),elapsedMs:0,bootId:'boot-a'};
const reservations=await Promise.all(Array.from({length:3},()=>reserveAttempt(captureActor,activeSession.id,metadata,true)));
assert.equal(new Set(reservations.map(a=>a.id)).size,1,'manifest commitment consumes slot exactly once');
await assert.rejects(()=>reserveAttempt(captureActor,activeSession.id,{...metadata,sha256:'b'.repeat(64)},false));
await assert.rejects(()=>reserveAttempt(captureActor,activeSession.id,{...metadata,clientCaptureId:randomUUID()},false),'slot replay');
const receipts=await Promise.all(Array.from({length:3},()=>storeReservedEvidence(captureActor,reservations[0]!.id,noise,captureIo)));
assert.equal(new Set(receipts.map(r=>r.assetId)).size,1,'concurrent duplicate upload stores one evidence identity');
assert.equal(await prisma.verificationJob.count({where:{attemptId:reservations[0]!.id,stage:'QUALITY'}}),1);
const fakeProvider={assess:async(stage:string,prompt='')=>{
 const match=prompt.match(/Assess exactly these surfaces individually: (\[[^\]]*\])/);const surfaces=match?JSON.parse(match[1]!):['bowl','seat'];
 return {result:stage==='privacy'?{status:'SAFE',reasonCode:'CLEAN'}:stage==='coverage'?{verdict:'MATCH',observedFixture:'TOILET',observedView:'bowl_seat',observedLabel:null,identityConsistent:true,privacyFlag:false,reasonCode:'CLEAN'}:{verdict:'DIRTY',surfaces:surfaces.map((surface:string)=>({surface,verdict:'DIRTY'})),reasonCode:'CLEANING_REQUIRED'},metadata:{provider:'fake',model:'fixture',providerVersion:'1',promptVersion:stage+'-v1',latencyMs:1,usage:null,costUsd:0,requestId:'test'}};
}};
async function executeStage(attemptId:string,stage:string){const j=await prisma.verificationJob.findFirstOrThrow({where:{attemptId,stage,state:'PENDING'}});const running=await prisma.verificationJob.update({where:{id:j.id},data:{state:'RUNNING',attempts:1,leaseToken:randomUUID(),leaseUntil:new Date(Date.now()+90000)}});await processVerificationJob(running,fakeProvider as any,captureIo.read,{evaluate:(image,rubric,view)=>assessCleanliness(fakeProvider as any,image,rubric,view)});}
for(const stage of ['QUALITY','PRIVACY','COVERAGE','CLEANLINESS'])await executeStage(reservations[0]!.id,stage);
assert.equal((await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:slot.requirementId!}})).state,'CLEANING_REQUIRED');
assert.equal(await prisma.verificationException.count({where:{taskInstanceId:capturedTask.id}}),0,'first dirty failure stays with staff');
const failedRequirement=await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:slot.requirementId!}});
const newSlots=await retakeSlots(captureActor,activeSession.id,{deviceId:'device-a',requirements:[{requirementId:failedRequirement.id,expectedGeneration:failedRequirement.decisionVersion}]});assert.equal(newSlots.length,1);
assert.deepEqual((await retakeSlots(captureActor,activeSession.id,{deviceId:'device-a',requirements:[{requirementId:failedRequirement.id,expectedGeneration:failedRequirement.decisionVersion}]})).map(s=>s.id),newSlots.map(s=>s.id),'allocation retry reuses the same slots');
await prisma.captureSession.update({where:{id:activeSession.id},data:{state:'PAUSED'}});
assert.equal((await resumeSession(captureActor,activeSession.id,{deviceId:'device-a',clientBootId:'boot-a'})).state,'ACTIVE');
const beforeEpoch=(await prisma.taskInstance.findUniqueOrThrow({where:{id:capturedTask.id}})).assignmentEpoch;
const handoverWorker=await prisma.staff.create({data:{name:'Handover',email:`${randomUUID()}@test.invalid`,password:'test-only',companyId:company,locationId:location}});
await prisma.taskInstance.update({where:{id:capturedTask.id},data:{staffId:handoverWorker.id}});
assert.equal((await prisma.taskInstance.findUniqueOrThrow({where:{id:capturedTask.id}})).assignmentEpoch,beforeEpoch+1);
assert.equal((await prisma.captureSession.findUniqueOrThrow({where:{id:activeSession.id}})).state,'REVOKED');
await assert.rejects(()=>reserveAttempt(captureActor,activeSession.id,metadata,false),'old assignment cannot ingest');
assert.equal((await prisma.evidenceAsset.findUniqueOrThrow({where:{id:receipts[0]!.assetId}})).sha256,sha256(noise),'evidence survives handover');
// Restore a current assignment and prove waiver versus verified completion and exactly-once finalization.
await prisma.taskInstance.update({where:{id:capturedTask.id},data:{staffId:captureStaff.id}});
await prisma.taskAssignment.updateMany({where:{taskInstanceId:capturedTask.id},data:{isCurrent:true,status:'STARTED'}});
const caseRow=await prisma.$transaction(tx=>raiseIssue(tx,capturedTask.id,'DAMAGED',failedRequirement.id));
const requirements=await prisma.taskEvidenceRequirement.findMany({where:{item:{taskInstanceId:capturedTask.id}}});
for(const r of requirements){const c=await prisma.verificationException.findUniqueOrThrow({where:{id:caseRow.id}});await managerDecision(actor,c.id,{requestId:randomUUID(),expectedVersion:c.rowVersion,requirementId:r.id,action:'WAIVE_REQUIREMENT',reasonCode:'DAMAGED',note:'Explicit test waiver for damaged fixture'});}
assert.equal((await prisma.taskInstance.findUniqueOrThrow({where:{id:capturedTask.id}})).completionOutcome,'COMPLETED_WITH_EXCEPTIONS');
await Promise.all(Array.from({length:3},()=>prisma.$transaction(tx=>finalizeTask(tx,capturedTask.id))));
assert.equal(await prisma.auditLog.count({where:{entityType:'TASK_INSTANCE',entityId:capturedTask.id,action:'VERIFICATION_COMPLETED'}}),1);
assert.equal((await prisma.taskAssignment.findFirstOrThrow({where:{taskInstanceId:capturedTask.id}})).status,'COMPLETED');
console.log('PASS: concurrent sessions/manifests/uploads, replay and changed bytes, separate provider stages, no first-failure spam, targeted retake, handover revocation, preserved evidence, waiver outcome and exactly-once completion');

// Independent final results serialize on the task lock and produce one completion.
async function freshCaptureTask(label:string){const t=await createTaskInstanceWithSnapshot({templateId:captureTemplate.id,title:label,locationId:location,date:new Date(Date.now()+Math.floor(Math.random()*1000000)),shiftStart:start,shiftEnd:end});assert.ok(t);await prisma.taskInstance.update({where:{id:t.id},data:{status:'IN_PROGRESS',startedAt:start}});await prisma.taskAssignment.updateMany({where:{taskInstanceId:t.id},data:{status:'STARTED',startedAt:start}});const ar=await prisma.area.findUniqueOrThrow({where:{id:captureArea.id}});const s=await createCaptureSession(captureActor,t.id,{...sessionBody,requestId:randomUUID(),areaQr:signAreaQr(ar),location:{...sessionBody.location,sampledAt:new Date().toISOString()}});return {task:t,session:s};}
async function photoFor(seed:number){const pixels=Buffer.alloc(640*640*3);for(let i=0;i<pixels.length;i++)pixels[i]=(i*(seed*2+13)+(i>>7)*(seed+29))%256;return sharp(pixels,{raw:{width:640,height:640,channels:3}}).jpeg().toBuffer();}
async function ingestFixture(s:typeof activeSession,slotId:string,seed:number,evidenceActor=captureActor,photo?:Buffer){const sl=s.slots.find(x=>x.id===slotId)!;const bytes=photo??await photoFor(seed);const m={...metadata,clientCaptureId:randomUUID(),slotId:sl.id,nonce:sl.nonce,sha256:sha256(bytes),claimedCapturedAt:s.issuedAt.toISOString(),elapsedMs:0};const a=await reserveAttempt(evidenceActor,s.id,m,true);await storeReservedEvidence(evidenceActor,a.id,bytes,captureIo);return a;}
const finalRace=await freshCaptureTask('Final race');const finalSlots=finalRace.session.slots.filter(s=>s.requirementId);const finalAttempts=[];for(let i=0;i<finalSlots.length;i++)finalAttempts.push(await ingestFixture(finalRace.session,finalSlots[i]!.id,101+i));
await prisma.captureSession.update({where:{id:finalRace.session.id},data:{contextStatus:'ACCEPTABLE'}});
await prisma.evidenceAsset.updateMany({where:{taskInstanceId:finalRace.task.id},data:{privacyState:'SAFE'}});
await prisma.verificationJob.updateMany({where:{attemptId:{in:finalAttempts.map(a=>a.id)}},data:{state:'SUCCEEDED',finishedAt:new Date()}});
await Promise.all(finalAttempts.map(a=>prisma.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM "TaskInstance" WHERE id=${finalRace.task.id} FOR UPDATE`;await tx.verificationAttempt.update({where:{id:a.id},data:{state:'PASSED'}});await tx.taskEvidenceRequirement.update({where:{id:a.requirementId!},data:{state:'PASSED'}});return finalizeTask(tx,finalRace.task.id);})));assert.equal((await prisma.taskInstance.findUniqueOrThrow({where:{id:finalRace.task.id}})).completionOutcome,'VERIFIED_COMPLETE');assert.equal(await prisma.auditLog.count({where:{entityId:finalRace.task.id,action:'VERIFICATION_COMPLETED'}}),1);
const spatialStaff=await prisma.staff.create({data:{name:'Spatial worker',email:`${randomUUID()}@test.invalid`,password:'test-only',companyId:company,locationId:location}});
const spatialActor={...captureActor,id:spatialStaff.id};
const spatialTemplate=await prisma.taskTemplate.create({data:{title:'Spatial binding validation',locationId:location,staffId:spatialStaff.id,shiftStart:start,shiftEnd:end,effectiveDate:new Date(),verificationVersion:2,areaId:captureArea.id,inventoryConfigVersion:1,inventorySelection:'ALL',setupStatus:'READY'}});
const spatialTask=await createTaskInstanceWithSnapshot({templateId:spatialTemplate.id,title:'Spatial binding validation',locationId:location,date:new Date(),shiftStart:start,shiftEnd:end});assert.ok(spatialTask);
await prisma.taskInstance.update({where:{id:spatialTask.id},data:{status:'IN_PROGRESS',startedAt:start}});await prisma.taskAssignment.updateMany({where:{taskInstanceId:spatialTask.id},data:{status:'STARTED',startedAt:start}});
const spatialArea=await prisma.area.findUniqueOrThrow({where:{id:captureArea.id}});
const spatialFixture={task:spatialTask,session:await createCaptureSession(spatialActor,spatialTask.id,{...sessionBody,requestId:randomUUID(),areaQr:signAreaQr(spatialArea),location:{...sessionBody.location,sampledAt:new Date().toISOString()}})};
const spatialSlots=spatialFixture.session.slots.filter(s=>s.requirementId).slice(0,2);
assert.equal(spatialSlots.length,2);
const spatialWorld=randomUUID();
function spatialMetadata(index:number,sequence:number){const sl=spatialSlots[index]!;return {...metadata,clientCaptureId:randomUUID(),slotId:sl.id,nonce:sl.nonce,claimedCapturedAt:new Date(+spatialFixture.session.issuedAt+sequence*10).toISOString(),elapsedMs:sequence*10,spatialEvidence:{version:1,sessionId:spatialFixture.session.id,worldId:spatialWorld,sequence,requirementId:sl.requirementId,contextKey:null,capability:'NO_SPATIAL',tracking:'UNAVAILABLE',continuity:'CONTINUOUS',capturedElapsedMs:sequence*10,worldStartedElapsedMs:0,nativeTimestampMs:null,camera:null,worldPoint:null,movementMeters:null,interruptionReasons:[]}};}
const spatialLater=spatialMetadata(1,2),spatialEarlier=spatialMetadata(0,1);
await assert.rejects(()=>reserveAttempt(spatialActor,spatialFixture.session.id,{...spatialLater,spatialEvidence:{...spatialLater.spatialEvidence,sessionId:randomUUID()}},true),'wrong spatial session');
const spatialReserved=await reserveAttempt(spatialActor,spatialFixture.session.id,spatialLater,true);
assert.equal(spatialReserved.spatialVersion,1);assert.deepEqual(spatialReserved.spatialEvidence,spatialLater.spatialEvidence);
assert.equal((await reserveAttempt(spatialActor,spatialFixture.session.id,{...spatialLater,spatialEvidence:JSON.stringify(spatialLater.spatialEvidence)},false)).id,spatialReserved.id);
await assert.rejects(()=>reserveAttempt(spatialActor,spatialFixture.session.id,{...spatialLater,spatialEvidence:{...spatialLater.spatialEvidence,worldId:randomUUID()}},false),'spatial idempotency binding');
await assert.rejects(()=>reserveAttempt(spatialActor,spatialFixture.session.id,{...spatialEarlier,spatialEvidence:{...spatialEarlier.spatialEvidence,sequence:2}},true),'spatial sequence reused');
const earlySpatial=await reserveAttempt(spatialActor,spatialFixture.session.id,spatialEarlier,true);
assert.equal(earlySpatial.spatialVersion,1,'offline earlier capture can arrive after later capture');
await assert.rejects(()=>prisma.verificationAttempt.update({where:{id:spatialReserved.id},data:{spatialEvidence:{...spatialLater.spatialEvidence,worldId:randomUUID()}}}),'immutable observation');
console.log('PASS: spatial metadata binding, multipart parsing, idempotency, sequence/order and immutable persistence');

const qrRace=await freshCaptureTask('QR race');const qrSlot=qrRace.session.slots.find(s=>s.requirementId)!;const qrAttempt=await ingestFixture(qrRace.session,qrSlot.id,231);
for(const stage of ['QUALITY','PRIVACY','COVERAGE'])await executeStage(qrAttempt.id,stage);
let releaseProvider!:()=>void;let enteredProvider!:()=>void;const entered=new Promise<void>(resolve=>enteredProvider=resolve),providerGate=new Promise<void>(resolve=>releaseProvider=resolve);
const slowProvider={assess:async(stage:string,prompt:string)=>{enteredProvider();await providerGate;return fakeProvider.assess(stage,prompt);}};
const qrJob=await prisma.verificationJob.findFirstOrThrow({where:{attemptId:qrAttempt.id,stage:'CLEANLINESS'}});const runningQr=await prisma.verificationJob.update({where:{id:qrJob.id},data:{state:'RUNNING',attempts:1,leaseToken:randomUUID(),leaseUntil:new Date(Date.now()+90000)}});
const processing=processVerificationJob(runningQr,slowProvider as any,captureIo.read,{evaluate:(image,rubric,view)=>assessCleanliness(slowProvider as any,image,rubric,view)});await entered;
const {rotateQr}=await import('../src/controllers/area.controller.js');const qrResponse:any={status(){return this;},json(){return this;}};
await rotateQr({params:{areaId:String(captureArea.id)},body:{expectedInventoryVersion:1},user:actor} as any,qrResponse);releaseProvider();await processing;
assert.equal((await prisma.verificationAttempt.findUniqueOrThrow({where:{id:qrAttempt.id}})).state,'REVIEW_REQUIRED','QR rotation blocks an in-flight cleanliness credit');assert.notEqual((await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:qrSlot.requirementId!}})).state,'PASSED');
await assert.rejects(()=>createCaptureSession(captureActor,qrRace.task.id,{...sessionBody,requestId:randomUUID()}),'old QR invalid after rotation');
assert.equal((await prisma.taskEvidenceRequirement.findFirstOrThrow({where:{item:{taskInstanceId:finalRace.task.id}}})).state,'PASSED','QR rotation preserves already-passed evidence');
const queuedQrSlot=qrRace.session.slots.find(s=>s.requirementId&&s.id!==qrSlot.id)!;
const queuedQrBytes=await photoFor(282);
const queuedQrAttempt=await reserveAttempt(captureActor,qrRace.session.id,{...metadata,clientCaptureId:randomUUID(),slotId:queuedQrSlot.id,nonce:queuedQrSlot.nonce,sha256:sha256(queuedQrBytes),claimedCapturedAt:qrRace.session.issuedAt.toISOString(),elapsedMs:0},false);
assert.equal(queuedQrAttempt.state,'REVIEW_REQUIRED');
assert.equal((await storeReservedEvidence(captureActor,queuedQrAttempt.id,queuedQrBytes,captureIo)).state,'REVIEW_REQUIRED','queued old-QR bytes are retained without automatic credit');
const inactiveRace=await freshCaptureTask('Inactive staff');await prisma.staff.update({where:{id:captureStaff.id},data:{isActive:false}});assert.equal((await prisma.captureSession.findUniqueOrThrow({where:{id:inactiveRace.session.id}})).state,'REVOKED');await assert.rejects(()=>resumeSession(captureActor,inactiveRace.session.id,{deviceId:'device-a',clientBootId:'boot-a'}));await prisma.staff.update({where:{id:captureStaff.id},data:{isActive:true}});
console.log('PASS: two final-result race, verified versus waived completion, QR rotation during AI, old-QR rejection, passed evidence preservation and inactive-staff revocation');

// A late old result cannot replace a manager-requested new capture generation.
const retakeRace=await freshCaptureTask('Stale result after retake');const retakeSlot=retakeRace.session.slots.find(s=>s.requirementId)!;const retakeAttempt=await ingestFixture(retakeRace.session,retakeSlot.id,315);
for(const stage of ['QUALITY','PRIVACY','COVERAGE'])await executeStage(retakeAttempt.id,stage);
let enterRetake!:()=>void,releaseRetake!:()=>void;const retakeEntered=new Promise<void>(resolve=>enterRetake=resolve),retakeGate=new Promise<void>(resolve=>releaseRetake=resolve);
const delayedRetakeProvider={assess:async(stage:string,prompt:string)=>{enterRetake();await retakeGate;return fakeProvider.assess(stage,prompt);}};
const retakeJob=await prisma.verificationJob.findFirstOrThrow({where:{attemptId:retakeAttempt.id,stage:'CLEANLINESS'}});const runningRetake=await prisma.verificationJob.update({where:{id:retakeJob.id},data:{state:'RUNNING',attempts:1,leaseToken:randomUUID(),leaseUntil:new Date(Date.now()+90000)}});
const pendingRetake=processVerificationJob(runningRetake,delayedRetakeProvider as any,captureIo.read,{evaluate:(image,rubric,view)=>assessCleanliness(delayedRetakeProvider as any,image,rubric,view)});await retakeEntered;
const retakeCase=await prisma.$transaction(tx=>raiseIssue(tx,retakeRace.task.id,'DAMAGED',retakeSlot.requirementId));assert.ok(retakeCase);
await managerDecision(actor,retakeCase.id,{requestId:randomUUID(),expectedVersion:retakeCase.rowVersion,requirementId:retakeSlot.requirementId,action:'REQUEST_RECAPTURE',reasonCode:'CANNOT_ASSESS',note:'Explicit recapture while old result is in flight'});
const afterRequest=await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:retakeSlot.requirementId!}});const retakeAllocated=await retakeSlots(captureActor,retakeRace.session.id,{deviceId:'device-a',requirements:[{requirementId:afterRequest.id,expectedGeneration:afterRequest.decisionVersion}]});assert.equal(retakeAllocated.length,1);
releaseRetake();await pendingRetake;const preservedGeneration=await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:retakeSlot.requirementId!}});assert.equal(preservedGeneration.currentAttemptId,null);assert.equal(preservedGeneration.state,'MISSING');assert.equal(preservedGeneration.decisionVersion,afterRequest.decisionVersion+1);
const supersededJob=await prisma.$transaction(tx=>enqueueVerificationJob(tx,{companyId:company,attemptId:retakeAttempt.id,stage:'COVERAGE',evaluatorVersion:'coverage-failure-test-v2'}));
const supersededRunning=await prisma.verificationJob.update({where:{id:supersededJob.id},data:{state:'RUNNING',attempts:4,leaseToken:randomUUID(),leaseUntil:new Date(Date.now()+90000)}});
await failVerificationJob(supersededRunning,'PROVIDER_UNAVAILABLE');
assert.equal(await prisma.verificationIssue.count({where:{exception:{taskInstanceId:retakeRace.task.id},reasonCode:'SERVICE_FAILURE'}}),0,'superseded service failure cannot block the replacement generation');
// Storage success followed by reassignment must still register the already-authorized bytes.
const uploadRace=await freshCaptureTask('Upload during handover');const uploadSlot=uploadRace.session.slots.find(s=>s.requirementId)!;const uploadBytes=await photoFor(493);const uploadMetadata={...metadata,clientCaptureId:randomUUID(),slotId:uploadSlot.id,nonce:uploadSlot.nonce,sha256:sha256(uploadBytes),claimedCapturedAt:uploadRace.session.issuedAt.toISOString(),elapsedMs:0};const uploadAttempt=await reserveAttempt(captureActor,uploadRace.session.id,uploadMetadata,true);
let changedOwner=false;const raceIo={...captureIo,store:async(bytes:Buffer,id:string,hash:string)=>{const stored=await captureIo.store(bytes,id,hash);if(!changedOwner){changedOwner=true;await prisma.taskInstance.update({where:{id:uploadRace.task.id},data:{staffId:handoverWorker.id}});}return stored;}};
const reviewReceipt=await storeReservedEvidence(captureActor,uploadAttempt.id,uploadBytes,raceIo);assert.equal(reviewReceipt.state,'REVIEW_REQUIRED');assert.ok((await prisma.verificationAttempt.findUniqueOrThrow({where:{id:uploadAttempt.id}})).mediaAssetId,'authorized bytes are retained even when ownership changes during remote storage');
// Exhausted service jobs produce one deduplicated task case and never consume cleaning retries.
const failureRace=await freshCaptureTask('Provider outage');const failureSlot=failureRace.session.slots.find(s=>s.requirementId)!;const failureAttempt=await ingestFixture(failureRace.session,failureSlot.id,559);const failedJob=await prisma.verificationJob.findFirstOrThrow({where:{attemptId:failureAttempt.id,stage:'QUALITY'}});
for(let n=1;n<=4;n++){const running=await prisma.verificationJob.update({where:{id:failedJob.id},data:{state:'RUNNING',attempts:n,leaseToken:randomUUID(),leaseUntil:new Date(Date.now()+90000)}});assert.equal(await failVerificationJob(running,'PROVIDER_UNAVAILABLE'),true);if(n<4)assert.equal(await prisma.verificationException.count({where:{taskInstanceId:failureRace.task.id}}),0);}
assert.equal((await prisma.verificationAttempt.findUniqueOrThrow({where:{id:failureAttempt.id}})).state,'SERVICE_FAILURE');assert.equal(await prisma.verificationException.count({where:{taskInstanceId:failureRace.task.id}}),1);assert.equal(await prisma.verificationAttempt.count({where:{requirementId:failureSlot.requirementId,state:'CLEANING_REQUIRED'}}),0);
console.log('PASS: stale result after retake, upload/storage racing reassignment with retained bytes, bounded provider retries and no fabricated dirt');

// Exercise real route contracts with authenticated local fixtures; no app startup crons.
process.env.ACCESS_TOKEN_SECRET='isolated-verification-test-secret';
const express=(await import('express')).default,jwt=(await import('jsonwebtoken')).default;
const verificationRouter=(await import('../src/routes/verification.route.js')).default,exceptionRouter=(await import('../src/routes/verificationException.route.js')).default;
const http=express();http.use(express.json());http.use('/api',verificationRouter);http.use('/api',exceptionRouter);
http.use((error:any,_req:any,res:any,_next:any)=>res.status(error.statusCode??500).json({success:false,message:error.message,code:error.errors?.[0]?.code??'TEST_ERROR'}));
const server=await new Promise<import('node:http').Server>(resolve=>{const s=http.listen(0,'127.0.0.1',()=>resolve(s));});const port=(server.address() as import('node:net').AddressInfo).port;
const workerJwt=jwt.sign({id:captureStaff.id,role:'STAFF'},process.env.ACCESS_TOKEN_SECRET),adminJwt=jwt.sign({id:actor.id,role:'ADMIN'},process.env.ACCESS_TOKEN_SECRET);
async function call(path:string,token:string,method='GET',body?:unknown){return fetch(`http://127.0.0.1:${port}/api${path}`,{method,headers:{Authorization:`Bearer ${token}`,"X-Hygene-Workflow":"2","X-Hygene-App-Version":"2.0.0",...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});}
try{
 const manifest=await call(`/task-instance/${finalRace.task.id}/verification`,workerJwt);assert.equal(manifest.status,200);const dto:any=await manifest.json();assert.equal(dto.data.outcome,'VERIFIED_COMPLETE');assert.equal(typeof dto.data.items[0].name,'string');assert.equal(typeof dto.data.items[0].requirements[0].instructions,'string');assert.equal(dto.data.allowedActions.createSession,false);
 const work=await call('/task-instance/staff/me/verification-work',workerJwt);assert.equal(work.status,200);assert.ok(Array.isArray((await work.json() as any).data.tasks));
 const casesResponse=await call('/verification-exceptions?state=MANAGER_REVIEW',adminJwt);assert.equal(casesResponse.status,200);const casesDto:any=await casesResponse.json();assert.ok(Array.isArray(casesDto.data.cases));
 const forbiddenInbox=await call('/verification-exceptions',workerJwt);assert.equal(forbiddenInbox.status,403);
 const detail=await call(`/verification-exceptions/${caseRow.id}`,adminJwt);assert.equal(detail.status,200);const detailDto:any=await detail.json();assert.ok(Array.isArray(detailDto.data.events));
 const read=await call(`/verification-exceptions/${caseRow.id}/read`,adminJwt,'POST',{});assert.equal(read.status,200);assert.equal((await read.json() as any).data.managerId,actor.id);
 const obsolete=await fetch(`http://127.0.0.1:${port}/api/task-instance/${retakeRace.task.id}/capture-sessions`,{method:'POST',headers:{Authorization:`Bearer ${workerJwt}`,'Content-Type':'application/json'},body:JSON.stringify(sessionBody)});assert.equal(obsolete.status,426);assert.equal((await obsolete.json() as any).code,'NATIVE_APP_UPGRADE_REQUIRED');
 const capabilities=await call('/verification-capabilities',workerJwt);assert.equal((await capabilities.json() as any).data.automaticCleanlinessPassing,false);
 const history=await call(`/task-instance/${finalRace.task.id}/verification/history`,adminJwt);assert.equal(history.status,200);const historyDto:any=await history.json();assert.ok(historyDto.data.attempts.length);assert.equal(typeof historyDto.data.attempts[0].staff.name,'string');assert.equal(historyDto.data.attempts[0].cleanlinessResult,undefined);
 const spatialExport=await call(`/task-instance/${spatialFixture.task.id}/verification/spatial-evaluation`,adminJwt);assert.equal(spatialExport.status,200);const spatialExportDto:any=await spatialExport.json();assert.equal(spatialExportDto.data.attempts.length,2);assert.equal(spatialExportDto.data.autoIdentityAcceptance,false);assert.equal(spatialExportDto.data.attempts[0].humanGroundTruth,'UNKNOWN');assert.equal(spatialExportDto.data.attempts[0].committedHash,undefined);
 assert.equal((await call(`/task-instance/${spatialFixture.task.id}/verification/spatial-evaluation`,workerJwt)).status,403,'spatial evaluation export is not staff navigation/API');
 const durableReportTask=failureRace;const report={requestId:randomUUID(),reasonCode:'DAMAGED',requestHelp:true,note:'Fixture is damaged'};
 const auditBefore=await prisma.auditLog.count({where:{entityId:durableReportTask.task.id,action:'VERIFICATION_ISSUE_REPORTED'}});
 assert.equal((await call(`/task-instance/${durableReportTask.task.id}/verification-issues`,workerJwt,'POST',report)).status,200);
 assert.equal((await call(`/task-instance/${durableReportTask.task.id}/verification-issues`,workerJwt,'POST',report)).status,200);
 assert.equal(await prisma.auditLog.count({where:{entityId:durableReportTask.task.id,action:'VERIFICATION_ISSUE_REPORTED'}}),auditBefore+1,'Response loss retries do not duplicate issue audit/events');
 assert.equal((await call(`/task-instance/${durableReportTask.task.id}/verification-issues`,workerJwt,'POST',{...report,reasonCode:'INACCESSIBLE'})).status,409);
 const invalidCapture=await call('/task-instance/not-an-id/capture-sessions',workerJwt,'POST',sessionBody);assert.equal(invalidCapture.status,400);
 const managerCapture=await call(`/task-instance/${retakeRace.task.id}/capture-sessions`,adminJwt,'POST',sessionBody);assert.equal(managerCapture.status,403);
 console.log('PASS: real HTTP verification DTO, resumable work, scoped exception API, read receipts, invalid IDs and role boundaries');
}finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}

const escalation=await freshCaptureTask('Three cleaning failures');let escalationSlot=escalation.session.slots.find(s=>s.requirementId)!;
for(let failure=1;failure<=3;failure++){
 const currentSession=await prisma.captureSession.findUniqueOrThrow({where:{id:escalation.session.id},include:{slots:true}});const sl=currentSession.slots.find(s=>s.id===escalationSlot.id)!;
 const fullSession={...escalation.session,slots:[{...sl,nonce:(await import('../src/services/verification-v2/qr.service.js')).slotNonce(currentSession.id,sl.id,sl.generation)}]};
 const a=await ingestFixture(fullSession,sl.id,650+failure);for(const stage of ['QUALITY','PRIVACY','COVERAGE','CLEANLINESS'])await executeStage(a.id,stage);
 assert.equal(await prisma.verificationException.count({where:{taskInstanceId:escalation.task.id}}),failure===3?1:0,'only third cleaning failure escalates');
 if(failure<3){const r=await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:sl.requirementId!}});const replacement=await retakeSlots(captureActor,currentSession.id,{deviceId:'device-a',requirements:[{requirementId:r.id,expectedGeneration:r.decisionVersion}]});escalationSlot={...replacement[0]!} as typeof escalationSlot;}
}
assert.equal(await prisma.verificationIssue.count({where:{exception:{taskInstanceId:escalation.task.id}}}),1);
const cannotAssess=await freshCaptureTask('Cannot assess');const cannotSlot=cannotAssess.session.slots.find(s=>s.requirementId)!;const cannotAttempt=await ingestFixture(cannotAssess.session,cannotSlot.id,762);for(const stage of ['QUALITY','PRIVACY','COVERAGE'])await executeStage(cannotAttempt.id,stage);
const cannotJob=await prisma.verificationJob.findFirstOrThrow({where:{attemptId:cannotAttempt.id,stage:'CLEANLINESS'}});const cannotRunning=await prisma.verificationJob.update({where:{id:cannotJob.id},data:{state:'RUNNING',attempts:1,leaseToken:randomUUID(),leaseUntil:new Date(Date.now()+90000)}});
const cannotProvider={assess:async(stage:string,prompt:string)=>{const assessment=await fakeProvider.assess(stage,prompt);if(stage==='cleanliness'){assessment.result={verdict:'CANNOT_ASSESS',surfaces:(assessment.result as any).surfaces.map((s:any)=>({...s,verdict:'CANNOT_ASSESS'})),reasonCode:'CANNOT_ASSESS'} as any;}return assessment;}};
await processVerificationJob(cannotRunning,cannotProvider as any,captureIo.read,{evaluate:(image,rubric,view)=>assessCleanliness(cannotProvider as any,image,rubric,view)});assert.equal((await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:cannotSlot.requirementId!}})).state,'RECAPTURE_REQUIRED');assert.equal(await prisma.verificationException.count({where:{taskInstanceId:cannotAssess.task.id}}),0);
// Exercise the actual Clef adapter through durable stage publication; HTTP is mocked.
process.env.CLOUDFLARE_ACCOUNT_ID='a'.repeat(32);process.env.CLOUDFLARE_API_TOKEN='test-only';
process.env.CLEF_CONFIDENCE_THRESHOLD='0.9';process.env.CLEF_THRESHOLD_VERSION='synthetic-candidate-v1';
const clefStaff=await prisma.staff.create({data:{name:'Clef test worker',email:`${randomUUID()}@test.invalid`,password:'test-only',companyId:company,locationId:location}});
const clefActor={id:clefStaff.id,companyId:company,role:'STAFF' as const};
const clefTemplate=await prisma.taskTemplate.create({data:{title:'Clef test',locationId:location,staffId:clefStaff.id,shiftStart:start,shiftEnd:end,effectiveDate:new Date(),verificationVersion:2,areaId:captureArea.id,inventoryConfigVersion:1,inventorySelection:'ALL',setupStatus:'READY'}});
async function clefCaptureTask(label:string){
 const t=await createTaskInstanceWithSnapshot({templateId:clefTemplate.id,title:label,locationId:location,date:new Date(Date.now()+Math.floor(Math.random()*1000000)),shiftStart:start,shiftEnd:end});assert.ok(t);
 await prisma.taskInstance.update({where:{id:t.id},data:{status:'IN_PROGRESS',startedAt:start}});await prisma.taskAssignment.updateMany({where:{taskInstanceId:t.id},data:{status:'STARTED',startedAt:start}});
 const ar=await prisma.area.findUniqueOrThrow({where:{id:captureArea.id}});return {task:t,session:await createCaptureSession(clefActor,t.id,{...sessionBody,requestId:randomUUID(),areaQr:signAreaQr(ar),location:{...sessionBody.location,sampledAt:new Date().toISOString()}})};
}
const originalFetch=globalThis.fetch;let clefCalls=0;
let clefMode='CLEAN';
globalThis.fetch=async (url,options)=>{
 assert.ok(String(url).includes('/ai/run/@cf/cloudflare/clef'),'mock must not make vendor requests');clefCalls++;
 if(clefMode==='TIMEOUT')throw new DOMException('synthetic timeout','TimeoutError');
 if(clefMode==='RATE_LIMIT')return new Response('{}',{status:429});
 const request=JSON.parse(String(options!.body));
 const choice=clefMode==='LOW_CONFIDENCE'?'CLEAN':clefMode;
 const answer={type:'choice',choice,confidence:clefMode==='LOW_CONFIDENCE'?.5:.98,probabilities:{CLEAN:choice==='CLEAN'?.98:.01,DIRTY:choice==='DIRTY'?.98:.01,CANNOT_ASSESS:choice==='CANNOT_ASSESS'?.98:.01}};
 return new Response(JSON.stringify({success:true,result:{model:'clef',answers:Object.fromEntries(Object.keys(request.questions).map(key=>[key,answer])),usage:{input_tokens:22,output_tokens:0}}}));
};
try{
 for(const mode of ['CLEAN','DIRTY','LOW_CONFIDENCE','TIMEOUT','RATE_LIMIT']){
  clefMode=mode;const fixture=await clefCaptureTask('Clef '+mode),sl=fixture.session.slots.find(s=>s.requirementId)!;
  const uniquePhoto=await sharp(randomBytes(640*640*3),{raw:{width:640,height:640,channels:3}}).jpeg().toBuffer();
  const a=await ingestFixture(fixture.session,sl.id,1000+clefCalls,clefActor,uniquePhoto);
  for(const stage of ['QUALITY','PRIVACY','COVERAGE'])await executeStage(a.id,stage);
  let j=await prisma.verificationJob.findFirstOrThrow({where:{attemptId:a.id,stage:'CLEANLINESS'}});
  const run=async()=>{j=await prisma.verificationJob.update({where:{id:j.id},data:{state:'RUNNING',attempts:{increment:1},leaseToken:randomUUID(),leaseUntil:new Date(Date.now()+90000)}});return processVerificationJob(j,fakeProvider as any,captureIo.read);};
  if(mode==='TIMEOUT'){
   await assert.rejects(run,/PROVIDER_TIMEOUT/);await failVerificationJob(j,'PROVIDER_TIMEOUT',()=>.5,{provider:'cloudflare',status:'SERVICE_FAILURE'});
   assert.equal((await prisma.verificationJob.findUniqueOrThrow({where:{id:j.id}})).state,'RETRY_WAIT');
   clefMode='CLEAN';await run();
  }else if(mode==='RATE_LIMIT'){
   for(let retry=0;retry<4;retry++){await assert.rejects(run,/PROVIDER_RATE_LIMIT/);await failVerificationJob(j,'PROVIDER_RATE_LIMIT');}
   assert.equal((await prisma.verificationJob.findUniqueOrThrow({where:{id:j.id}})).state,'FAILED');
   assert.equal((await prisma.verificationAttempt.findUniqueOrThrow({where:{id:a.id}})).state,'SERVICE_FAILURE');
   assert.equal((await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:sl.requirementId!}})).state,'REVIEW_REQUIRED');
   assert.equal(await prisma.verificationAttempt.count({where:{requirementId:sl.requirementId,state:'CLEANING_REQUIRED'}}),0);
   continue;
  }else await run();
  const persisted=await prisma.verificationAttempt.findUniqueOrThrow({where:{id:a.id}});
  const saved=persisted.cleanlinessResult as any;
  assert.equal(saved.result.verdict,mode==='LOW_CONFIDENCE'?'CANNOT_ASSESS':mode==='DIRTY'?'DIRTY':'CLEAN');
  assert.equal(saved.metadata.provider,'cloudflare');assert.equal(saved.result.confidence,mode==='LOW_CONFIDENCE'?.5:.98);
  assert.equal(saved.retryCount,mode==='TIMEOUT'?1:0);
  assert.equal(persisted.state,mode==='DIRTY'?'CLEANING_REQUIRED':mode==='LOW_CONFIDENCE'?'RECAPTURE_REQUIRED':'REVIEW_REQUIRED');
  const before=clefCalls;assert.equal(await processVerificationJob(j,fakeProvider as any,captureIo.read),false);assert.equal(clefCalls,before,'successful stage cannot be re-inferred');
  assert.notEqual((await prisma.taskInstance.findUniqueOrThrow({where:{id:fixture.task.id}})).completionOutcome,'VERIFIED_COMPLETE');
  if(mode==='LOW_CONFIDENCE'){
   for(let retry=2;retry<=3;retry++){
    const r=await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:sl.requirementId!}});
    const slots=await retakeSlots(clefActor,fixture.session.id,{deviceId:'device-a',requirements:[{requirementId:r.id,expectedGeneration:r.decisionVersion}]});
    const fullSession={...fixture.session,slots};const bytes=await sharp(randomBytes(640*640*3),{raw:{width:640,height:640,channels:3}}).jpeg().toBuffer();
    const retryAttempt=await ingestFixture(fullSession,slots[0]!.id,1100+retry,clefActor,bytes);
    for(const stage of ['QUALITY','PRIVACY','COVERAGE'])await executeStage(retryAttempt.id,stage);
    const queued=await prisma.verificationJob.findFirstOrThrow({where:{attemptId:retryAttempt.id,stage:'CLEANLINESS'}});
    const running=await prisma.verificationJob.update({where:{id:queued.id},data:{state:'RUNNING',attempts:1,leaseToken:randomUUID(),leaseUntil:new Date(Date.now()+90000)}});
    await processVerificationJob(running,fakeProvider as any,captureIo.read);
    assert.equal(await prisma.verificationException.count({where:{taskInstanceId:fixture.task.id}}),retry===3?1:0,'Clef uncertainty escalates only at existing recapture limit');
    assert.equal(await prisma.verificationAttempt.count({where:{requirementId:r.id,state:'CLEANING_REQUIRED'}}),0);
   }
  }
 }
}finally{globalThis.fetch=originalFetch;}
console.log('PASS: actual Clef adapter contract, prediction persistence, CLEAN gate, DIRTY rework, uncertainty, timeout retry, rate-limit exhaustion and no rebilling');

const maintenance=await freshCaptureTask('Maintenance is not completion');const maintenanceRequirement=await prisma.taskEvidenceRequirement.findFirstOrThrow({where:{item:{taskInstanceId:maintenance.task.id}}});const maintenanceCase=await prisma.$transaction(tx=>raiseIssue(tx,maintenance.task.id,'DAMAGED',maintenanceRequirement.id));assert.ok(maintenanceCase);
await managerDecision(actor,maintenanceCase.id,{requestId:randomUUID(),expectedVersion:maintenanceCase.rowVersion,requirementId:maintenanceRequirement.id,action:'MARK_MAINTENANCE',reasonCode:'DAMAGED',note:'Fixture requires maintenance; this does not waive cleaning evidence'});
assert.equal((await prisma.taskEvidenceRequirement.findUniqueOrThrow({where:{id:maintenanceRequirement.id}})).state,'MISSING');assert.notEqual((await prisma.taskInstance.findUniqueOrThrow({where:{id:maintenance.task.id}})).status,'COMPLETED');assert.equal((await prisma.taskTemplate.findUniqueOrThrow({where:{id:captureTemplate.id}})).setupStatus,'NEEDS_REVIEW');
console.log('PASS: third-failure escalation, CANNOT_ASSESS targeted recapture and maintenance never satisfying mandatory evidence');

const {screenStandardPrivacy}=await import('../src/services/verification-v2/standardPrivacy.service.js');
async function standardFixture(seed:number){const bytes=await photoFor(seed);const asset=await storeStandardEvidence(actor,location,bytes,captureIo);const row=await prisma.areaStandardPhoto.create({data:{areaId:captureArea.id,mediaAssetId:asset.id,createdByManagerId:actor.id}});return {row,asset};}
const safeStandard=await standardFixture(901);let enterStandard!:()=>void,releaseStandard!:()=>void;
const standardEntered=new Promise<void>(resolve=>enterStandard=resolve),standardGate=new Promise<void>(resolve=>releaseStandard=resolve);
const standardProvider={assess:async(stage:string,prompt:string)=>{enterStandard();await standardGate;return fakeProvider.assess(stage,prompt);}};
const standardCheck=screenStandardPrivacy(actor,safeStandard.row.id,standardProvider as any,captureIo.read);await standardEntered;
await assert.rejects(()=>screenStandardPrivacy(actor,safeStandard.row.id,fakeProvider as any,captureIo.read,{evaluate:(image,rubric,view)=>assessCleanliness(fakeProvider as any,image,rubric,view)}),'concurrent optional-standard calls share bounded authority');releaseStandard();
assert.equal((await standardCheck).privacyState,'SAFE');assert.ok((await evidenceContent(actor,safeStandard.asset.id,'review',captureIo)).bytes.length);
await screenStandardPrivacy(actor,safeStandard.row.id,fakeProvider as any,captureIo.read,{evaluate:(image,rubric,view)=>assessCleanliness(fakeProvider as any,image,rubric,view)});
assert.equal(await prisma.auditLog.count({where:{entityType:'AREA_STANDARD_PHOTO',entityId:safeStandard.row.id,action:'STANDARD_PRIVACY_STARTED'}}),1,'successful standard screening is reused');
const pendingStandard=await standardFixture(902);const outage={assess:async()=>{throw new Error('Provider unavailable');}};
for(let retry=0;retry<4;retry++)assert.equal((await screenStandardPrivacy(actor,pendingStandard.row.id,outage as any,captureIo.read)).privacyState,'PENDING');
await assert.rejects(()=>screenStandardPrivacy(actor,pendingStandard.row.id,outage as any,captureIo.read));await assert.rejects(()=>evidenceContent(actor,pendingStandard.asset.id,'review',captureIo));
const heldStandard=await standardFixture(903);const holdProvider={assess:async()=>({result:{status:'UNCERTAIN',reasonCode:'PRIVACY_HOLD'},metadata:{provider:'fake',model:'test',providerVersion:'v1',promptVersion:'privacy-v1',requestId:null,latencyMs:1,usage:null,costUsd:null}})};
assert.equal((await screenStandardPrivacy(actor,heldStandard.row.id,holdProvider as any,captureIo.read)).privacyState,'HOLD');
assert.equal((await screenStandardPrivacy(actor,heldStandard.row.id,fakeProvider as any,captureIo.read)).privacyState,'HOLD','ordinary retry cannot release a privacy hold');
await assert.rejects(()=>screenStandardPrivacy({...actor,companyId:foreignCompany.id},heldStandard.row.id,fakeProvider as any,captureIo.read));
console.log('PASS: optional standards screened before delivery, concurrent/bounded privacy retries, safe-result reuse, outage restriction and immutable holds');

await prisma.$disconnect();await client.end();
console.log(`Isolated database retained for inspection: ${database}`);
