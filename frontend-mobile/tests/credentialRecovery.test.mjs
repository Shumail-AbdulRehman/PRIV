import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';
globalThis.React=React;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
let auth, bridge, captures=[],writes=[],stored=null,role='STAFF',getError=null,posts=0;
globalThis.authRecovery={
 get:async()=>{if(getError)throw getError;return {data:{data:{id:2,companyId:3,role:'STAFF',name:'Worker'}}};},
 post:async()=>{posts++;return{data:{data:{id:2,companyId:3,role,accessToken:'synthetic-access',refreshToken:'synthetic-refresh'}}};},
 configure:next=>{bridge=next;},setCapture:value=>captures.push(value),
 storage:{read:async()=>stored,write:async value=>{writes.push(value);stored=value;}},
};
const directory=mkdtempSync(join(tmpdir(),'native-credential-gate-'));
const mocks={
 'react-native':'{Platform:{OS:"android"}}','expo-secure-store':'{getItemAsync:async()=>null,setItemAsync:async()=>{},deleteItemAsync:async()=>{}}',
 '@react-native-async-storage/async-storage':'{}',
 '@tanstack/react-query':'{useQueryClient:()=>({clear(){},invalidateQueries:async()=>{}})}',
 '../api/client':'{client:{get:globalThis.authRecovery.get,post:globalThis.authRecovery.post},configureApiAuth:globalThis.authRecovery.configure}',
 '../api/serverAddress':'{loadServerAddress:async()=>{},getServerAddress:()=>"https://example.test/api"}',
 '../config':'{STORAGE_KEY:"synthetic-session"}',
 '../verification/captureAccount':'{setCaptureAccount:globalThis.authRecovery.setCapture}',
 '../notifications/native':'{clearPhoneAlerts:async()=>{}}',
 './pendingLogout':'{staffLogoutQueue:{flush:async()=>{},enqueue:async()=>{}}}',
 './sessionStorage':'{createSessionStorage:()=>globalThis.authRecovery.storage}',
};
const urls=Object.fromEntries(Object.entries(mocks).map(([key,value],index)=>{const path=join(directory,index+'.cjs');writeFileSync(path,`module.exports=${value};`);return[key,pathToFileURL(path).href];}));
const hook=registerHooks({resolve(specifier,context,next){return urls[specifier]?{url:urls[specifier],shortCircuit:true}:next(specifier,context);}});
const {AuthProvider,useAuth}=await import('../src/auth/AuthContext.tsx');
function Probe(){auth=useAuth();return null;}
async function mount(){let renderer;await act(async()=>{renderer=create(React.createElement(AuthProvider,null,React.createElement(Probe)));});return renderer;}
function reset(){stored=null;role='STAFF';getError=null;captures=[];writes=[];posts=0;}
test('real native auth keeps forced-password session for own replacement and clears it on logout',async()=>{
 reset();getError={response:{status:403,data:{errors:[{code:'PASSWORD_CHANGE_REQUIRED'}]}}};const renderer=await mount();
 try{await act(async()=>auth.login('worker@example.test','synthetic'));assert.equal(auth.user.role,'STAFF');assert.equal(auth.passwordChangeRequired,true);assert.equal(posts,1);assert.equal(bridge.getScope(),'3_2');await act(async()=>auth.logout());assert.equal(auth.user,null);assert.equal(auth.passwordChangeRequired,false);assert.equal(stored,null);}
 finally{await act(async()=>renderer.unmount());}
});
test('saved forced-password session survives bootstrap without operational admission',async()=>{
 reset();stored=JSON.stringify({user:{id:2,companyId:3,role:'STAFF'},accessToken:'synthetic-access',refreshToken:'synthetic-refresh'});getError={response:{status:403,data:{errors:[{code:'PASSWORD_CHANGE_REQUIRED'}]}}};const renderer=await mount();
 try{assert.equal(auth.passwordChangeRequired,true);assert.equal(auth.user.id,2);assert.equal(auth.isBootstrapping,false);}
 finally{await act(async()=>renderer.unmount());}
});
test('previous server replacement requirement stays restrictive when bootstrap is offline',async()=>{
 reset();stored=JSON.stringify({user:{id:2,companyId:3,role:'STAFF'},passwordChangeRequired:true,accessToken:'synthetic-access',refreshToken:'synthetic-refresh'});getError=new Error('offline');const renderer=await mount();
 try{assert.equal(auth.passwordChangeRequired,true);assert.equal(auth.user.id,2);assert.equal(auth.isBootstrapping,false);}
 finally{await act(async()=>renderer.unmount());}
});
test('native login refuses non-staff identity without persisting it',async()=>{
 reset();role='MANAGER';const renderer=await mount();
 try{await act(async()=>{await assert.rejects(auth.login('manager@example.test','synthetic'),/staff account/);});assert.equal(auth.user,null);assert.equal(stored,null);}
 finally{await act(async()=>renderer.unmount());}
});
test('suspended company denial retains own security without claiming password replacement',async()=>{
 reset();getError={response:{status:403,data:{errors:[{code:'ACCOUNT_SUSPENDED'}]}}};const renderer=await mount();
 try{await act(async()=>auth.login('worker@example.test','synthetic'));assert.equal(auth.user.id,2);assert.equal(auth.passwordChangeRequired,false);assert.equal(bridge.getScope(),'3_2');}
 finally{await act(async()=>renderer.unmount());}
});
test.after(()=>{hook.deregister();rmSync(directory,{recursive:true,force:true});});
