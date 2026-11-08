import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const m=vi.hoisted(()=>({get:vi.fn(),post:vi.fn()}));
vi.mock('@/api/client',()=>({client:m}));
import { getBillingLifecycle,getBillingCatalog,prepareBillingCheckout,prepareBillingPortal,getSubscription } from './api';
const transactionId='txn_'+'a'.repeat(26);
const lifecycle={company:{id:42,name:'Fixture',plan:'PRO',isActive:true,operationalStatus:'ACTIVE'},usage:{locations:1,staff:2,managers:1},limits:{locations:5,staff:25,managers:3},subscription:null,reconciliationRequired:false,billingConfigured:true,ownerVerified:false,providerState:'NOT_LINKED',portalAvailable:false,checkoutAvailable:true};
beforeEach(()=>vi.resetAllMocks());
afterEach(()=>vi.restoreAllMocks());
it('validates lifecycle and normalizes legacy facts without inventing permission',async()=>{
 m.get.mockResolvedValue({data:{data:lifecycle}});
 expect(await getBillingLifecycle(undefined,42)).toMatchObject({workspaceAccessAllowed:false,checkoutReadiness:'UNKNOWN',checkoutResume:null});
});
it.each([null,{}, {...lifecycle,checkoutAvailable:'true'},{...lifecycle,company:{...lifecycle.company,id:99}}])('rejects malformed or foreign lifecycle: %#',async(data)=>{
 m.get.mockResolvedValue({data:{data}});
 await expect(getBillingLifecycle(undefined,42)).rejects.toThrow('Billing response is unavailable');
});
it('validates actual catalog facts and exact checkout response',async()=>{
 m.get.mockResolvedValue({data:{data:[{plan:'PRO',interval:'year',priceId:'pri_'+'a'.repeat(26),productId:'pro_'+'b'.repeat(26),amount:'9999999999999999999',currencyCode:'USD',trialPeriod:null}]}});
 expect((await getBillingCatalog())[0].amount).toBe('9999999999999999999');
 m.post.mockResolvedValue({data:{data:{transactionId,reused:false}}});
 expect(await prepareBillingCheckout('PRO','year')).toEqual({transactionId,reused:false});
 expect(m.post).toHaveBeenCalledWith('/subscription/manage/checkout',{plan:'PRO',interval:'year'},{signal:undefined});
});
it('rejects unsafe catalog and checkout without any automatic repeat',async()=>{
 m.get.mockResolvedValue({data:{data:[{amount:123}]}});await expect(getBillingCatalog()).rejects.toThrow();
 m.post.mockResolvedValue({data:{data:{transactionId:'invalid',reused:'true'}}});
 await expect(prepareBillingCheckout('PRO','month')).rejects.toThrow();expect(m.post).toHaveBeenCalledOnce();
});
it('does not retry a lost checkout response',async()=>{
 m.post.mockRejectedValue(new Error('response lost'));
 await expect(prepareBillingCheckout('PRO','month')).rejects.toThrow('response lost');expect(m.post).toHaveBeenCalledOnce();
});
it.each(['https://customer-portal.paddle.com/fixture?token=synthetic','https://sandbox-customer-portal.paddle.com/fixture'])('permits approved transient portal URL %#',async(url)=>{
 m.post.mockResolvedValue({data:{data:{url}}});expect(await prepareBillingPortal()).toEqual({url});
});
it.each(['http://customer-portal.paddle.com/','https://evil.invalid/','https://customer-portal.paddle.com.evil.invalid/','https://user:pass@customer-portal.paddle.com/','https://customer-portal.paddle.com:443/','https://customer-portal.paddle.com:444/','javascript:alert(1)',' https://customer-portal.paddle.com/',null])('rejects untrusted/userinfo/port portal case %#',async(url)=>{
 m.post.mockResolvedValue({data:{data:{url}}});await expect(prepareBillingPortal()).rejects.toThrow('Billing portal unavailable');expect(m.post).toHaveBeenCalledOnce();
});
it('consumes cancellation and discards a late successful read',async()=>{
 const controller=new AbortController();m.get.mockImplementation(async()=>{controller.abort();return {data:{data:lifecycle}};});
 await expect(getBillingLifecycle(controller.signal,42)).rejects.toThrow();
 expect(m.get).toHaveBeenCalledWith('/subscription/manage/lifecycle',{signal:controller.signal});
});
it('rejects a foreign legacy subscription summary',async()=>{
 m.get.mockResolvedValue({data:{data:{company:{id:99}}}});await expect(getSubscription(undefined,42)).rejects.toThrow('Billing response is unavailable');
});
