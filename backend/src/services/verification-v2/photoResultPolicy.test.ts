import {expect,it} from 'vitest';
import {bufferedDecision} from './photoResultPolicy.js';
import type {BufferedAssessment} from './bufferedPhoto.provider.js';

const base:BufferedAssessment={originality:'DIRECT',objectMatch:'MATCH',cleanliness:{verdict:'CLEAN',surfaces:[{surface:'bowl',verdict:'CLEAN'}],confidence:.99,reasonCode:'CLEAN'},metadata:{} as any};

it.each(['WRONG_ITEM','MISSING_SURFACE','UNCERTAIN'] as const)('a %s object/view cannot be passed or sent to review even with clean surfaces',objectMatch=>{
 expect(bufferedDecision({...base,objectMatch,originality:'UNCERTAIN'},false)).toEqual({state:'RECAPTURE_REQUIRED',reason:objectMatch==='UNCERTAIN'?'CANNOT_ASSESS':objectMatch,keep:false});
});
it('a missing object result cannot bypass the gate for required fixture photos',()=>{
 expect(bufferedDecision({...base,objectMatch:null,cleanliness:null},false,true)).toMatchObject({state:'RECAPTURE_REQUIRED',keep:false});
});
it('an unrelated object cannot be classified as a cleaning failure',()=>{
 expect(bufferedDecision({...base,objectMatch:'WRONG_ITEM',cleanliness:{...base.cleanliness!,verdict:'DIRTY',surfaces:[{surface:'bowl',verdict:'DIRTY'}],reasonCode:'CLEANING_REQUIRED'}},true)).toMatchObject({state:'RECAPTURE_REQUIRED',reason:'WRONG_ITEM'});
});
it('matched objects retain the existing cleanliness and review policies',()=>{
 expect(bufferedDecision(base,true).state).toBe('PASSED');
 expect(bufferedDecision(base,false).state).toBe('REVIEW_REQUIRED');
});
it('room context photos do not acquire a fixture-object requirement',()=>{
 expect(bufferedDecision({...base,objectMatch:null,cleanliness:null},true,false).state).toBe('PASSED');
});
