import assert from 'node:assert/strict';
import test from 'node:test';
import {registerHooks} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {create,act} from 'react-test-renderer';
globalThis.React=React;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const directory=mkdtempSync(join(tmpdir(),'direct-photo-ui-'));
const intervals=new Set(),networkListeners=new Set(),appListeners=new Set();
const originalInterval=setInterval,originalClear=clearInterval;
globalThis.setInterval=callback=>{intervals.add(callback);return callback;};
globalThis.clearInterval=callback=>intervals.delete(callback);
let manifest,session,uploads,submissions,failUpload,found,deleted,resumes,activations;
function reset(){
 const now=Date.now();resumes=0;activations=[];uploads=0;submissions=0;failUpload=true;found=null;deleted=[];
 manifest={task:{id:7,title:'Sink task',status:'IN_PROGRESS',areaNameSnapshot:'Washroom'},staffSubmittedAt:null,sequentialChecks:true,pendingJobs:0,sessions:[],items:[{id:'item',nameSnapshot:'Sink 1',typeSnapshot:'SINK',mandatory:true,requirements:[{id:'required',mandatory:true,state:'MISSING',instructionsSnapshot:'Show basin, drain and tap.',decisionVersion:0}]}]};
 session={id:'session',taskInstanceId:7,state:'ACTIVE',serverTime:new Date(now).toISOString(),clientBootId:'boot',captureExpiresAt:new Date(now+600000).toISOString(),uploadExpiresAt:new Date(now+900000).toISOString(),sequentialChecks:true,requiredContextKeys:[],slots:[{id:'slot',requirementId:'required',nonce:'nonce',sequence:0,activatedAt:new Date(now).toISOString(),expiresAt:new Date(now+90000).toISOString()}]};
}
reset();
globalThis.directUiMocks={
 rn:{View:'View',Text:'Text',Image:'Image',ScrollView:'ScrollView',StyleSheet:{absoluteFill:{}},Platform:{OS:'android'},Linking:{openSettings:async()=>{}},useWindowDimensions:()=>({width:360,height:800}),AppState:{currentState:'active',addEventListener:(_name,cb)=>{appListeners.add(cb);return{remove:()=>appListeners.delete(cb)};}}},
 camera:{CameraView:'CameraView',useCameraPermissions:()=>[{granted:true},async()=>({granted:true})]},
 fs:{File:class{constructor(uri){this.uri=uri;}exists=true;async bytes(){return new Uint8Array([1,2,3]);}delete(){deleted.push(this.uri);}}},
 quality:{captureClock:()=>({bootId:'boot',elapsedMs:1000}),inspectStill:async()=>({width:1800,height:1200,luminance:100,laplacianVariance:30,clipping:0})},
 api:{verificationManifest:async()=>structuredClone(manifest),openCaptureSession:async()=>structuredClone(session),activatePhoto:async(_sessionId,slotId)=>{activations.push(slotId);const slot=session.slots.find(s=>s.id===slotId);slot.activatedAt??=new Date().toISOString();return structuredClone(session);},resumeCapture:async()=>{resumes++;return structuredClone(session);},installationId:async()=> 'device',findUploadedPhoto:async()=>found,
 uploadPhoto:async()=>{uploads++;if(failUpload)throw new Error('Network error');manifest.items[0].requirements[0].state='REVIEW_REQUIRED';manifest.items[0].requirements[0].currentAttempt={id:'attempt',state:'REVIEW_REQUIRED'};session.slots[0].attemptId='attempt';return{attemptId:'attempt',state:'REVIEW_REQUIRED',storage:'cloud'};},
 finishSubmission:async()=>{submissions++;manifest.staffSubmittedAt=new Date().toISOString();return{};}},
};
const mocks={
 'react-native':'globalThis.directUiMocks.rn','expo-camera':'globalThis.directUiMocks.camera','expo-file-system':'globalThis.directUiMocks.fs',
 'expo-crypto':'{randomUUID:()=>"capture",CryptoDigestAlgorithm:{SHA256:"sha256"},digest:async()=>new Uint8Array(32)}',
 'expo-image-manipulator':'{manipulateAsync:async()=>({uri:"temporary.jpg"}),SaveFormat:{JPEG:"jpeg"}}',
 '@react-native-community/netinfo':'{addEventListener:cb=>{globalThis.directNetworkListeners.add(cb);return()=>globalThis.directNetworkListeners.delete(cb);}}',
 '@react-navigation/native':'{useIsFocused:()=>true}','react-native-safe-area-context':'{useSafeAreaInsets:()=>({bottom:24})}',
 '@tanstack/react-query':'{useQueryClient:()=>({invalidateQueries:async()=>{}})}',
 '/auth/AuthContext':'{useAuth:()=>({user:{id:1,companyId:1}})}','/i18n/LanguageProvider':'{useLanguage:()=>({t:text=>text,isRTL:false})}',
 '/verification/captureAccount':'{captureAccount:()=>"1_1"}','/verification/api':'globalThis.directUiMocks.api',
 '/modules/capture-quality':'globalThis.directUiMocks.quality','/components/ui/button':'{Button:"Button"}','/components/ui/text':'{Text:"Text"}',
 '/components/LanguageChoice':'{LanguageChoice:()=>null}','/components/PhotoGuide':'{PhotoGuide:()=>null}',
 '/components/PhotoCaptureControls':'{CaptureFrame:"CaptureFrame",PhotoStepProgress:()=>null,PhotoCaptureControls:props=>globalThis.React.createElement("Button",{disabled:props.disabled||props.busy,onPress:props.onCapture},props.label)}',
 './VerificationProgress':'{VerificationProgress:()=>null}','/queries/staff':'{staffQueryKeys:{all:["staff"]}}',
};
globalThis.directNetworkListeners=networkListeners;
const urls=Object.fromEntries(Object.entries(mocks).map(([name,value],i)=>{const file=join(directory,i+'.cjs');writeFileSync(file,`module.exports=${value};`);return[name,pathToFileURL(file).href];}));
const hook=registerHooks({resolve(specifier,context,next){
 if(specifier==='expo-sqlite')throw new Error('Photo flow must not open a persistent database');
 const key=Object.keys(urls).find(name=>specifier===name||name.startsWith('/')&&specifier.endsWith(name));
 return key?{url:urls[key],shortCircuit:true}:next(specifier,context);
}});
const flush=async fn=>act(async()=>{await fn?.();await Promise.resolve();});
const button=(r,name)=>r.root.findAllByType('Button').find(b=>b.props.children===name);
const click=(r,name)=>flush(()=>{const b=button(r,name);assert.ok(b,name);assert.equal(!!b.props.disabled,false,name+' enabled');return b.props.onPress();});
let Screen;
async function mount(){Screen??=(await import('../src/screens/verification/VerificationScreen.tsx')).VerificationScreen;let r;await flush(()=>{r=create(React.createElement(Screen,{route:{params:{taskId:7}},navigation:{goBack(){}}}),{createNodeMock:n=>n.type==='CameraView'?{takePictureAsync:async()=>({uri:'camera.jpg'})}:null});});return r;}
async function photograph(r){await click(r,'Scan QR to take photos');await flush(()=>r.root.findByType('CameraView').props.onBarcodeScanned({data:'room-qr'}));await flush(()=>r.root.findByType('CameraView').props.onCameraReady());await click(r,'Take photo');}
test('failed upload needs manual reupload, has no automatic retry or staff exception buttons',async()=>{
 reset();let r;
 try{
  r=await mount();await photograph(r);assert.equal(uploads,1);assert.ok(button(r,'Upload again'));assert.equal(button(r,'Submit work'),undefined);
  assert.equal(/Room occupied|Ask manager|Having trouble|Retry saved|saved on this phone/i.test(JSON.stringify(r.toJSON())),false);
  await flush(()=>{for(const cb of intervals)cb();for(const cb of networkListeners)cb({isConnected:true});for(const cb of appListeners)cb('active');});
  assert.equal(uploads,1,'reconnection, foreground and timers cannot retry uploads');
  failUpload=false;await click(r,'Upload again');assert.equal(uploads,2);assert.ok(deleted.includes('temporary.jpg'));assert.ok(button(r,'Submit work'));assert.equal(resumes,0,'upload does not resume an already active session');
  await click(r,'Submit work');assert.equal(submissions,1);
 }finally{if(r)await flush(()=>r.unmount());}
});
test('lost response reconciles the existing result without another upload',async()=>{
 reset();let r;
 try{
  r=await mount();await photograph(r);found={attemptId:'attempt',state:'REVIEW_REQUIRED',storage:'cloud'};manifest.items[0].requirements[0].state='REVIEW_REQUIRED';manifest.items[0].requirements[0].currentAttempt={id:'attempt',state:'REVIEW_REQUIRED'};
  await click(r,'Upload again');assert.equal(uploads,1);assert.ok(button(r,'Submit work'));assert.equal(button(r,'Upload again'),undefined);
 }finally{if(r)await flush(()=>r.unmount());}
});
test('leaving the screen discards the temporary picture and remount cannot restore it',async()=>{
 reset();let r;
 try{
  r=await mount();await photograph(r);await flush(()=>r.unmount());r=undefined;assert.ok(deleted.includes('temporary.jpg'));
  r=await mount();assert.equal(button(r,'Upload again'),undefined);assert.ok(button(r,'Scan QR to take photos'));assert.equal(uploads,1);
 }finally{if(r)await flush(()=>r.unmount());}
});
test('a checked first photo advances to the next slot without a resume request',async()=>{
 reset();failUpload=false;let r;
 manifest.items[0].requirements.push({id:'second-required',mandatory:true,state:'MISSING',instructionsSnapshot:'Show the next view.',decisionVersion:0});
 session.slots.push({id:'second-slot',requirementId:'second-required',nonce:'nonce-2',sequence:1,expiresAt:session.captureExpiresAt});
 try{
  r=await mount();await photograph(r);
  assert.equal(uploads,1);assert.equal(resumes,0);assert.equal(button(r,'Submit work'),undefined);
  await click(r,'Continue photos');
  assert.ok(r.root.findByType('CameraView'));assert.ok(activations.includes('second-slot'));
 }finally{if(r)await flush(()=>r.unmount());}
});
for(const [state,label] of [['CLEANING_REQUIRED','Clean items, then scan QR'],['RECAPTURE_REQUIRED','Scan task QR to retake photos']])test(`${state} retains its QR correction action without resuming`,async()=>{
 reset();failUpload=false;let r;const original=globalThis.directUiMocks.api.uploadPhoto;
 globalThis.directUiMocks.api.uploadPhoto=async(...args)=>{const result=await original(...args);const requirement=manifest.items[0].requirements[0];requirement.state=state;requirement.currentAttempt.state=state;return{...result,state};};
 try{
  r=await mount();await photograph(r);
  assert.ok(button(r,label));assert.equal(button(r,'Continue photos'),undefined);assert.equal(button(r,'Submit work'),undefined);assert.equal(resumes,0);
 }finally{globalThis.directUiMocks.api.uploadPhoto=original;if(r)await flush(()=>r.unmount());}
});
test.after(()=>{hook.deregister();globalThis.setInterval=originalInterval;globalThis.clearInterval=originalClear;rmSync(directory,{recursive:true,force:true});});
