import multer from 'multer';
import {z} from 'zod';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import type { AddressInfo } from 'node:net';
const m=vi.hoisted(()=>({role:'ADMIN',active:true,suspended:false,epoch:0,forced:false,api:vi.fn(async()=>({reachable:true})),change:vi.fn(async()=>({passwordChanged:true})),account:vi.fn(async()=>({})),principal:vi.fn()}));
vi.mock('../prisma/prisma.js',()=>({prisma:{manager:{findUnique:m.principal},staff:{findUnique:m.principal},managerLocation:{findMany:async()=>[]}}}));
vi.mock('../middlewares/operatorAuth.middleware.js',()=>({verifyOperator:(req:any,_res:any,next:any)=>{
 if(req.header('authorization')!=='Bearer qualified-operator')return next(Object.assign(new Error('Operator required'),{statusCode:401}));
 req.operator={issuer:'https://idp.example.invalid',subject:'provisioned-person'};next();
}}));
vi.mock('../services/accountAccess.service.js',()=>({assertAccountAction:m.account}));
vi.mock('../services/ownerIdentity.service.js',()=>({ownerIdentity:{status:m.api,requestRecovery:m.api,requestVerification:m.api,complete:m.api}}));
vi.mock('../services/companySettings.service.js',()=>({getCompanySettings:m.api,updateCompanySettings:m.api}));
vi.mock('../services/attendanceAnnotation.service.js',()=>({appendAttendanceAnnotation:m.api,listAttendanceAnnotations:m.api}));
vi.mock('../services/platformCompany.service.js',()=>({getPlatformCompany:m.api,listPlatformCompanies:m.api,setPlatformCompanyStatus:m.api}));
vi.mock('../services/platformSupport.service.js',()=>({getPlatformDiagnostics:m.api,getPlatformInquiry:m.api,getSupportContact:()=>({available:false,email:null}),listPlatformAudit:m.api,listPlatformInquiries:m.api,updatePlatformInquiry:m.api}));
vi.mock('../services/billingLifecycle.service.js',()=>({createBillingCheckout:m.api,createBillingPortal:m.api,getBillingCatalog:m.api,getBillingLifecycle:m.api}));
vi.mock('../controllers/subscription.controller.js',()=>({getPricingContext:(_req:any,res:any)=>res.json({public:true}),getSubscription:(_req:any,res:any)=>res.json({subscription:true}),createCustomerPortalSession:(_req:any,res:any)=>res.json({portal:true})}));
vi.mock('../controllers/enterpriseInquiry.controller.js',()=>({createEnterpriseInquiry:(_req:any,res:any)=>res.status(201).json({accepted:true})}));
vi.mock('../services/credentialHandoff.service.js',()=>({changeOwnPassword:m.change,issueStaffHandoff:m.api,completeStaffHandoff:m.api}));
vi.mock('../controllers/common.controller.js',()=>({getCurrentUser:(req:any,res:any)=>res.json({user:req.user}),refreshToken:(_req:any,res:any)=>res.json({refresh:true}),logOut:(_req:any,res:any)=>res.json({logout:true})}));
import router,{launchErrorHandler} from './launch.route.js';
import {ApiError} from '../utils/ApiError.js';
let server:ReturnType<express.Express['listen']>,origin:string;
const token=()=>jwt.sign({id:1,role:m.role,credentialVersion:0,tokenUse:'access'},'route-test-secret',{expiresIn:'5m'});
async function request(path:string,kind:'anonymous'|'tenant'|'operator'='tenant',method='GET') {
 return fetch(origin+'/api'+path,{method,headers:{...(kind==='tenant'?{authorization:'Bearer '+token()}:kind==='operator'?{authorization:'Bearer qualified-operator'}:{}),'content-type':'application/json'},...(method==='GET'?{}:{body:JSON.stringify({})})});
}
beforeAll(async()=>{
 process.env.ACCESS_TOKEN_SECRET='route-test-secret';const app=express();app.use(express.json());app.use('/api',router);app.use(launchErrorHandler);
 server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));origin='http://127.0.0.1:'+(server.address() as AddressInfo).port;
});
afterAll(async()=>new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve())));
beforeEach(()=>{
 vi.clearAllMocks();m.role='ADMIN';m.active=true;m.suspended=false;m.epoch=0;m.forced=false;m.account.mockResolvedValue({});
 m.principal.mockImplementation(async()=>({id:1,name:'Owner',email:'owner@example.invalid',role:m.role,isActive:true,credentialVersion:m.epoch,mustChangePassword:m.forced,companyId:1,company:{isActive:m.active,operationalStatus:m.suspended?'SUSPENDED':'ACTIVE'}}));
});
it.each(['/owner-identity/status','/company/settings','/attendance/7/annotations','/subscription/manage/lifecycle','/common/get-current-user'])('anonymous request cannot use %s',async path=>{
 expect((await request(path,'anonymous')).status).toBe(401);expect(m.api).not.toHaveBeenCalled();
});
it.each(['/owner-identity/status','/company/settings','/attendance/7/annotations','/subscription/manage/lifecycle','/common/get-current-user'])('operator token cannot use tenant capability %s',async path=>{
 expect((await request(path,'operator')).status).toBe(401);expect(m.api).not.toHaveBeenCalled();
});
it.each(['/platform/companies','/platform/service/diagnostics','/platform/service/audit','/platform/service/inquiries'])('operator capability %s has separate verification',async path=>{
 expect((await request(path,'operator')).status).toBe(200);expect(m.api).toHaveBeenCalledWith(expect.objectContaining({subject:'provisioned-person'}),...m.api.mock.calls[0]!.slice(1));
 // Mocked identity verifier only accepts the explicitly qualified operator seam.
 expect((await request(path,'tenant')).status).not.toBe(200);expect((await request(path,'anonymous')).status).not.toBe(200);
});
it.each(['/owner-identity/status','/subscription/manage/lifecycle','/subscription/manage/catalog','/common/get-current-user'])('active owner can reach %s while company inactive/suspended',async path=>{
 m.active=false;m.suspended=true;expect((await request(path)).status).toBe(200);
});
it.each(['/company/settings','/attendance/7/annotations'])('suspension denies operational %s',async path=>{
 m.suspended=true;expect((await request(path)).status).toBe(403);expect(m.api).not.toHaveBeenCalled();
});
it('settings and annotations use persisted tenant identity and concrete write policy',async()=>{
 expect((await request('/company/settings')).status).toBe(200);
 expect((await request('/company/settings','tenant','PATCH')).status).toBe(200);
 expect(m.account).toHaveBeenCalledWith(expect.objectContaining({companyId:1,role:'ADMIN'}),'MANAGE_WORK');
 m.role='STAFF';expect((await request('/attendance/7/annotations','tenant','POST')).status).toBe(201);
 expect(m.account).toHaveBeenCalledWith(expect.objectContaining({companyId:1,role:'STAFF'}),'ANNOTATE_ATTENDANCE');
 m.role='MANAGER';expect((await request('/company/settings')).status).toBe(403);
});
it('public recovery and configured support stay outside operational authentication',async()=>{
 m.suspended=true;m.active=false;
 expect((await request('/owner-identity/recovery/request','anonymous','POST')).status).toBe(202);
 expect((await request('/owner-identity/recovery/complete','anonymous','POST')).status).toBe(200);
 expect((await request('/owner-identity/email/complete','anonymous','POST')).status).toBe(200);
 const support=await request('/support/contact','anonymous');expect(support.status).toBe(200);expect(await support.json()).toMatchObject({data:{available:false,email:null}});
 expect((await request('/support/inquiries','anonymous')).status).toBe(404);
});
it('public pricing, inquiry and refresh remain reachable without tenant token',async()=>{
 expect((await request('/subscription/pricing-context','anonymous')).status).toBe(200);
 expect((await request('/subscription/enterprise-inquiries','anonymous','POST')).status).toBe(201);
 expect((await request('/common/refresh-token','anonymous','POST')).status).toBe(200);
});
it('credential epochs and forced-password sessions remain enforced on own-security and billing',async()=>{
 m.active=false;m.suspended=true;m.epoch=1;expect((await request('/owner-identity/status')).status).toBe(401);
 m.epoch=0;m.forced=true;expect((await request('/subscription/manage/lifecycle')).status).toBe(403);
 expect((await request('/common/security/password','tenant','POST')).status).toBe(200);expect(m.change).toHaveBeenCalledOnce();
});
it('known schema/conflict failures are sanitized; unknown secrets never reach JSON or logging',async()=>{
 const app=express();app.get('/error',()=>{throw new Error('database secret=private');});app.use(launchErrorHandler);
 const inner=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>inner.once('listening',resolve));
 const result=await fetch('http://127.0.0.1:'+(inner.address() as AddressInfo).port+'/error');expect(result.status).toBe(500);expect(await result.text()).not.toContain('private');
 await new Promise<void>((resolve,reject)=>inner.close(error=>error?reject(error):resolve()));
 m.account.mockRejectedValueOnce(new ApiError(403,'Subscription needed',[{code:'SUBSCRIPTION_REQUIRED'}]));
 const denied=await request('/company/settings','tenant','PATCH');expect(denied.status).toBe(403);expect(await denied.json()).toMatchObject({code:'SUBSCRIPTION_REQUIRED'});
});

it.each([
 [new multer.MulterError('LIMIT_FILE_SIZE'),413,'LIMIT_FILE_SIZE'],
 [{code:'P2002',message:'private SQL'},409,'CONFLICT'],
 [{code:'P2034',message:'private SQL'},409,'CONFLICT'],
 [{type:'entity.too.large',body:'private body'},413,'REQUEST_TOO_LARGE'],
 [Object.assign(new SyntaxError('private body'),{body:'private body'}),400,'INVALID_REQUEST'],
 [z.string().safeParse(1).error,400,'INVALID_REQUEST'],
] as const)('normalizes known transport/schema/conflict failures without leaking body/SQL', (error,status,code)=>{
 const res={status:vi.fn(),json:vi.fn()};res.status.mockReturnValue(res);
 launchErrorHandler(error,{} as any,res as any,vi.fn());expect(res.status).toHaveBeenCalledWith(status);expect(res.json).toHaveBeenCalledWith(expect.objectContaining({success:false,code}));expect(JSON.stringify(res.json.mock.calls)).not.toContain('private');
});

it('legacy subscription summary keeps active manager reads but only owners bypass company suspension',async()=>{
 m.role='MANAGER';expect((await request('/subscription')).status).toBe(200);
 m.suspended=true;expect((await request('/subscription')).status).toBe(403);
 m.role='ADMIN';expect((await request('/subscription')).status).toBe(200);
});

it.each([
 ['/owner-identity/email/request','tenant','POST',202],
 ['/subscription/manage/checkout','tenant','POST',201],
 ['/subscription/manage/managed-portal','tenant','POST',201],
 ['/common/security/staff/7/handoff','tenant','POST',200],
 ['/common/security/handoff/complete','anonymous','POST',200],
 ['/platform/companies/1','operator','GET',200],
 ['/platform/companies/1/status','operator','PATCH',200],
 ['/platform/service/inquiries/fixture','operator','GET',200],
 ['/platform/service/inquiries/fixture','operator','PATCH',200],
] as const)('mounts %s with its existing explicit adapter contract',async(path,kind,method,status)=>{
 const result=await request(path,kind,method);expect(result.status).toBe(status);expect(m.api).toHaveBeenCalled();expect(result.headers.get('cache-control')).toContain('no-store');
});
