import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
globalThis.__DEV__=false;
const directory=mkdtempSync(join(tmpdir(),'hygene-sync-'));
let scope='1_1';
let rows=[];let uploads=0;let resultCalls=0;let releaseUpload;
const changes=[];
globalThis.syncMocks={
 rn:{AppState:{currentState:'active',addEventListener:()=>({remove(){}})}},
 network:{fetch:async()=>({isConnected:true,isInternetReachable:true}),addEventListener:()=>()=>{}},
 queue:{queueAccount:()=>scope,queueRows:async()=>rows.map(r=>({...r,metadata:{...r.metadata}})),
  updateQueue:async(id,state,options={})=>{const row=rows.find(r=>r.id===id);Object.assign(row,{state,attemptId:options.attemptId??row.attemptId,metadata:{...row.metadata,timings:{...row.metadata.timings,...options.timings}}});changes.push({id,state,scope});},
  pendingIssues:async()=>[],removeIssue:async()=>{},cleanUploadCache(){}},
 api:{uploadCapture:async()=>{uploads++;return new Promise(resolve=>{releaseUpload=()=>resolve({id:'new-attempt',state:'RECEIVED'});});},
  attemptStatus:async id=>{resultCalls++;return {id,state:'SERVICE_FAILURE'};},reportIssue:async()=>{}},
};
const urls=Object.fromEntries(Object.entries({'react-native':'rn','@react-native-community/netinfo':'network','./queue':'queue','./api':'api'}).map(([name,key],i)=>{
 const path=join(directory,`${i}.cjs`);writeFileSync(path,`module.exports=globalThis.syncMocks.${key};`);return[name,pathToFileURL(path).href];
}));
const hook=registerHooks({resolve(name,context,next){return urls[name]&&context.parentURL?.includes('/verification/')?{url:urls[name],shortCircuit:true}:next(name,context);}});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const row=(id,state,attemptId)=>({id,taskId:7,sessionId:'session',slotId:id,state,attemptId,nextRetryAt:0,retries:0,metadata:{slotId:id,timings:{capturedAt:Date.now()}}});
test('accepted results reconcile while another upload is pending; terminal service failure stops checking and duplicate drains are prevented',async()=>{
 try{
  const {syncEvidence}=await import('../src/verification/sync.ts');
  rows=[row('accepted','PROCESSING','existing-attempt'),row('saved','SAVED')];
  const drain=syncEvidence();await tick();await tick();
  assert.equal(uploads,1);assert.equal(rows[0].state,'FINAL','An exhausted provider failure stops checking before unrelated upload completes');
  assert.ok(rows[0].metadata.timings.resultReceivedAt);assert.equal(rows[1].state,'UPLOADING');
  const again=syncEvidence();assert.equal(again,drain);await tick();
  assert.equal(uploads,1,'Concurrent sync calls never upload the same capture twice');
  assert.ok(resultCalls>=1);releaseUpload();await drain;await tick();
  assert.ok(rows[1].metadata.timings.uploadStartedAt);assert.ok(rows[1].metadata.timings.uploadAcceptedAt);
  assert.equal(rows[1].state,'FINAL');
  rows=[row('account-upload','SAVED')];
  const switched=syncEvidence();await tick();assert.equal(uploads,2);
  scope='2_2';releaseUpload();await switched;await tick();
  assert.equal(changes.some(change=>change.id==='account-upload'&&change.state==='SERVER_ACCEPTED'&&change.scope==='2_2'),false,'Old account acknowledgment cannot modify the new account queue');
 }finally{hook.deregister();rmSync(directory,{recursive:true,force:true});delete globalThis.syncMocks;}
});
