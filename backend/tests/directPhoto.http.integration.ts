import "dotenv/config";
import assert from "node:assert/strict";
import { readFile, readdir, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import pg from "pg";
const source = process.env.VERIFICATION_TEST_DATABASE_URL;
if (!source) throw new Error("Isolated local test URL required");
const url = new URL(source);
if (
  url.hostname !== "127.0.0.1" ||
  !url.pathname.startsWith("/priv_verification_test")
)
  throw new Error("Only isolated local test database is permitted");
const database = `priv_verification_test_photo_http_${Date.now()}`;
const admin = new pg.Client({ connectionString: source });
await admin.connect();
await admin.query(`CREATE DATABASE "${database}"`);
await admin.end();
url.pathname = "/" + database;
process.env.DATABASE_URL = url.toString();
process.env.NODE_ENV = "test";
const client = new pg.Client({ connectionString: url.toString() });
await client.connect();
const root = new URL("../prisma/migrations/", import.meta.url);
for (const name of (await readdir(root)).filter((n) => /^\d/.test(n)).sort())
  await client.query(
    await readFile(new URL(`${name}/migration.sql`, root), "utf8"),
  );
await client.end();
process.env.ACCESS_TOKEN_SECRET='isolated-direct-photo-test-token';
process.env.VERIFICATION_QR_SECRET='isolated-direct-photo-qr-secret-32-characters';
process.env.VERIFICATION_SLOT_SECRET='isolated-direct-photo-slot-secret-32-characters';
const {prisma}=await import('../src/prisma/prisma.js');
const {default:express}=await import('express');
const {default:jwt}=await import('jsonwebtoken');
const {default:taskRouter}=await import('../src/routes/taskInstance.route.js');
const {default:verificationRouter}=await import('../src/routes/verification.route.js');
const {default:caseRouter}=await import('../src/routes/verificationException.route.js');
const {signAreaQr}=await import('../src/services/verification-v2/qr.service.js');
const {createTaskInstanceWithSnapshot}=await import('../src/services/verification-v2/inventorySnapshot.service.js');
const {BufferedClefProvider}=await import('../src/services/verification-v2/bufferedPhoto.provider.js');
const {default:cloudinary}=await import('../src/utils/cloudinary.js');
const {default:sharp}=await import('sharp');
const {createHash}=await import('node:crypto');
const {Writable}=await import('node:stream');
let scenario='clean',aiCalls=0,cloudCalls=0,storageFail=false;
BufferedClefProvider.prototype.evaluate=async()=>{
 aiCalls++;if(scenario==='failure')throw new Error('Controlled AI failure');
 await new Promise(r=>setTimeout(r,30));
 const verdict=scenario==='dirty'?'DIRTY':'CLEAN';
 return {objectMatch:scenario==='wrong-object'?'WRONG_ITEM':scenario==='missing-view'?'MISSING_SURFACE':scenario==='object-uncertain'?'UNCERTAIN':'MATCH',originality:scenario==='screen'?'SCREEN_RECAPTURE':'DIRECT',cleanliness:{verdict,surfaces:[{surface:'basin',verdict}],confidence:.99,reasonCode:verdict==='DIRTY'?'CLEANING_REQUIRED':'CLEAN'},metadata:{} as any};
};
const assets=new Map<string,any>();
cloudinary.api.resource=(async(id:string)=>{
 if(storageFail){storageFail=false;throw {http_code:503};}
 const value=assets.get(id);if(!value)throw {http_code:404};return value;
}) as any;
cloudinary.uploader.upload_stream=((options:any,callback:any)=>new Writable({write(_chunk,_encoding,done){done();},final(done){cloudCalls++;const value={asset_id:randomUUID(),context:{custom:options.context}};assets.set(options.public_id,value);callback(null,value);done();}})) as any;
const app=express();app.use(express.json());app.use((req,_res,next)=>{req.cookies={};next();});
app.use('/api/task-instance',taskRouter);app.use('/api',verificationRouter);app.use('/api',caseRouter);
app.use((e:any,_req:any,res:any,_next:any)=>res.status(e.statusCode??500).json({message:e.message,errors:e.errors}));
const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
const base=`http://127.0.0.1:${(server.address() as {port:number}).port}/api`;
const now=new Date(),end=new Date(+now+3600000);
const company=await prisma.company.create({data:{name:'Direct photo HTTP test',subscriptionStatus:'ACTIVE'}});
const location=await prisma.location.create({data:{companyId:company.id,name:'Synthetic photo test location',address:'Isolated test database',latitude:'24.8607',longitude:'67.0011',timezone:'Asia/Karachi'}});
const area=await prisma.area.create({data:{locationId:location.id,name:'Synthetic sink test',roomType:'WASHROOM',status:'ACTIVE'}});
await prisma.areaItem.create({data:{areaId:area.id,stableCode:'SINK-TEST',displayName:'Test sink',fixtureType:'SINK',sequence:1,rubricKey:'visible-v1',requiredViews:[{key:'basin_tap',instructions:'Show the basin, drain and tap.',mandatory:true}]}});
let staff=await prisma.staff.create({data:{companyId:company.id,locationId:location.id,name:'Photo test staff',email:randomUUID()+'@test.invalid',password:'isolated-test-password'}});
const other=await prisma.staff.create({data:{companyId:company.id,locationId:location.id,name:'Other test staff',email:randomUUID()+'@test.invalid',password:'isolated-test-password'}});
const manager=await prisma.manager.create({data:{companyId:company.id,name:'Photo test administrator',email:randomUUID()+'@test.invalid',password:'isolated-test-password',role:'ADMIN'}});
await prisma.attendance.create({data:{staffId:staff.id,locationId:location.id,date:now,expectedStart:now,expectedEnd:end,checkInTime:now,status:'CHECKED_IN'}});
const token=(id:number,role:string)=>jwt.sign({id,role},process.env.ACCESS_TOKEN_SECRET!,{expiresIn:'30m'});
let staffToken=token(staff.id,'STAFF');const managerToken=token(manager.id,'ADMIN');
const headers=(auth=staffToken)=>({Authorization:`Bearer ${auth}`,'X-Hygene-Workflow':'2','X-Hygene-App-Version':'2.0.0'});
async function request(path:string,body?:unknown,expected=200,auth=staffToken){
 const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{...headers(auth),...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const result=await r.json() as any;assert.equal(r.status,expected,`${path}: ${JSON.stringify(result)}`);return result.data;
}
async function newTask(label:string){
 const template=await prisma.taskTemplate.create({data:{locationId:location.id,areaId:area.id,staffId:staff.id,title:label,verificationVersion:2,inventorySelection:'ALL',setupStatus:'READY',shiftStart:new Date(+now-120000),shiftEnd:end,effectiveDate:now}});
 const task=await createTaskInstanceWithSnapshot({templateId:template.id,title:label,locationId:location.id,date:new Date(),shiftStart:new Date(+now-120000),shiftEnd:end});assert.ok(task);
 await request(`/task-instance/${task.id}/start`,{areaQr:signAreaQr(area)});
 await request(`/task-instance/${task.id}/complete`,{},409);
 const s=await request(`/task-instance/${task.id}/capture-sessions`,{requestId:randomUUID(),areaQr:signAreaQr(area),deviceId:'http-test-device',clientBootId:'http-test-boot',clientTime:new Date().toISOString(),location:{latitude:24.8607,longitude:67.0011,accuracy:3,sampledAt:new Date().toISOString()}},201);
 return {task,s};
}
async function photo(s:any){
 const activated=await request(`/capture-session/${s.id}/activate-photo`,{slotId:s.slots[0].id,deviceId:'http-test-device'}),slot=activated.slots[0];
 const pixels=Buffer.alloc(1000*1000*3);for(let i=0;i<pixels.length;i++)pixels[i]=120+(i*37)%100;
 const image=await sharp(pixels,{raw:{width:1000,height:1000,channels:3}}).jpeg({quality:90}).toBuffer();
 const captured=Date.now(),metadata={clientCaptureId:randomUUID(),slotId:slot.id,nonce:slot.nonce,sha256:createHash('sha256').update(image).digest('hex'),claimedCapturedAt:new Date(captured).toISOString(),elapsedMs:captured-Date.parse(s.serverTimeAnchor),bootId:'http-test-boot',deviceId:'http-test-device'};
 const form=(override:Record<string,string>={})=>{const f=new FormData();f.set('photo',new Blob([new Uint8Array(image)],{type:'image/jpeg'}),'test.jpg');for(const[k,v]of Object.entries({...metadata,...override}))f.set(k,String(v));return f;};
 const upload=async(expected=200,override:Record<string,string>={},auth=staffToken)=>{
  const r=await fetch(base+`/capture-session/${s.id}/attempts`,{method:'POST',headers:headers(auth),body:form(override)}),result=await r.json() as any;
  assert.equal(r.status,expected,JSON.stringify(result));return result.data;
 };
 return {upload,metadata};
}
try{
 for(const kind of ['clean','dirty','screen','wrong-object','missing-view','object-uncertain','failure','storage-failure','interrupted','renew'] as const){
  // Independent actors keep rapid fixtures within the per-worker session limit.
  if(kind!=='clean'){
   staff=await prisma.staff.create({data:{companyId:company.id,locationId:location.id,name:'Photo test staff',email:randomUUID()+'@test.invalid',password:'isolated-test-password'}});
   staffToken=token(staff.id,'STAFF');
   await prisma.attendance.create({data:{staffId:staff.id,locationId:location.id,date:now,expectedStart:now,expectedEnd:end,checkInTime:now,status:'CHECKED_IN'}});
  }
  scenario=kind;const{task,s}=await newTask(kind),p=await photo(s),beforeAi=aiCalls,beforeCloud=cloudCalls;
  await p.upload(409,{sha256:'0'.repeat(64)});
  await p.upload(404,{},token(other.id,'STAFF'));
  if(kind==='failure'||kind==='renew'){
   scenario='failure';await p.upload(503);await request(`/task-instance/${task.id}/complete`,{},409);
   if(kind==='renew'){
    const renewed=await request(`/capture-session/${s.id}/renew`,{requestId:randomUUID(),areaQr:signAreaQr(area),deviceId:'http-test-device',clientBootId:'http-test-boot',clientTime:new Date().toISOString(),location:{latitude:24.8607,longitude:67.0011,accuracy:3,sampledAt:new Date().toISOString()}},201);
    assert.ok(renewed.slots.some((slot:any)=>slot.requirementId&&slot.id!==s.slots[0].id));continue;
   }
   scenario='clean';await p.upload();assert.equal(aiCalls,beforeAi+2);
  }else if(kind==='storage-failure'){
   storageFail=true;await p.upload(503);assert.equal(aiCalls,beforeAi+1);
   await request(`/task-instance/${task.id}/complete`,{},409);await p.upload();assert.equal(aiCalls,beforeAi+1,'manual storage retry reuses completed AI');
  }else{
   if(kind==='interrupted'){
    // A failed request leaves no bytes on the server; its stale ownership is safe to reclaim.
    scenario='failure';await p.upload(503);
    const a=await prisma.verificationAttempt.findUniqueOrThrow({where:{sessionId_clientCaptureId:{sessionId:s.id,clientCaptureId:p.metadata.clientCaptureId}}});
    await prisma.verificationAttempt.update({where:{id:a.id},data:{state:'CLEANLINESS_CHECK',directProcessingToken:randomUUID(),directProcessingStartedAt:new Date(Date.now()-200000)}});
    scenario='clean';
   }
   const result=await p.upload();assert.equal(result.storage,['dirty','screen','wrong-object','missing-view','object-uncertain'].includes(kind)?'discarded':'cloud');
   if(['dirty','screen','wrong-object','missing-view','object-uncertain'].includes(kind)){
    assert.equal(result.state,kind==='dirty'?'CLEANING_REQUIRED':'RECAPTURE_REQUIRED');
    if(kind==='wrong-object')assert.equal(result.reasonCode,'WRONG_ITEM');
    if(kind==='missing-view')assert.equal(result.reasonCode,'MISSING_SURFACE');
    if(kind==='object-uncertain')assert.equal(result.reasonCode,'CANNOT_ASSESS');
    assert.equal(cloudCalls,beforeCloud);
    await request(`/task-instance/${task.id}/complete`,{},409);
    const manifest=await request(`/task-instance/${task.id}/verification`),r=manifest.items[0].requirements[0];
    const path=kind==='dirty'?`/task-instance/${task.id}/capture-sessions/rework`:`/capture-session/${s.id}/renew`;
    const retrySession=await request(path,{requestId:randomUUID(),areaQr:signAreaQr(area),deviceId:'http-test-device',clientBootId:'http-test-boot',clientTime:new Date().toISOString(),location:{latitude:24.8607,longitude:67.0011,accuracy:3,sampledAt:new Date().toISOString()},...(kind==='dirty'?{requirements:[{requirementId:r.id,expectedGeneration:r.decisionVersion}]}:{})},201);
    scenario='clean';await(await photo(retrySession)).upload();await request(`/task-instance/${task.id}/complete`,{});
   }
   if(kind==='clean'){
    await p.upload();assert.equal(aiCalls,beforeAi+1,'duplicate upload returns existing result');
    const recovered=await request(`/capture-session/${s.id}/attempts/by-capture/${p.metadata.clientCaptureId}`);assert.equal(recovered.attemptId,result.attemptId);
    await request(`/task-instance/${task.id}/verification-issues`,{reasonCode:'OCCUPIED'},410);
   }
  }
  assert.equal(await prisma.verificationJob.count({where:{attempt:{session:{taskInstanceId:task.id}}}}),0,'direct uploads cannot create queue jobs');
  if(!['dirty','screen','wrong-object','missing-view','object-uncertain'].includes(kind))await request(`/task-instance/${task.id}/complete`,{});
 }
 assert.equal(await prisma.verificationWorkerHeartbeat.count(),0);
 console.log('PASS direct HTTP: object/view mismatch rejection and QR retakes, synchronous AI/storage, no queue/worker, invalid hash and staff denial, mandatory submission, manual AI/storage retry, cached replay, lost-response lookup, interrupted request and QR renewal.');
}finally{
 await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await prisma.$disconnect();
 const cleanup=new pg.Client({connectionString:source});await cleanup.connect();await cleanup.query(`DROP DATABASE "${database}" WITH (FORCE)`);await cleanup.end();
}
