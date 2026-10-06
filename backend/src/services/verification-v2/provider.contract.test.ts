import {afterEach,describe,it,expect,vi} from 'vitest';
import {ConfiguredImageProvider,providerMetadataSchema} from './provider.service.js';
import {assessPrivacy,assessCoverage,privacyResultSchema} from './coverage.service.js';
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe('provider stage contracts',()=>{
 it('rejects injected safe privacy with hold reason',async()=>{await expect(assessPrivacy({assess:async()=>({result:{status:'SAFE',reasonCode:'PRIVACY_HOLD'},metadata:{}})} as any,Buffer.from('a'))).rejects.toThrow();});
 it('rejects matched wrong observed fixture',async()=>{const p={assess:async()=>({result:{verdict:'MATCH',observedFixture:'BIN',observedView:'basin_tap',observedLabel:null,identityConsistent:true,privacyFlag:false,reasonCode:'CLEAN'},metadata:{}})};await expect(assessCoverage(p as any,Buffer.from('a'),{fixture:'SINK',view:'basin_tap'})).rejects.toThrow();});
 it.each(['refusal','malformed','outage'])('rejects %s without fallback',async kind=>{vi.stubEnv('AI_PROVIDER','gemini');vi.stubEnv('GEMINI_API_KEY','test');vi.stubGlobal('fetch',vi.fn(async()=>kind==='outage'?{ok:false}:{ok:true,json:async()=>({candidates:[{finishReason:kind==='refusal'?'SAFETY':'STOP',content:{parts:[{text:'{}'}]}}]})}));await expect(new ConfiguredImageProvider().assess('privacy','privacy',[Buffer.from('a')],privacyResultSchema)).rejects.toThrow();expect(fetch).toHaveBeenCalledTimes(1);});
 it('metadata rejects arbitrary refusal content',()=>expect(()=>providerMetadataSchema.parse({refusal:'untrusted'})).toThrow());
 it('sends strict schema and records bounded token usage',async()=>{vi.stubEnv('AI_PROVIDER','gemini');vi.stubEnv('GEMINI_API_KEY','test');const fetcher=vi.fn(async(_url:unknown,_options:any)=>({ok:true,json:async()=>({responseId:'id',modelVersion:'gemini-concrete-revision',usageMetadata:{promptTokenCount:3,candidatesTokenCount:4,totalTokenCount:7,extra:'untrusted'},candidates:[{finishReason:'STOP',content:{parts:[{text:'{"status":"SAFE","reasonCode":"CLEAN"}'}]}}]})}));vi.stubGlobal('fetch',fetcher);const result=await new ConfiguredImageProvider().assess('privacy','privacy',[Buffer.from('a')],privacyResultSchema);expect(result.metadata.model).toBe('gemini-concrete-revision');expect(result.metadata.requestedModel).toBe(process.env.GEMINI_VISION_MODEL??'gemini-3.6-flash');expect(result.metadata.costUsd).toBeNull();expect(result.metadata.usage).toEqual({inputTokens:3,outputTokens:4,totalTokens:7});expect(JSON.parse(fetcher.mock.calls[0]![1]!.body).generationConfig.responseJsonSchema.additionalProperties).toBe(false);});
});

describe('room-context coverage',()=>{
 const match={verdict:'MATCH',observedFixture:'ROOM_CONTEXT',observedView:'ENTRANCE',observedLabel:null,identityConsistent:true,privacyFlag:false,reasonCode:'CLEAN'};
 function provider(result:unknown){return {assess:vi.fn(async(_stage:string,_prompt:string,..._args:unknown[])=>({result,metadata:{}}))};}
 it.each(['ENTRANCE','LAYOUT'] as const)('accepts explicitly matched %s room context and specifies its semantics',async key=>{const p=provider({...match,observedView:key});expect((await assessCoverage(p as any,Buffer.from('a'),{contextKey:key})).result.verdict).toBe('MATCH');expect(p.assess.mock.calls[0]?.[1]).toContain('observedFixture ROOM_CONTEXT');});
 it('rejects arbitrary fixture MATCH for entrance',async()=>{await expect(assessCoverage(provider({...match,observedFixture:'TOILET'}) as any,Buffer.from('a'),{contextKey:'ENTRANCE'})).rejects.toThrow('PROVIDER_MALFORMED');});
 it('rejects entrance evidence credited as layout',async()=>{await expect(assessCoverage(provider(match) as any,Buffer.from('a'),{contextKey:'LAYOUT'})).rejects.toThrow('PROVIDER_MALFORMED');});
 it('rejects unknown context key',async()=>{await expect(assessCoverage(provider(match) as any,Buffer.from('a'),{contextKey:'OTHER'})).rejects.toThrow();});
 it('retains context uncertainty without granting a match',async()=>{expect((await assessCoverage(provider({...match,verdict:'UNCERTAIN',identityConsistent:false,reasonCode:'CONTEXT_UNCERTAIN'}) as any,Buffer.from('a'),{contextKey:'LAYOUT'})).result.verdict).toBe('UNCERTAIN');});
});

describe('immutable printed-label identity',()=>{
 const expected={fixture:'TOILET',view:'bowl_seat',itemCodeSnapshot:'TOILET-07',nameSnapshot:'Toilet 07',sourceAreaItemId:7,order:7,identity:{mode:'PRINTED_LABEL'}};
 const match={verdict:'MATCH',observedFixture:'TOILET',observedView:'bowl_seat',observedLabel:'Toilet 07',identityConsistent:true,privacyFlag:false,reasonCode:'CLEAN'};
 const provider=(result:unknown)=>({assess:vi.fn(async(_stage:string,_prompt:string,..._args:unknown[])=>({result,metadata:{}}))});
 it.each(['Toilet 07','TOILET-07'])('accepts the snapshotted label %s',async observedLabel=>{const p=provider({...match,observedLabel});expect((await assessCoverage(p as any,Buffer.from('a'),expected)).result.verdict).toBe('MATCH');expect(p.assess.mock.calls[0]?.[1]).toContain('"sourceAreaItemId":7');});
 it.each(['Toilet 08',null])('rejects absent or mismatched label %s as malformed coverage, never cleanliness',async observedLabel=>{await expect(assessCoverage(provider({...match,observedLabel}) as any,Buffer.from('a'),expected)).rejects.toThrow('PROVIDER_MALFORMED');});
 it('retains a label mismatch reported as identity uncertainty',async()=>{const result=await assessCoverage(provider({...match,observedLabel:'Toilet 08',identityConsistent:false,verdict:'UNCERTAIN',reasonCode:'IDENTITY_UNCERTAIN'}) as any,Buffer.from('a'),expected);expect(result.result.verdict).toBe('UNCERTAIN');expect(result.result).not.toHaveProperty('cleanliness');});
});

it('records OpenAI returned model separately from requested alias',async()=>{
 vi.stubEnv('AI_PROVIDER','openai');vi.stubEnv('OPENAI_API_KEY','test-only');vi.stubEnv('OPENAI_VISION_MODEL','requested-alias');
 const fetcher=vi.fn(async()=>new Response(JSON.stringify({id:'test-response',model:'resolved-model-revision',choices:[{index:0,finish_reason:'stop',message:{role:'assistant',content:'{"status":"SAFE","reasonCode":"CLEAN"}'}}],usage:{prompt_tokens:1,completion_tokens:2,total_tokens:3}}),{status:200,headers:{'content-type':'application/json'}}));
 vi.stubGlobal('fetch',fetcher);
 const result=await new ConfiguredImageProvider().assess('privacy','privacy',[Buffer.from('a')],privacyResultSchema);
 expect(result.metadata.model).toBe('resolved-model-revision');expect(result.metadata.requestedModel).toBe('requested-alias');expect(result.metadata.providerVersion).toBe('adapter-v1');expect(result.metadata.costUsd).toBeNull();expect(fetcher).toHaveBeenCalledTimes(1);
});

it('retains a coverage privacy flag even when fixture identity would otherwise match',async()=>{
 const p={assess:async()=>({result:{verdict:'MATCH',observedFixture:'TOILET',observedView:'bowl_seat',observedLabel:null,identityConsistent:true,privacyFlag:true,reasonCode:'PRIVACY_HOLD'},metadata:{}})};
 expect((await assessCoverage(p as any,Buffer.from('a'),{fixture:'TOILET',view:'bowl_seat',identity:{mode:'EXISTING_NUMBER',existingNumber:'7'}})).result.privacyFlag).toBe(true);
});
it.each(['',null,undefined])('never accepts missing existing-number configuration %s',async existingNumber=>{
 const p={assess:async()=>({result:{verdict:'MATCH',observedFixture:'TOILET',observedView:'bowl_seat',observedLabel:existingNumber??null,identityConsistent:true,privacyFlag:false,reasonCode:'CLEAN'},metadata:{}})};
 await expect(assessCoverage(p as any,Buffer.from('a'),{fixture:'TOILET',view:'bowl_seat',identity:{mode:'EXISTING_NUMBER',existingNumber}})).rejects.toThrow();
});
