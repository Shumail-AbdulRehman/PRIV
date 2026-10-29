import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {LanguageProvider} from '@/i18n/LanguageProvider';
import HelpPage,{ServiceInformationPage} from './HelpPage';
import {approvedLink,serviceInformation,getPublicSupport} from './serviceInformation';
const request=vi.fn();
function mount(language='en',information=false,query=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})) {localStorage.setItem('hygene-ops.language',language);return render(<QueryClientProvider client={query}><LanguageProvider><MemoryRouter>{information?<ServiceInformationPage/>:<HelpPage/>}</MemoryRouter></LanguageProvider></QueryClientProvider>);}
function policies(){vi.stubEnv('VITE_SERVICE_POLICIES_APPROVED','true');vi.stubEnv('VITE_SERVICE_POLICY_ORIGIN','https://approved.example.invalid');for(const key of ['TERMS','PRIVACY','EXIT'])vi.stubEnv(`VITE_SERVICE_${key}_URL`,`https://approved.example.invalid/${key.toLowerCase()}`);}
beforeEach(()=>{localStorage.clear();vi.spyOn(window,'scrollTo').mockImplementation(()=>{});vi.stubGlobal('fetch',request);request.mockReset();request.mockResolvedValue({ok:true,json:async()=>({data:{available:false,email:null,channel:null,verification:'UNAVAILABLE'}})});});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();vi.useRealTimers();});
it('missing facts show unavailable policies, support and Android; no invented links or purchase claim',async()=>{mount('en',true);await screen.findByText('Support contact is unavailable. No delivery channel has been qualified.');expect(screen.getAllByText('Approved document unavailable')).toHaveLength(3);expect(screen.queryByRole('link',{name:/^Read approved document:/})).not.toBeInTheDocument();expect(screen.queryByRole('link',{name:/Open approved Android/})).not.toBeInTheDocument();expect(screen.getByText(/New purchases are unavailable/)).toBeInTheDocument();});
it('public contact request omits credentials and works without tenant identity',async()=>{mount();await waitFor(()=>expect(request).toHaveBeenCalled());expect(request).toHaveBeenCalledWith('/api/support/contact',expect.objectContaining({credentials:'omit',cache:'no-store',redirect:'error',signal:expect.any(AbortSignal)}));});
it('unavailable request has a real retry and does not expose raw error',async()=>{request.mockRejectedValue(new Error('PRIVATE SECRET'));mount();await screen.findByRole('alert');expect(screen.queryByText('PRIVATE SECRET')).not.toBeInTheDocument();request.mockResolvedValue({ok:true,json:async()=>({data:{available:false}})});fireEvent.click(screen.getByRole('button',{name:'Retry support contact'}));await screen.findByText('Support contact is unavailable. No delivery channel has been qualified.');expect(request).toHaveBeenCalledTimes(2);});
it('approved safe policy and Android links pin expected origins; configured mailbox claims no delivery',async()=>{policies();vi.stubEnv('VITE_ANDROID_DISTRIBUTION_APPROVED','true');vi.stubEnv('VITE_ANDROID_DOWNLOAD_ORIGIN','https://distribution.example.invalid');vi.stubEnv('VITE_ANDROID_DOWNLOAD_URL','https://distribution.example.invalid/app.apk');request.mockResolvedValue({ok:true,json:async()=>({data:{available:true,email:'support@example.invalid',channel:'EMAIL',verification:'OPERATOR_CONFIGURED'}})});mount('en',true);await screen.findByRole('link',{name:/Open support email/});expect(screen.getAllByRole('link',{name:/^Read approved document:/}).map(link=>link.getAttribute('href'))).toEqual(['https://approved.example.invalid/terms','https://approved.example.invalid/privacy','https://approved.example.invalid/exit']);expect(screen.getByRole('link',{name:'Open approved Android distribution'})).toHaveAttribute('href','https://distribution.example.invalid/app.apk');expect(screen.getByText(/Opening email does not confirm message delivery/)).toBeInTheDocument();});
it.each(['javascript:alert(1)','http://approved.example.invalid/terms','https://approved.example.invalid.evil.invalid/terms','https://name:password@approved.example.invalid/terms','https://approved.example.invalid/terms?token=secret','//approved.example.invalid/terms','https://approved.example.invalid/terms#token'])('rejects unsafe or unexpected policy link %s',raw=>{expect(approvedLink(raw,'https://approved.example.invalid','true')).toBeNull();});
it('a URL without explicit approval cannot enable policy or Android availability',()=>{expect(approvedLink('https://approved.example.invalid/terms','https://approved.example.invalid',undefined)).toBeNull();expect(serviceInformation({VITE_SERVICE_TERMS_URL:'https://approved.example.invalid/terms'}).policiesReady).toBe(false);});
it.each(['UNAVAILABLE','OPERATOR_CONFIGURED'])('invalid mailbox or unqualified channel %s is not linked',async verification=>{request.mockResolvedValue({ok:true,json:async()=>({data:{available:true,email:verification==='UNAVAILABLE'?'support@example.invalid':'support@example.invalid?bcc=other',channel:'EMAIL',verification}})});mount();await screen.findByText('Support contact is unavailable. No delivery channel has been qualified.');expect(screen.queryByRole('link',{name:/Open support email/})).not.toBeInTheDocument();});
it('photo guidance distinguishes upload/submission/review/verification and makes no AI guarantee',async()=>{mount();await screen.findByText(/An upload alone does not verify a task/);expect(screen.getByText(/New automated photo processing is unavailable/)).toBeInTheDocument();});
it('Urdu assistance is available without sign-in and respects RTL',async()=>{mount('ur');await screen.findByRole('heading',{name:'مدد اور سروس کی معلومات'});expect(document.documentElement.dir).toBe('rtl');expect(screen.getByRole('link',{name:'مالک کا اکاؤنٹ بحال کریں'})).toHaveAttribute('href','/recover-owner-account');});

it('help offers real public recovery/information paths and native FAQ disclosure without a fake ticket form',async()=>{mount();await screen.findByText('Support contact is unavailable. No delivery channel has been qualified.');expect(screen.getByRole('link',{name:'Review information'})).toHaveAttribute('href','/service-information');expect(screen.getByRole('link',{name:'Owner account recovery'})).toHaveAttribute('href','/recover-owner-account');expect(screen.queryByRole('textbox')).not.toBeInTheDocument();const question=screen.getByText('Why does a closed review not verify a task?');fireEvent.click(question);expect(question.closest('details')).toHaveAttribute('open');expect(screen.getByText(/Review closure records a manager decision/)).toBeVisible();});
it('loading preserves useful help while contact is pending and does not show stale email',async()=>{request.mockReturnValue(new Promise(()=>{}));mount();expect(screen.getByRole('status')).toHaveTextContent('Loading support contact…');expect(screen.getByRole('heading',{name:'Common questions'})).toBeVisible();expect(screen.getByRole('link',{name:'Owner account recovery'})).toBeVisible();expect(screen.queryByRole('link',{name:/Open support email/})).not.toBeInTheDocument();});
it('service information is a distinct public card with guarded facts and a help return path',async()=>{mount('ur',true);await screen.findByRole('heading',{level:1,name:'سروس کی معلومات'});expect(screen.getAllByText('منظور شدہ دستاویز دستیاب نہیں')).toHaveLength(3);expect(screen.getByRole('link',{name:'مدد اور سروس کی معلومات'})).toHaveAttribute('href','/help');expect(screen.queryByRole('heading',{name:'عام سوالات'})).not.toBeInTheDocument();});
it('Urdu help translates contact loading/errors and common questions',async()=>{request.mockRejectedValue(new Error('PRIVATE'));mount('ur');await screen.findByText('مدد کا رابطہ لوڈ نہیں ہو سکا۔');expect(screen.getByRole('button',{name:'مدد کا رابطہ دوبارہ لوڈ کریں'})).toBeVisible();expect(screen.getByRole('heading',{name:'عام سوالات'})).toBeVisible();});

it.each(['en','ur'])('approved document links have distinct translated accessible names in %s',async language=>{
 policies();mount(language,true);
 const labels=language==='ur'?['سروس اور بلنگ کی شرائط','رازداری کی معلومات','ریکارڈ محفوظ رکھنا اور اکاؤنٹ بند کرنا']:['Service and billing terms','Privacy information','Retention and account closure'];
 const prefix=language==='ur'?'منظور شدہ دستاویز پڑھیں':'Read approved document';
 for(const label of labels)expect(screen.getByRole('link',{name:`${prefix}: ${label}`})).toBeVisible();
 await screen.findByText(language==='ur'?'مدد کا رابطہ دستیاب نہیں۔ پیغام پہنچانے کے کسی ذریعے کی جانچ مکمل نہیں ہوئی۔':'Support contact is unavailable. No delivery channel has been qualified.');
 expect(document.title).toBe(`${language==='ur'?'سروس کی معلومات':'Service information'} | Hygene Ops`);
});

it('cached contact cannot imply purchase readiness during refresh, failure or unavailable retry',async()=>{
 policies();const query=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});
 query.setQueryData(['public-service','support-contact'],{email:'previous@example.invalid'});
 let rejectRequest!:(error:Error)=>void;
 request.mockReturnValueOnce(new Promise((_resolve,reject)=>{rejectRequest=reject;}));
 mount('en',true,query);await screen.findByText('Loading support contact…');
 expect(screen.queryByRole('link',{name:/Open support email/})).not.toBeInTheDocument();
 expect(screen.getByText(/New purchases are unavailable/)).toBeVisible();
 rejectRequest(new Error('PRIVATE response details'));await screen.findByRole('alert');
 expect(screen.queryByText('previous@example.invalid')).not.toBeInTheDocument();
 expect(screen.getByText(/New purchases are unavailable/)).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Retry support contact'}));
 await screen.findByText('Support contact is unavailable. No delivery channel has been qualified.');
 expect(screen.queryByRole('link',{name:/Open support email/})).not.toBeInTheDocument();
});

it('one missing approved policy keeps purchases unavailable even with a configured contact',async()=>{
 policies();vi.stubEnv('VITE_SERVICE_EXIT_URL','');
 request.mockResolvedValue({ok:true,json:async()=>({data:{available:true,email:'support@example.invalid',channel:'EMAIL',verification:'OPERATOR_CONFIGURED'}})});
 mount('en',true);await screen.findByRole('link',{name:/Open support email/});
 expect(screen.getAllByRole('link',{name:/^Read approved document:/})).toHaveLength(2);
 expect(screen.getByText('Approved document unavailable')).toBeVisible();
 expect(screen.getByText(/New purchases are unavailable/)).toBeVisible();
});

it.each([401,403,500])('public contact HTTP %s permits retry without tenant identity or raw error content',async status=>{
 request.mockResolvedValueOnce({ok:false,status,json:async()=>({message:'PRIVATE account details'})});
 mount();await screen.findByRole('alert');
 expect(screen.queryByText('PRIVATE account details')).not.toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Retry support contact'})).toBeEnabled();
 expect(request.mock.calls[0][1].credentials).toBe('omit');
});

function stalledContact() {
 request.mockImplementation((_url,{signal}:{signal:AbortSignal})=>new Promise((_resolve,reject)=>{
  const abort=()=>reject(new DOMException('Aborted','AbortError'));
  if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});
 }));
}
it('a stalled public contact request ends instead of leaving help permanently loading',async()=>{
 vi.useFakeTimers();stalledContact();
 const pending=getPublicSupport();const failure=expect(pending).rejects.toMatchObject({name:'AbortError'});
 await vi.advanceTimersByTimeAsync(10_000);await failure;
 expect(request.mock.calls[0][1].signal.aborted).toBe(true);
 expect(vi.getTimerCount()).toBe(0);
});
it.each(['before','during'])('caller cancellation %s the request still aborts fetch and releases the timeout',async when=>{
 vi.useFakeTimers();stalledContact();const controller=new AbortController();
 if(when==='before')controller.abort();
 const pending=getPublicSupport(controller.signal);const failure=expect(pending).rejects.toMatchObject({name:'AbortError'});
 if(when==='during')controller.abort();
 await failure;expect(request.mock.calls[0][1].signal.aborted).toBe(true);expect(vi.getTimerCount()).toBe(0);
});

it('public navigation resets scroll and focuses the new main content instead of a reused link',async()=>{
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})}><LanguageProvider><MemoryRouter initialEntries={['/help']}><Routes><Route path="/help" element={<HelpPage/>}/><Route path="/service-information" element={<ServiceInformationPage/>}/></Routes></MemoryRouter></LanguageProvider></QueryClientProvider>);
 await screen.findByText('Support contact is unavailable. No delivery channel has been qualified.');
 const next=screen.getByRole('link',{name:'Review information'});next.focus();fireEvent.click(next);
 expect(await screen.findByRole('heading',{level:1,name:'Service information'})).toBeVisible();
 expect(screen.getByRole('main')).toHaveFocus();expect(window.scrollTo).toHaveBeenLastCalledWith(0,0);
 const back=screen.getByRole('link',{name:'Help & service information'});back.focus();fireEvent.click(back);
 expect(await screen.findByRole('heading',{level:1,name:'Help & service information'})).toBeVisible();
 expect(screen.getByRole('main')).toHaveFocus();expect(window.scrollTo).toHaveBeenCalledTimes(3);
});

it('the existing staff Android help deep link focuses and scrolls its section',()=>{
 const previous=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'scrollIntoView');const scroll=vi.fn();
 Object.defineProperty(HTMLElement.prototype,'scrollIntoView',{configurable:true,value:scroll});
 try {
  render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})}><LanguageProvider><MemoryRouter initialEntries={['/help#service-android']}><HelpPage/></MemoryRouter></LanguageProvider></QueryClientProvider>);
  expect(document.getElementById('service-android')).toHaveFocus();expect(scroll).toHaveBeenCalledOnce();expect(window.scrollTo).not.toHaveBeenCalled();
 } finally {if(previous)Object.defineProperty(HTMLElement.prototype,'scrollIntoView',previous);else Reflect.deleteProperty(HTMLElement.prototype,'scrollIntoView');}
});
