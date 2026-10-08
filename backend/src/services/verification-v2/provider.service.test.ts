import {afterEach,it,expect,vi} from 'vitest';
import {z} from 'zod';
import {ConfiguredImageProvider,ProviderServiceFailure,providerHttpFailure} from './provider.service.js';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it.each([[401,'PROVIDER_AUTH_FAILURE'],[403,'PROVIDER_AUTH_FAILURE'],[400,'PROVIDER_CONFIGURATION_INVALID'],[404,'PROVIDER_CONFIGURATION_INVALID'],[429,'PROVIDER_RATE_LIMITED'],[504,'PROVIDER_TIMEOUT'],[503,'PROVIDER_UNAVAILABLE']])('classifies HTTP %s as %s', (status,code)=>expect(providerHttpFailure(Number(status))).toBe(code));
it('records sanitized diagnostics for permanent Gemini configuration failure',async()=>{
 vi.stubEnv('AI_PROVIDER','gemini');vi.stubEnv('GEMINI_API_KEY','private-test-key');vi.stubGlobal('fetch',vi.fn(async()=>new Response('sensitive provider response',{status:404})));
 try{await new ConfiguredImageProvider().assess('privacy','prompt',[Buffer.from('test')],z.object({safe:z.boolean()}));throw new Error('expected failure');}
 catch(e){expect(e).toBeInstanceOf(ProviderServiceFailure);expect((e as ProviderServiceFailure).code).toBe('PROVIDER_CONFIGURATION_INVALID');expect((e as ProviderServiceFailure).metadata).toEqual(expect.objectContaining({provider:'gemini',httpStatus:404,stage:'privacy',latencyMs:expect.any(Number)}));expect(JSON.stringify(e)).not.toContain('private-test-key');expect(JSON.stringify(e)).not.toContain('sensitive provider response');}
});
it('keeps timeout distinct from cleanliness outcomes',async()=>{
 vi.stubEnv('AI_PROVIDER','gemini');vi.stubEnv('GEMINI_API_KEY','test');vi.stubGlobal('fetch',vi.fn(async()=>{throw new DOMException('timeout','TimeoutError');}));
 await expect(new ConfiguredImageProvider().assess('coverage','prompt',[],z.object({}))).rejects.toMatchObject({code:'PROVIDER_TIMEOUT'});
});
