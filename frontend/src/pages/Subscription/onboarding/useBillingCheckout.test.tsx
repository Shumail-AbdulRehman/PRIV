import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import type { BillingLifecycle, BillingCheckoutResume } from '../types';
const m=vi.hoisted(()=>({
 user:{id:7,companyId:42,role:'ADMIN'} as {id:number;companyId:number;role:string}|null,
 get:vi.fn(),post:vi.fn(),sdk:vi.fn(),open:vi.fn(),close:vi.fn(),support:vi.fn(),policies:true,
 listeners:new Set<(event:{name:string;data?:{transaction_id:string}})=>void>(),
}));
vi.mock('@/hooks/useAuth',()=>({default:()=>({user:m.user})}));
vi.mock('@/api/client',()=>({client:{get:m.get,post:m.post}}));
vi.mock('@/lib/paddle',async(importOriginal)=>({
 ...await importOriginal<typeof import('@/lib/paddle')>(),getPaddle:m.sdk,
 subscribePaddleEvents:(listener:(event:{name:string;data?:{transaction_id:string}})=>void)=>{m.listeners.add(listener);return()=>m.listeners.delete(listener);},
}));
vi.mock('@/pages/Help/serviceInformation',()=>({serviceInformation:()=>({policiesReady:m.policies}),getPublicSupport:m.support}));
import {useBillingCheckout} from './useBillingCheckout';
import {billingLifecycleKey} from '../queries';
const transactionId='txn_'+'a'.repeat(26);
const selection={plan:'PRO' as const,interval:'month' as const};
const prepared={...selection,transactionId};
let facts:BillingLifecycle;
const actor={id:7,companyId:42,role:'ADMIN'};
const clients:QueryClient[]=[];
function mount(){
 const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});clients.push(client);
 const wrapper=({children}:{children:ReactNode})=><QueryClientProvider client={client}>{children}</QueryClientProvider>;
 return {client,...renderHook(useBillingCheckout,{wrapper})};
}
async function emit(name:string,id:string=transactionId){await act(async()=>{for(const listener of m.listeners)listener({name,data:{transaction_id:id}});});}
beforeEach(()=>{
 vi.clearAllMocks();m.listeners.clear();m.user={...actor};m.policies=true;
 vi.stubEnv('VITE_PADDLE_ENVIRONMENT','sandbox');vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN','test_public_fixture');
 facts={company:{id:42,name:'Fixture',plan:'PRO',isActive:true,operationalStatus:'ACTIVE'},usage:{locations:1,staff:2,managers:1},limits:{locations:5,staff:25,managers:3},subscription:null,
 reconciliationRequired:false,billingConfigured:true,ownerVerified:false,billingEnvironment:'sandbox',providerState:'NOT_LINKED',portalAvailable:false,checkoutAvailable:true,checkoutReadiness:'READY',workspaceAccessAllowed:false,checkoutResume:null};
 m.get.mockImplementation(async(url)=>({data:{data:url==='/common/get-current-user'?{...actor}:structuredClone(facts)}}));
 m.post.mockImplementation(async()=>{facts.checkoutResume={...prepared};return {data:{data:{transactionId,reused:false}}};});
 m.sdk.mockResolvedValue({Checkout:{open:m.open,close:m.close}});m.support.mockResolvedValue({email:'configured@example.invalid'});
});
afterEach(()=>{clients.forEach(client=>client.clear());clients.length=0;vi.unstubAllEnvs();});
it('verifies fresh owner/config/SDK before one exact plan/interval POST and opens its returned transaction',async()=>{
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});
 expect(m.sdk).toHaveBeenCalledBefore(m.post);expect(m.post).toHaveBeenCalledWith('/subscription/manage/checkout',selection,{signal:expect.any(AbortSignal),_retry:true});
 expect(m.open).toHaveBeenCalledWith({transactionId,settings:{displayMode:'overlay',theme:'light',successUrl:'http://localhost:3000/welcome'}});
 expect(h.result.current.status).toBe('open');expect(h.result.current.prepared).toEqual(prepared);expect(m.support).not.toHaveBeenCalled();h.unmount();
});
it.each(['missing-env','mismatch','wrong-token','sdk'])('pre-request %s failure causes zero POST and safe retry state',async(failure)=>{
 if(failure==='missing-env')vi.stubEnv('VITE_PADDLE_ENVIRONMENT','');if(failure==='mismatch')facts.billingEnvironment='production';
 if(failure==='wrong-token')vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN','live_fixture');if(failure==='sdk')m.sdk.mockRejectedValueOnce(new Error('private error'));
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).not.toHaveBeenCalled();expect(m.open).not.toHaveBeenCalled();expect(h.result.current.status).toBe('pre-submit-error');expect(h.result.current.message).not.toContain('private');h.unmount();
});
it('a deliberate retry after known SDK failure can safely prepare once',async()=>{
 m.sdk.mockRejectedValueOnce(new Error('load failed'));const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).toHaveBeenCalledOnce();expect(m.open).toHaveBeenCalledOnce();h.unmount();
});
it('double submit while awaiting SDK shares the controller lock',async()=>{
 let resolve!:(value:unknown)=>void;m.sdk.mockReturnValue(new Promise(r=>{resolve=r;}));const h=mount();
 let first!:Promise<void>;await act(async()=>{first=h.result.current.openCheckout(selection);await Promise.resolve();await Promise.resolve();});
 await act(async()=>{await h.result.current.openCheckout(selection);resolve({Checkout:{open:m.open,close:m.close}});await first;});expect(m.post).toHaveBeenCalledOnce();expect(m.open).toHaveBeenCalledOnce();h.unmount();
});
it('close/reopen uses the same server-proven transaction without another POST',async()=>{
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});await emit('checkout.closed');expect(h.result.current.status).toBe('reopenable');
 await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).toHaveBeenCalledOnce();expect(m.open).toHaveBeenCalledTimes(2);h.unmount();
});
it('open failure retains prepared selection, checks current server facts and reopens the same ID',async()=>{
 m.open.mockImplementationOnce(()=>{throw new Error('private provider open failure');});const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});
 expect(h.result.current).toMatchObject({status:'reopenable',prepared});await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).toHaveBeenCalledOnce();expect(m.open).toHaveBeenCalledTimes(2);h.unmount();
});
it('reload resumes the exact saved yearly selection with no new purchase',async()=>{
 facts.checkoutResume={plan:'STARTER',interval:'year',transactionId};const h=mount();await act(async()=>{await h.result.current.openCheckout();});
 expect(h.result.current.prepared).toEqual(facts.checkoutResume);expect(m.post).not.toHaveBeenCalled();expect(m.open).toHaveBeenCalledOnce();h.unmount();
});
it('a changed selection cannot replace or open a draft under another plan',async()=>{
 facts.checkoutResume={...prepared};const h=mount();await act(async()=>{await h.result.current.openCheckout({plan:'STARTER',interval:'year'});});
 expect(m.post).not.toHaveBeenCalled();expect(m.open).not.toHaveBeenCalled();expect(h.result.current.prepared).toEqual(prepared);h.unmount();
});
it.each(['response-loss','conflict'])('submitted %s never retries another POST even if an incomplete read advertises ready',async(failure)=>{
 m.post.mockRejectedValue(failure==='conflict'?{response:{status:409}}:new Error('lost response'));
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(h.result.current.status).toBe('uncertain');
 await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).toHaveBeenCalledOnce();expect(m.open).not.toHaveBeenCalled();h.unmount();
});
it('a previously lost response can resume only the server-proven prepared transaction',async()=>{
 m.post.mockRejectedValueOnce(new Error('response lost'));const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});facts.checkoutResume={...prepared};
 await act(async()=>{await h.result.current.checkStatus();});expect(h.result.current.status).toBe('reopenable');await act(async()=>{await h.result.current.openCheckout();});expect(m.post).toHaveBeenCalledOnce();expect(m.open).toHaveBeenCalledOnce();h.unmount();
});
it.each(['linked','restricted','reconciliation','disabled','foreign'])( 'fresh %s state cancels checkout',async(change)=>{
 if(change==='linked'){facts.providerState='MIRRORED';facts.checkoutReadiness='LINKED_SUBSCRIPTION';}
 if(change==='restricted')facts.company.operationalStatus='SUSPENDED';if(change==='reconciliation')facts.reconciliationRequired=true;
 if(change==='disabled')facts.checkoutAvailable=false;if(change==='foreign')facts.company.id=99;
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).not.toHaveBeenCalled();expect(m.open).not.toHaveBeenCalled();h.unmount();
});
it('late restriction during SDK loading cancels mutation after the second fresh check',async()=>{
 m.sdk.mockImplementation(async()=>{facts.company.operationalStatus='SUSPENDED';return {Checkout:{open:m.open,close:m.close}};});
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).not.toHaveBeenCalled();h.unmount();
});
it('remote actor change while SDK loads cannot submit under stale Redux identity',async()=>{
 let changed=false;m.sdk.mockImplementation(async()=>{changed=true;return {Checkout:{open:m.open,close:m.close}};});
 m.get.mockImplementation(async(url)=>({data:{data:url==='/common/get-current-user'?{...actor,id:changed?99:7}:facts}}));
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).not.toHaveBeenCalled();expect(m.open).not.toHaveBeenCalled();h.unmount();
});
it('wrong/missing transaction signals do nothing; completion refreshes but never grants access',async()=>{
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});const invalidate=vi.spyOn(h.client,'invalidateQueries');
 await emit('checkout.completed','txn_'+'z'.repeat(26));await act(async()=>{for(const listener of m.listeners)listener({name:'checkout.completed'});});expect(invalidate).not.toHaveBeenCalled();
 await emit('checkout.completed');expect(h.result.current.status).toBe('pending');expect(invalidate).toHaveBeenCalledWith({queryKey:billingLifecycleKey(42,7)});expect(invalidate).toHaveBeenCalledWith({queryKey:['currentUser']});
 expect(h.client.getQueryData<BillingLifecycle>(billingLifecycleKey(42,7))?.workspaceAccessAllowed).toBe(false);
 await emit('checkout.closed');await act(async()=>{await h.result.current.openCheckout();});expect(m.post).toHaveBeenCalledOnce();expect(m.open).toHaveBeenCalledOnce();h.unmount();
});
it.each(['checkout.payment.error','checkout.payment.failed'])('provider %s is status-first, never a replacement purchase',async(eventName)=>{
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});await emit(eventName);expect(h.result.current.status).toBe('uncertain');
 facts.checkoutResume=null;await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).toHaveBeenCalledOnce();expect(m.open).toHaveBeenCalledOnce();h.unmount();
});
it.each(['switch','unmount'])('late response after %s cannot open/refresh another principal',async(mode)=>{
 let resolve!:(value:unknown)=>void;let signal:AbortSignal|undefined;m.post.mockImplementation(async(_url,_data,config)=>{signal=config.signal;return new Promise(r=>{resolve=r;});});const h=mount();
 let promise!:Promise<void>;await act(async()=>{promise=h.result.current.openCheckout(selection);for(let i=0;i<20;i++)await Promise.resolve();});expect(m.post).toHaveBeenCalledOnce();
 if(mode==='switch'){m.user={id:9,companyId:55,role:'ADMIN'};h.rerender();}else h.unmount();
 expect(signal?.aborted).toBe(true);await act(async()=>{resolve({data:{data:{transactionId,reused:false}}});await promise;});expect(m.open).not.toHaveBeenCalled();
 const invalidate=vi.spyOn(h.client,'invalidateQueries');await emit('checkout.completed');expect(invalidate).not.toHaveBeenCalled();if(mode==='switch')h.unmount();expect(m.listeners.size).toBe(0);
});
it('unmount unsubscribes and closes only the overlay opened by this controller',async()=>{
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.listeners.size).toBe(1);h.unmount();expect(m.listeners.size).toBe(0);expect(m.close).toHaveBeenCalledOnce();
});
it.each(['verification','policies','contact'] as const)('live %s prerequisite cannot use the sandbox bypass',async(failure)=>{
 facts.billingEnvironment='production';facts.ownerVerified=failure!=='verification';m.policies=failure!=='policies';if(failure==='contact')m.support.mockResolvedValue({email:null});
 vi.stubEnv('VITE_PADDLE_ENVIRONMENT','production');vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN','live_fixture');const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.post).not.toHaveBeenCalled();expect(m.open).not.toHaveBeenCalled();h.unmount();
});
it('verified configured live flow retains existing commercial guard',async()=>{
 facts.billingEnvironment='production';facts.ownerVerified=true;vi.stubEnv('VITE_PADDLE_ENVIRONMENT','production');vi.stubEnv('VITE_PADDLE_CLIENT_TOKEN','live_fixture');
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(m.support).toHaveBeenCalledOnce();expect(m.post).toHaveBeenCalledOnce();h.unmount();
});
it('checkStatus never initializes checkout or mutates a new transaction',async()=>{
 const h=mount();await act(async()=>{await h.result.current.checkStatus();});expect(m.sdk).not.toHaveBeenCalled();expect(m.post).not.toHaveBeenCalled();expect(h.result.current.status).toBe('idle');h.unmount();
});
it('a retained draft must still match fresh server resume before reopening',async()=>{
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});facts.checkoutResume={...prepared,transactionId:'txn_'+'c'.repeat(26)} as BillingCheckoutResume;
 await act(async()=>{await h.result.current.openCheckout(selection);});expect(h.result.current.status).toBe('uncertain');expect(m.post).toHaveBeenCalledOnce();expect(m.open).toHaveBeenCalledOnce();h.unmount();
});
it('a synchronous closed event during SDK open is not overwritten with open state',async()=>{
 m.open.mockImplementationOnce(()=>{for(const listener of m.listeners)listener({name:'checkout.closed',data:{transaction_id:transactionId}});});
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(h.result.current.status).toBe('reopenable');h.unmount();
});
it('unobserved private lifecycle reads written by the controller are removed on cleanup',async()=>{
 const h=mount();await act(async()=>{await h.result.current.checkStatus();});expect(h.client.getQueryData(billingLifecycleKey(42,7))).toBeDefined();h.unmount();expect(h.client.getQueryData(billingLifecycleKey(42,7))).toBeUndefined();
});
it('server-known ready workspace is never treated as permission to start another checkout',async()=>{
 facts.workspaceAccessAllowed=true;const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(h.result.current.status).toBe('pending');expect(m.post).not.toHaveBeenCalled();expect(m.sdk).not.toHaveBeenCalled();h.unmount();
});
it('malformed successful checkout response remains uncertain and cannot be retried as another purchase',async()=>{
 m.post.mockResolvedValue({data:{data:{transactionId:'invalid',reused:false}}});const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});await act(async()=>{await h.result.current.openCheckout(selection);});expect(h.result.current.status).toBe('uncertain');expect(m.post).toHaveBeenCalledOnce();expect(m.open).not.toHaveBeenCalled();h.unmount();
});
it('same-owner signout/sign-in cannot revive the prior mounted session display or transaction',async()=>{
 const h=mount();await act(async()=>{await h.result.current.openCheckout(selection);});expect(h.result.current.prepared).toEqual(prepared);
 m.user=null;h.rerender();expect(h.result.current).toMatchObject({status:'idle',prepared:null});
 m.user={...actor};h.rerender();expect(h.result.current).toMatchObject({status:'idle',prepared:null});
 await act(async()=>{await h.result.current.openCheckout();});expect(m.post).toHaveBeenCalledOnce();expect(m.open).toHaveBeenCalledTimes(2);h.unmount();
});
