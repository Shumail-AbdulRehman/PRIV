import {configureStore} from '@reduxjs/toolkit';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {act,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import authReducer,{setUser,type AuthUser} from '@/store/slices/authSlice';
import {LanguageProvider} from '@/i18n/LanguageProvider';
import SubscriptionPage from './SubscriptionPage';
import WelcomePage from '../Pricing/WelcomePage';
import {PaddlePricing} from '../Pricing/PaddlePricing';
import * as api from './api';
import type {BillingLifecycle,BillingCatalogEntry} from './types';
const m=vi.hoisted(()=>({get:vi.fn(),post:vi.fn(),paddle:vi.fn(),open:vi.fn(),commercialReady:true}));
vi.mock('../Help/serviceInformation',()=>({useServiceInformation:()=>({purchaseReady:m.commercialReady}),getPublicSupport:async()=>({email:m.commercialReady?'synthetic@example.invalid':null})}));
vi.mock('@/api/client',()=>({client:{get:m.get,post:m.post}}));
vi.mock('@/lib/paddle',()=>({getPaddle:m.paddle}));
const transactionId='txn_'+'a'.repeat(26);
const owner={id:7,role:'ADMIN' as const,name:'Synthetic owner',email:'owner@example.invalid',companyId:42};
let lifecycle:BillingLifecycle;
let catalog:BillingCatalogEntry[];
function mount(page:React.ReactNode=<SubscriptionPage/>,role:AuthUser['role']='ADMIN',language='en') {
 localStorage.setItem('hygene-ops.language',language);
 const store=configureStore({reducer:{auth:authReducer}});store.dispatch(setUser({...owner,role}));
 const query=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:Infinity},mutations:{retry:false}}});
 const view=render(<Provider store={store}><QueryClientProvider client={query}><LanguageProvider><MemoryRouter><div className="workspace">{page}</div></MemoryRouter></LanguageProvider></QueryClientProvider></Provider>);
 return {...view,store,query};
}
beforeEach(()=>{m.commercialReady=true;
 vi.clearAllMocks();localStorage.clear();
 lifecycle={company:{id:42,name:'Synthetic company',plan:'PRO',isActive:true,operationalStatus:'ACTIVE'},usage:{locations:4,staff:28,managers:2},limits:{locations:5,staff:25,managers:3},subscription:null,reconciliationRequired:false,billingConfigured:false,ownerVerified:true,providerState:'NOT_LINKED',portalAvailable:false,checkoutAvailable:false};
 catalog=[{plan:'PRO',interval:'month',priceId:'pri_'+'b'.repeat(26),productId:'pro_fixture',amount:'2500',currencyCode:'USD',trialPeriod:null}];
 m.get.mockImplementation(async(url:string)=>({data:{data:url==='/common/get-current-user'?owner:url.endsWith('/catalog')?structuredClone(catalog):structuredClone(lifecycle)}}));
 m.post.mockResolvedValue({data:{data:{transactionId,reused:false}}});m.paddle.mockResolvedValue({Checkout:{open:m.open}});
});
afterEach(()=>vi.restoreAllMocks());
function enableCheckout(){lifecycle.billingConfigured=true;lifecycle.checkoutAvailable=true;}
function linked(){lifecycle.billingConfigured=true;lifecycle.portalAvailable=true;lifecycle.checkoutAvailable=false;lifecycle.providerState='MIRRORED';lifecycle.subscription={status:'active',plan:'PRO',catalogQualified:true,periodStart:'2026-10-01T00:00:00Z',periodEnd:'2026-11-01T00:00:00Z',scheduledChangeAction:'cancel',scheduledChangeAt:'2026-11-01T00:00:00Z',lastEventAt:'2026-10-20T03:00:00Z'};}
it.each(['MANAGER','STAFF'] as const)('denies %s before any billing request',role=>{
 mount(<SubscriptionPage/>,role);expect(screen.getByRole('alert')).toHaveTextContent('Only the company owner');expect(m.get).not.toHaveBeenCalled();expect(m.post).not.toHaveBeenCalled();
});
it('unconfigured catalog and terms cannot checkout or initialize Paddle',async()=>{
 mount();await screen.findByText('Checkout is unavailable until the billing catalog and commercial terms are approved and configured.');expect(m.get).toHaveBeenCalledWith('/subscription/manage/lifecycle',expect.objectContaining({signal:expect.any(AbortSignal)}));expect(m.get.mock.calls.some(([url])=>url.endsWith('/catalog'))).toBe(false);expect(screen.queryByRole('button',{name:'Continue to checkout'})).not.toBeInTheDocument();expect(m.paddle).not.toHaveBeenCalled();
});
it('renders real counts including over-limit records without deletion actions',async()=>{
 mount();await screen.findByText('28 / 25');expect(screen.getByText('Over limit')).toBeInTheDocument();expect(screen.queryByRole('button',{name:/Delete|Remove/})).not.toBeInTheDocument();expect(screen.getByText(/Existing records and history are preserved/)).toBeInTheDocument();
});
it('linked subscriber opens only actual protected portal, no new catalog or purchase',async()=>{
 linked();const redirect=vi.spyOn(api,'navigateToBillingPortal').mockImplementation(()=>{});m.post.mockResolvedValue({data:{data:{url:'https://sandbox-customer-portal.paddle.com/fixture'}}});mount();fireEvent.click(await screen.findByRole('button',{name:'Manage billing in Paddle'}));await waitFor(()=>expect(redirect).toHaveBeenCalledWith('https://sandbox-customer-portal.paddle.com/fixture'));expect(m.post).toHaveBeenCalledWith('/subscription/manage/managed-portal',{},expect.any(Object));expect(m.paddle).not.toHaveBeenCalled();expect(m.get.mock.calls.some(([url])=>url.endsWith('/catalog'))).toBe(false);expect(screen.queryByRole('button',{name:'Continue to checkout'})).not.toBeInTheDocument();
});
it('suspended owner retains portal and security; payment does not claim unsuspension',async()=>{
 linked();lifecycle.company.operationalStatus='SUSPENDED';mount();await screen.findByText(/Payment does not remove an administrative suspension/);expect(screen.getByRole('link',{name:'Your account security'})).toHaveAttribute('href','/account/security');expect(screen.getByRole('button',{name:'Manage billing in Paddle'})).toBeEnabled();
});
it('uses provider period/status/scheduled changes and never a local trial clock',async()=>{
 linked();lifecycle.subscription!.status='trialing';mount();await screen.findByText('Trialing');expect(document.querySelectorAll('time')).toHaveLength(4);expect(screen.getByText('cancel')).toBeInTheDocument();expect(screen.queryByText(/7.day free trial/i)).not.toBeInTheDocument();
});
it('server checkout receives only plan/interval and Paddle opens the returned transaction',async()=>{
 enableCheckout();mount();fireEvent.click(await screen.findByRole('button',{name:'Continue to checkout'}));await waitFor(()=>expect(m.open).toHaveBeenCalledTimes(1));expect(m.post).toHaveBeenCalledWith('/subscription/manage/checkout',{plan:'PRO',interval:'month'},expect.objectContaining({signal:expect.any(AbortSignal)}));expect(m.open).toHaveBeenCalledWith({transactionId,settings:{displayMode:'overlay',theme:'light',successUrl:'http://localhost:3000/welcome'}});expect(screen.getByRole('status')).toHaveTextContent('Activation is confirmed only after provider synchronization');
});
it('reopens the prepared transaction without another POST, cache or browser persistence',async()=>{
 enableCheckout();const {query}=mount();fireEvent.click(await screen.findByRole('button',{name:'Continue to checkout'}));const reopen=await screen.findByRole('button',{name:'Reopen existing checkout'});await waitFor(()=>expect(reopen).toBeEnabled());fireEvent.click(reopen);await waitFor(()=>expect(m.open).toHaveBeenCalledTimes(2));expect(m.post).toHaveBeenCalledTimes(1);expect(query.getMutationCache().getAll()).toHaveLength(0);expect(JSON.stringify(query.getQueryCache().getAll().map(q=>q.state.data))).not.toContain(transactionId);expect(localStorage.getItem('transactionId')).toBeNull();
});
it('awaiting webhook remains pending on checkout return and refresh observes real mirror only',async()=>{
 lifecycle.providerState='AWAITING_PROVIDER';mount(<Routes><Route path="/" element={<WelcomePage/>}/><Route path="/subscription" element={<SubscriptionPage/>}/></Routes>);await screen.findByText(/Activation is awaiting provider synchronization/);expect(screen.queryByText('Active',{exact:true})).not.toBeInTheDocument();linked();fireEvent.click(screen.getByRole('button',{name:'Refresh billing status'}));await screen.findByText('Active',{exact:true});expect(screen.queryByText(/Activation is awaiting provider synchronization/)).not.toBeInTheDocument();
});
it('unresolved reservation never exposes new checkout',async()=>{
 enableCheckout();lifecycle.reconciliationRequired=true;lifecycle.checkoutAvailable=false;mount();await screen.findByText(/A billing request needs reconciliation/);expect(screen.queryByRole('button',{name:'Continue to checkout'})).not.toBeInTheDocument();expect(m.paddle).not.toHaveBeenCalled();
});
it('uncertain request blocks another payment and tells owner to reconcile',async()=>{
 enableCheckout();m.post.mockRejectedValue({response:{status:503,data:{message:'private provider payload'}}});mount();fireEvent.click(await screen.findByRole('button',{name:'Continue to checkout'}));await screen.findByRole('alert');expect(screen.getByRole('alert')).toHaveTextContent('Do not pay again');expect(screen.queryByRole('button',{name:'Continue to checkout'})).not.toBeInTheDocument();expect(screen.queryByText('private provider payload')).not.toBeInTheDocument();expect(m.post).toHaveBeenCalledTimes(1);
});
it('missing browser billing configuration fails before reserving checkout',async()=>{
 enableCheckout();m.paddle.mockRejectedValue(new Error('private config'));mount();fireEvent.click(await screen.findByRole('button',{name:'Continue to checkout'}));await screen.findByRole('alert');expect(m.post).not.toHaveBeenCalled();expect(screen.queryByText('private config')).not.toBeInTheDocument();
});
it('fresh linkage check denies stale purchase selection',async()=>{
 enableCheckout();mount();const button=await screen.findByRole('button',{name:'Continue to checkout'});linked();fireEvent.click(button);await screen.findByRole('alert');expect(m.post).not.toHaveBeenCalled();expect(m.open).not.toHaveBeenCalled();
});
it('account switching clears stale UI and late checkout cannot open for former principal',async()=>{
 enableCheckout();let resolve!:(value:unknown)=>void;m.post.mockReturnValue(new Promise(r=>resolve=r));const {store}=mount();fireEvent.click(await screen.findByRole('button',{name:'Continue to checkout'}));await waitFor(()=>expect(m.post).toHaveBeenCalledTimes(1));act(()=>store.dispatch(setUser({...owner,id:99,companyId:55,role:'MANAGER'})));await act(async()=>resolve({data:{data:{transactionId,reused:false}}}));expect(m.open).not.toHaveBeenCalled();expect(screen.getByRole('alert')).toHaveTextContent('Only the company owner');
});
it('denied read never renders fabricated zero usage or private backend errors',async()=>{
 m.get.mockRejectedValue({response:{status:403,data:{message:'private SQL'}}});mount();await screen.findByRole('alert');expect(screen.queryByText('0 / 0')).not.toBeInTheDocument();expect(screen.queryByText('private SQL')).not.toBeInTheDocument();expect(screen.getByRole('link',{name:'Your account security'})).toBeInTheDocument();
});
it('catalog outage can be retried with explicit refresh without purchase',async()=>{
 enableCheckout();m.get.mockImplementation(async(url:string)=>{if(url.endsWith('/catalog'))throw {response:{status:503}};return {data:{data:url==='/common/get-current-user'?owner:lifecycle}};});mount();await screen.findByText(/Configured prices could not be loaded/);m.get.mockImplementation(async(url:string)=>({data:{data:url.endsWith('/catalog')?catalog:lifecycle}}));fireEvent.click(screen.getByRole('button',{name:'Refresh billing status'}));await screen.findByRole('button',{name:'Continue to checkout'});expect(m.post).not.toHaveBeenCalled();
});
it('only provider trial facts are rendered and zero-decimal currency is not divided by100',async()=>{
 enableCheckout();catalog[0]={...catalog[0],currencyCode:'JPY',amount:'2500',trialPeriod:{interval:'day',frequency:5}};mount();await screen.findByText(/2,500/);expect(screen.getByText(/5 day/)).toBeInTheDocument();expect(screen.queryByText(/7.day/)).not.toBeInTheDocument();
});
it('Urdu billing workflow uses RTL and translated fields',async()=>{
 mount(<SubscriptionPage/>,'ADMIN','ur');await screen.findByRole('heading',{name:'آپ کی سبسکرپشن'});expect(document.documentElement.dir).toBe('rtl');expect(screen.getByRole('button',{name:'بلنگ کی حالت تازہ کریں'})).toBeInTheDocument();expect(screen.getByText('استعمال اور گنجائش')).toBeInTheDocument();
});
it('public/legacy pricing cannot start price-only checkout or promise trial',()=>{
 mount(<PaddlePricing appearance="marketing"/>);expect(screen.getAllByRole('link',{name:'Open Plan & billing'})).toHaveLength(2);expect(m.paddle).not.toHaveBeenCalled();expect(m.post).not.toHaveBeenCalled();expect(screen.queryByText(/7.day free trial/)).not.toBeInTheDocument();
});
it('portal browser boundary rejects untrusted hosts and credential URLs',()=>{
 for(const url of ['https://evil.invalid/x','http://customer-portal.paddle.com/','https://user:pass@customer-portal.paddle.com/','https://customer-portal.paddle.com:444/'])expect(()=>api.navigateToBillingPortal(url)).toThrow();
});

it('guards duplicate clicks while the server checkout is pending',async()=>{
 enableCheckout();m.post.mockReturnValue(new Promise(()=>{}));mount();const button=await screen.findByRole('button',{name:'Continue to checkout'});fireEvent.click(button);fireEvent.click(button);await waitFor(()=>expect(m.post).toHaveBeenCalledTimes(1));expect(screen.getByRole('button',{name:'Opening…'})).toBeDisabled();
});
it('rejects mismatched company data without exposing its counts',async()=>{
 lifecycle.company.id=55;mount();await screen.findByRole('alert');expect(screen.getByRole('alert')).toHaveTextContent('do not match');expect(screen.queryByText('28 / 25')).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Continue to checkout'})).not.toBeInTheDocument();
});

it('unavailable customer policy/support information disables purchase without blocking existing account reads',async()=>{enableCheckout();m.commercialReady=false;mount();await screen.findByText('New purchases are unavailable until approved customer policies and a support contact are available.');expect(await screen.findByRole('button',{name:'Continue to checkout'})).toBeDisabled();expect(m.post).not.toHaveBeenCalled();});

it('organizes real subscription, capacity and latest activity with a separate recovery/help rail',async()=>{
 linked();mount();
 const record=await screen.findByRole('region',{name:'Your subscription'});
 const capacity=screen.getByRole('region',{name:'Usage and capacity'});
 const activity=screen.getByRole('region',{name:'Billing activity'});
 expect(record.compareDocumentPosition(capacity)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 expect(capacity.compareDocumentPosition(activity)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 expect(within(record).getByText('Active').closest('.ops-status')).toHaveAttribute('data-tone','success');
 expect(within(activity).getByText('Last provider event')).toBeInTheDocument();
 expect(within(activity).getByText(/Only the latest recorded provider event/)).toBeInTheDocument();
 expect(within(activity).queryByText(/Subscription activated/)).not.toBeInTheDocument();
 const rail=screen.getByRole('complementary',{name:'Billing guidance'});
 expect(within(rail).getByRole('heading',{name:'Subscription help'})).toBeInTheDocument();
 expect(within(rail).getByRole('link',{name:'Contact support'})).toHaveAttribute('href','/help');
 expect(within(rail).getByRole('link',{name:'Your account security'})).toHaveAttribute('href','/account/security');
 expect(within(rail).getByRole('link',{name:'Owner verification and settings'})).toHaveAttribute('href','/settings');
 expect(screen.queryByRole('button',{name:/Preview cancellation|Compare plan capacity/})).not.toBeInTheDocument();
});
it('empty billing history explains absent records without inventing an activation or invoice',async()=>{
 mount();const activity=await screen.findByRole('region',{name:'Billing activity'});
 expect(within(activity).getByText('No provider billing activity recorded.')).toBeInTheDocument();
 expect(within(activity).queryByRole('time')).not.toBeInTheDocument();
 expect(screen.queryByText('Subscription activated')).not.toBeInTheDocument();
 expect(screen.queryByRole('button',{name:/invoice|document/i})).not.toBeInTheDocument();
});
it('loading keeps a named placeholder and recovery links without fabricated capacity',()=>{
 m.get.mockReturnValue(new Promise(()=>{}));mount();
 expect(screen.getByRole('status')).toHaveAttribute('aria-busy','true');
 expect(screen.getByRole('heading',{name:'Loading billing records…'})).toBeInTheDocument();
 expect(screen.queryByRole('region',{name:'Usage and capacity'})).not.toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Your account security'})).toBeInTheDocument();
});
it('failed lifecycle refresh retains labelled facts while disabling the portal',async()=>{
 linked();mount();await screen.findByText('Active',{exact:true});
 m.get.mockRejectedValue({response:{status:503}});
 fireEvent.click(screen.getByRole('button',{name:'Refresh billing status'}));
 await screen.findByText('Showing previously loaded billing records. Refresh before taking any action.');
 expect(screen.getByText('28 / 25')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Manage billing in Paddle'})).toBeDisabled();
 expect(m.post).not.toHaveBeenCalled();
});
it('failed catalog refresh removes stale price actions until an explicit successful refresh',async()=>{
 enableCheckout();mount();await screen.findByRole('button',{name:'Continue to checkout'});
 m.get.mockImplementation(async(url:string)=>{if(url.endsWith('/catalog'))throw {response:{status:503}};return {data:{data:structuredClone(lifecycle)}};});
 fireEvent.click(screen.getByRole('button',{name:'Refresh billing status'}));
 await screen.findByText('Configured prices could not be loaded. Checkout is unavailable. Refresh billing status to try again.');
 expect(screen.queryByRole('button',{name:'Continue to checkout'})).not.toBeInTheDocument();
 expect(m.post).not.toHaveBeenCalled();
});
it('Urdu translates billing guidance, activity and recovery destinations',async()=>{
 mount(<SubscriptionPage/>,'ADMIN','ur');
 await screen.findByRole('heading',{name:'بلنگ کی سرگرمی'});
 const rail=screen.getByRole('complementary',{name:'بلنگ کی رہنمائی'});
 expect(within(rail).getByRole('heading',{name:'سبسکرپشن کی مدد'})).toBeInTheDocument();
 expect(within(rail).getByRole('link',{name:'مدد حاصل کریں'})).toHaveAttribute('href','/help');
 expect(screen.getByText('ادائیگی کی سروس کی کوئی بلنگ سرگرمی درج نہیں۔')).toBeInTheDocument();
});

it('mismatched lifecycle cannot trigger a catalog request even when it advertises checkout',async()=>{
 enableCheckout();lifecycle.company.id=55;mount();
 await screen.findByText('Billing records do not match the current workspace. Refresh your account.');
 expect(m.get.mock.calls.some(([url])=>url.endsWith('/catalog'))).toBe(false);
 expect(screen.queryByRole('region',{name:'Usage and capacity'})).not.toBeInTheDocument();
 expect(m.post).not.toHaveBeenCalled();
});

it('inactive company receives suspension guidance without losing its billing and security actions',async()=>{
 linked();lifecycle.company.isActive=false;mount();
 await screen.findByText(/Payment does not remove an administrative suspension/);
 expect(screen.getByRole('button',{name:'Manage billing in Paddle'})).toBeEnabled();
 expect(screen.getByRole('link',{name:'Your account security'})).toHaveAttribute('href','/account/security');
});
