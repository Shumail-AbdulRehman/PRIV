import '../src/launch/LaunchRecovery.test.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';
import { translate } from '../src/i18n/translations.ts';
globalThis.React = React; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let language='en',calls=[],failure=null,release=null;
globalThis.launchForm = { language:()=>({isRTL:language==='ur',t:(key)=>translate(key,language)}),
  replaceOwnPassword:async(...args)=>{calls.push(['own',...args]);if(release)await new Promise(resolve=>{release=resolve;});if(failure)throw failure;},
  completeStaffHandoff:async(...args)=>{calls.push(['handoff',...args]);if(failure)throw failure;},
};
const directory=mkdtempSync(join(tmpdir(),'native-recovery-form-'));
const mocks={
 'react-native':'{View:"View"}',
 '/components/ui/button':'{Button:"Button"}','/components/ui/input':'{Input:"Input"}','/components/ui/text':'{Text:"Text"}',
 '/i18n/LanguageProvider':'{useLanguage:globalThis.launchForm.language}',
 './launchApi':'globalThis.launchForm',
};
const urls=Object.fromEntries(Object.entries(mocks).map(([key,value],index)=>{const path=join(directory,index+'.cjs');writeFileSync(path,`module.exports=${value}`);return[key,pathToFileURL(path).href];}));
const hook=registerHooks({resolve(specifier,context,next){const key=Object.keys(urls).find(key=>specifier===key||key.startsWith('/')&&specifier.endsWith(key));return key?{url:urls[key],shortCircuit:true}:next(specifier,context);}});
const {LaunchRecovery}=await import('../src/launch/LaunchRecovery.tsx');
async function mount(props={}){let result;await act(async()=>{result=create(React.createElement(LaunchRecovery,props));});return result;}
async function fill(renderer,first='old-password'){await act(async()=>{const fields=renderer.root.findAllByType('Input');fields[0].props.onChangeText(first);fields[1].props.onChangeText('new-password');fields[2].props.onChangeText('new-password');});}
const save=renderer=>renderer.root.findAllByType('Button')[0];
test('replacement form blocks duplicate requests and clears secrets only after success',async()=>{
 language='en';calls=[];failure=null;release=true;let completed=0;const renderer=await mount({onComplete:()=>{completed++;}});
 try{await fill(renderer);await act(async()=>{save(renderer).props.onPress();save(renderer).props.onPress();});assert.equal(calls.length,1);assert.equal(save(renderer).props.loading,true);await act(async()=>{release();});assert.equal(completed,1);assert.ok(renderer.root.findAllByType('Input').every(field=>field.props.value===''));}
 finally{release=null;await act(async()=>renderer.unmount());}
});
test('denied replacement keeps draft and displays actionable error',async()=>{
 language='en';calls=[];failure={response:{status:403}};const renderer=await mount({onComplete:()=>assert.fail('No success for denied change')});
 try{await fill(renderer);await act(async()=>save(renderer).props.onPress());assert.equal(calls.length,1);assert.equal(renderer.root.findAllByType('Input')[0].props.value,'old-password');assert.ok(JSON.stringify(renderer.toJSON()).includes('Current password is incorrect'));}
 finally{failure=null;await act(async()=>renderer.unmount());}
});
test('handoff uses one-use code, never staff email and never signs in automatically',async()=>{
 language='ur';calls=[];let complete=0;const renderer=await mount({handoff:true,onComplete:()=>{complete++;}});
 try{await fill(renderer,'a'.repeat(43));await act(async()=>save(renderer).props.onPress());assert.deepEqual(calls,[['handoff','a'.repeat(43),'new-password']]);assert.equal(complete,1);assert.ok(JSON.stringify(renderer.toJSON()).includes('منیجر'));for(const field of renderer.root.findAllByType('Input')){assert.equal(field.props.secureTextEntry,true);assert.equal(field.props.style.writingDirection,'ltr');assert.equal(field.props.style.textAlign,'right');assert.equal(field.props.allowFontScaling,undefined,'System text scaling remains enabled');}}
 finally{language='en';await act(async()=>renderer.unmount());}
});
test('malformed handoff and mismatched passwords never call the API',async()=>{
 calls=[];const renderer=await mount({handoff:true,onComplete(){}});
 try{await fill(renderer,'bad');await act(async()=>save(renderer).props.onPress());assert.equal(calls.length,0);assert.ok(JSON.stringify(renderer.toJSON()).includes('one-use code'));}
 finally{await act(async()=>renderer.unmount());}
});
test.after(()=>{hook.deregister();rmSync(directory,{recursive:true,force:true});});
