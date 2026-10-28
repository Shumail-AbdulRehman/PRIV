import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {beforeEach,expect,it,vi} from 'vitest';
import {LanguageProvider} from '@/i18n/LanguageProvider';
import CompaniesPage,{CompanyWorkspace} from './CompaniesPage';
import type {CompanyDetail,CompanySummary} from './companyApi';
const m=vi.hoisted(()=>({request:vi.fn()}));
vi.mock('./operatorSession',async original=>({...await original<typeof import('./operatorSession')>(),operatorRequest:m.request}));
const row:CompanySummary={id:42,name:'Synthetic company',plan:'PRO',isActive:true,operationalStatus:'ACTIVE',accountVersion:3,createdAt:'2026-10-21T00:00:00Z',updatedAt:'2026-10-21T00:00:00Z'};
let detail:CompanyDetail;
function mount(path='/platform/companies',boundary=false,language='en'){
 localStorage.setItem('hygene-ops.language',language);const query=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});
 return render(<QueryClientProvider client={query}><LanguageProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/platform/companies" element={boundary?<CompaniesPage/>:<CompanyWorkspace/>}/><Route path="/platform/companies/:companyId" element={boundary?<CompaniesPage/>:<CompanyWorkspace/>}/></Routes></MemoryRouter></LanguageProvider></QueryClientProvider>);
}
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();detail={company:{...row,suspendedAt:null,suspensionReason:null},operationalReadAllowed:true,billingConfigured:false,mirroredSubscriptionStatus:'PAST_DUE',providerState:'NOT_LINKED',subscription:null,activity:[]};m.request.mockImplementation(async(path:string,options?:{method?:string;body?:{operationalStatus:'ACTIVE'|'SUSPENDED'}})=>{
 if(options?.method==='PATCH'){detail={...detail,company:{...detail.company,operationalStatus:options.body!.operationalStatus,accountVersion:4},activity:[{id:1,action:'COMPANY_SUSPENDED',reason:'Synthetic reason',createdAt:row.createdAt}]};return {data:{company:detail.company,changed:true}};}
 return {data:path.includes('?')?{items:[row],nextCursor:'42'}:structuredClone(detail)};
});});
it('actual route denies tenant/storage identity and never mounts protected company controls',()=>{
 localStorage.setItem('operator',JSON.stringify({role:'ADMIN',kind:'PLATFORM_OPERATOR'}));mount('/platform/companies',true);expect(screen.getByRole('heading',{name:'Platform operator sign-in'})).toBeInTheDocument();expect(screen.queryByLabelText('Search companies')).not.toBeInTheDocument();expect(m.request).not.toHaveBeenCalled();
});
it('search and bounded cursor paging perform scoped requests',async()=>{
 mount();await screen.findAllByRole('link',{name:'Synthetic company'});fireEvent.change(screen.getByLabelText('Search companies'),{target:{value:'Synthetic'}});fireEvent.change(screen.getByLabelText('Operational status'),{target:{value:'SUSPENDED'}});fireEvent.click(screen.getByRole('button',{name:'Apply filters'}));await waitFor(()=>expect(m.request).toHaveBeenCalledWith('/platform/companies?limit=25&q=Synthetic&status=SUSPENDED',expect.any(Object)));fireEvent.click(await screen.findByRole('button',{name:'Next page'}));await waitFor(()=>expect(m.request).toHaveBeenCalledWith('/platform/companies?limit=25&q=Synthetic&status=SUSPENDED&after=42',expect.any(Object)));
});
it('renders only allowlisted company data, never private workforce/provider payload fields',async()=>{
 Object.assign(detail,{staff:[{name:'PRIVATE WORKER'}],photoUrl:'PRIVATE PHOTO',password:'PRIVATE PASSWORD'});mount('/platform/companies/42');await screen.findByRole('heading',{name:'Synthetic company'});for(const text of ['PRIVATE WORKER','PRIVATE PHOTO','PRIVATE PASSWORD'])expect(screen.queryByText(text)).not.toBeInTheDocument();expect(screen.queryByRole('link',{name:/staff|photos|impersonate/i})).not.toBeInTheDocument();
});
it('detail tabs show honest missing billing and recorded activity only',async()=>{
 mount('/platform/companies/42');fireEvent.click(await screen.findByRole('button',{name:'Billing'}));expect(screen.getByText('Mirrored billing metadata')).toBeInTheDocument();expect(screen.getAllByText('Not available').length).toBeGreaterThan(0);fireEvent.click(screen.getByRole('button',{name:'Activity'}));expect(screen.getByText('No platform status changes recorded.')).toBeInTheDocument();
});
it('requires deliberate reasoned confirmation and saves exact optimistic version to real API',async()=>{
 mount('/platform/companies/42');fireEvent.click(await screen.findByRole('button',{name:'Suspend company'}));expect(screen.getByRole('button',{name:'Confirm status change'})).toBeDisabled();fireEvent.change(screen.getByLabelText('Reason'),{target:{value:'Synthetic reason'}});fireEvent.click(screen.getByRole('button',{name:'Confirm status change'}));await screen.findByText('Company status saved. Billing entitlement is unchanged.');expect(m.request).toHaveBeenCalledWith('/platform/companies/42/status',{method:'PATCH',body:{operationalStatus:'SUSPENDED',expectedVersion:3,reason:'Synthetic reason'}});expect(await screen.findByRole('button',{name:'Reactivate company'})).toBeInTheDocument();
});
it('conflict retains draft and refresh does not reverse intended action',async()=>{
 let failed=false;m.request.mockImplementation(async(_path:string,options?:{method?:string})=>{if(options?.method==='PATCH'&&!failed){failed=true;detail.company.operationalStatus='SUSPENDED';detail.company.accountVersion=4;throw {response:{status:409}};}if(options?.method==='PATCH')return {data:{company:detail.company,changed:false}};return {data:structuredClone(detail)};});
 mount('/platform/companies/42');fireEvent.click(await screen.findByRole('button',{name:'Suspend company'}));fireEvent.change(screen.getByLabelText('Reason'),{target:{value:'Keep this reason'}});fireEvent.click(screen.getByRole('button',{name:'Confirm status change'}));await screen.findByRole('alert');expect(screen.getByLabelText('Reason')).toHaveValue('Keep this reason');fireEvent.click(screen.getByRole('button',{name:'Refresh company'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Refresh company'})).toBeEnabled());expect(screen.getByRole('heading',{name:'Confirm suspension'})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Confirm status change'}));await waitFor(()=>expect(m.request).toHaveBeenLastCalledWith(expect.any(String),expect.any(Object)));expect(m.request.mock.calls.some(([,o])=>o?.body?.operationalStatus==='SUSPENDED'&&o?.body?.expectedVersion===4)).toBe(true);
});
it('inactive legacy reactivation unavailable rather than restoring a deleted account',async()=>{
 detail.company.isActive=false;detail.company.operationalStatus='SUSPENDED';mount('/platform/companies/42');expect(await screen.findByRole('button',{name:'Reactivate company'})).toBeDisabled();expect(screen.getByText(/inactive legacy account requires review/)).toBeInTheDocument();
});
it.each([403,503])('denied/unavailable %s does not fabricate empty company data; retry is real',async status=>{
 m.request.mockRejectedValue({response:{status},message:'PRIVATE SQL'});mount();await screen.findByRole('alert');expect(screen.queryByText('PRIVATE SQL')).not.toBeInTheDocument();expect(screen.queryByText('No companies match these filters.')).not.toBeInTheDocument();const count=m.request.mock.calls.length;fireEvent.click(screen.getByRole('button',{name:'Retry'}));await waitFor(()=>expect(m.request.mock.calls.length).toBeGreaterThan(count));
});
it('empty scoped result has distinct feedback',async()=>{m.request.mockResolvedValue({data:{items:[],nextCursor:null}});mount();await screen.findByText('No companies match these filters.');expect(screen.queryByRole('button',{name:'Next page'})).not.toBeInTheDocument();});
it('company workspace supports Urdu and RTL',async()=>{mount('/platform/companies/42',false,'ur');await screen.findByRole('heading',{name:'پلیٹ فارم کی کمپنیاں'});expect(document.documentElement.dir).toBe('rtl');expect(await screen.findByRole('button',{name:'کمپنی معطل کریں'})).toBeInTheDocument();});
