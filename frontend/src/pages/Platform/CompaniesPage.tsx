import {useRef,useState} from 'react';
import {Link,useParams,useSearchParams} from 'react-router-dom';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useLanguage} from '@/i18n/context';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import DataTable from '@/components/common/DataTable';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {OperatorBoundary,OperatorShell} from './OperatorLogin';
import {operatorQueryScope} from './operatorSession';
import {getCompanies,getCompany,setCompanyStatus,type CompanySummary} from './companyApi';
import './companies.css';

export default function CompaniesPage(){return <OperatorBoundary><CompanyWorkspace/></OperatorBoundary>;}
/** Only mounted by OperatorBoundary after a real provider adapter is qualified. */
export function CompanyWorkspace(){const {companyId}=useParams();return <CompanyContent key={companyId??'list'}/>;}
function CompanyContent(){
 const {t,language}=useLanguage();const {companyId}=useParams();const [params,setParams]=useSearchParams();const qc=useQueryClient();
 const [search,setSearch]=useState(params.get('q')??'');const [status,setStatus]=useState(params.get('status')??'');
 const [target,setTarget]=useState<'ACTIVE'|'SUSPENDED'>('SUSPENDED');
 const [tab,setTab]=useState('account'),[open,setOpen]=useState(false),[reason,setReason]=useState(''),[version,setVersion]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState('');const lock=useRef(false);
 const id=companyId&&/^[1-9]\d*$/.test(companyId)?Number(companyId):null;
 const list=useQuery({queryKey:[...operatorQueryScope,'companies',params.toString()],queryFn:({signal})=>getCompanies({q:params.get('q')??undefined,status:params.get('status')??undefined,after:params.get('after')??undefined},signal),enabled:!companyId,retry:false});
 const detail=useQuery({queryKey:[...operatorQueryScope,'company',id],queryFn:({signal})=>getCompany(id!,signal),enabled:!!id,retry:false});
 const current=detail.data;
 const stamp=(value:string|null|undefined)=>value&&Number.isFinite(Date.parse(value))?<time dateTime={value}>{new Date(value).toLocaleString(language==='ur'?'ur-PK':'en-PK')}</time>:t('Not available');
 const fail=(e:unknown)=>{const code=(e as {response?:{status?:number};status?:number})?.response?.status??(e as {status?:number})?.status;return code===403||code===401?'Platform access denied. Sign in with a provisioned operator account.':code===404?'Company account not found.':'Company records are unavailable. Retry the scoped request.';};
 async function save(event:React.FormEvent){
  event.preventDefault();if(lock.current||!current||!reason.trim())return;lock.current=true;setBusy(true);setError('');
  try{await setCompanyStatus(current.company.id,{operationalStatus:target,expectedVersion:version,reason:reason.trim()});setOpen(false);setReason('');setSaved('Company status saved. Billing entitlement is unchanged.');await qc.invalidateQueries({queryKey:operatorQueryScope});}
  catch(e){const code=(e as {response?:{status?:number};status?:number})?.response?.status??(e as {status?:number})?.status;setError(code===409?'The company changed or needs legacy account review. Refresh before saving. Your reason is kept.':'The status change could not be confirmed. Refresh the account before retrying. Your reason is kept.');}
  finally{lock.current=false;setBusy(false);}
 }
 const activeQuery=companyId?detail:list;
 return <OperatorShell title={t('Platform companies')}><div className="platform-company-workspace ops-page">
  <nav className="platform-company-links" aria-label={t('Platform navigation')}><Link to="/platform/companies">{t('Companies')}</Link><Link to="/platform/service">{t('Platform service')}</Link><Link to="/platform/security">{t('Platform security')}</Link></nav>
  {saved?<p role="status" className="ops-save-result">{t(saved)}</p>:null}
  {companyId&&!id?<p role="alert">{t('Company account not found.')}</p>:null}
  {activeQuery.isFetching?<p role="status">{t('Loading company records…')}</p>:null}
  {activeQuery.isError?<div role="alert"><p>{t(fail(activeQuery.error))}</p><Button onClick={()=>void activeQuery.refetch()}>{t('Retry')}</Button></div>:null}
  {!companyId?<>
   <form className="platform-company-filters" onSubmit={e=>{e.preventDefault();setParams({...(search.trim()?{q:search.trim()}:{}),...(status?{status}:{})});}}>
    <label>{t('Search companies')}<Input maxLength={100} value={search} onChange={e=>setSearch(e.target.value)}/></label>
    <label>{t('Operational status')}<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">{t('All statuses')}</option><option value="ACTIVE">{t('Active')}</option><option value="SUSPENDED">{t('Suspended')}</option></select></label><Button type="submit">{t('Apply filters')}</Button>
   </form>
   {list.data&&!list.isError?<><DataTable data={list.data.items} rowKey={r=>r.id} pageSize={25} emptyMessage={t('No companies match these filters.')} columns={[
    {key:'name',header:t('Company'),render:r=><Link to={`/platform/companies/${r.id}`}>{r.name}</Link>},
    {key:'plan',header:t('Capacity plan'),render:r=><bdi>{r.plan}</bdi>},
    {key:'status',header:t('Operational status'),render:r=>t(r.operationalStatus==='ACTIVE'?'Active':'Suspended')},
    {key:'version',header:t('Account version'),render:r=>r.accountVersion},
   ]}/><div className="platform-company-links">{params.get('after')?<Button variant="outline" onClick={()=>setParams(p=>{const next=new URLSearchParams(p);next.delete('after');return next;})}>{t('First page')}</Button>:null}{list.data.nextCursor?<Button variant="outline" onClick={()=>setParams(p=>{const next=new URLSearchParams(p);next.set('after',list.data.nextCursor!);return next;})}>{t('Next page')}</Button>:null}</div></>:null}
  </>:current&&!detail.isError?<>
   <h2>{current.company.name}</h2>
   <div className="platform-company-links" role="group" aria-label={t('Company sections')}>{['account','billing','activity'].map(value=><Button key={value} variant={tab===value?'default':'outline'} aria-pressed={tab===value} onClick={()=>setTab(value)}>{t({account:'Account',billing:'Billing',activity:'Activity'}[value]!)}</Button>)}</div>
   {tab==='account'?<section className="ops-panel ops-panel-body"><dl className="platform-company-facts"><div><dt>{t('Operational status')}</dt><dd>{t(current.company.operationalStatus==='ACTIVE'?'Active':'Suspended')}</dd></div><div><dt>{t('Capacity plan')}</dt><dd><bdi>{current.company.plan}</bdi></dd></div><div><dt>{t('Operational reads')}</dt><dd>{t(current.operationalReadAllowed?'Allowed':'Restricted')}</dd></div><div><dt>{t('Account version')}</dt><dd>{current.company.accountVersion}</dd></div><div><dt>{t('Suspended at')}</dt><dd>{stamp(current.company.suspendedAt)}</dd></div><div><dt>{t('Suspension reason')}</dt><dd>{current.company.suspensionReason??t('Not recorded')}</dd></div></dl>
    <p>{t('Suspension restricts company operations. Reactivation does not grant paid entitlement or change billing. Historical records are preserved.')}</p>
    {!current.company.isActive?<p role="status">{t('This inactive legacy account requires review before reactivation.')}</p>:null}
    <Button disabled={!current.company.isActive&&current.company.operationalStatus==='SUSPENDED'} variant="outline" onClick={()=>{setOpen(true);setError('');setVersion(current.company.accountVersion);setTarget(current.company.operationalStatus==='ACTIVE'?'SUSPENDED':'ACTIVE');}}>{t(current.company.operationalStatus==='ACTIVE'?'Suspend company':'Reactivate company')}</Button>
   </section>:tab==='billing'?<section className="ops-panel ops-panel-body"><h3>{t('Mirrored billing metadata')}</h3><dl className="platform-company-facts"><div><dt>{t('Provider state')}</dt><dd><bdi>{current.providerState}</bdi></dd></div><div><dt>{t('Provider subscription status')}</dt><dd><bdi>{current.subscription?.status??t('Not available')}</bdi></dd></div><div><dt>{t('Billing period starts')}</dt><dd>{stamp(current.subscription?.periodStart)}</dd></div><div><dt>{t('Billing period ends')}</dt><dd>{stamp(current.subscription?.periodEnd)}</dd></div><div><dt>{t('Last provider event')}</dt><dd>{stamp(current.subscription?.lastEventAt)}</dd></div><div><dt>{t('Scheduled change')}</dt><dd><bdi>{current.subscription?.scheduledChangeAction??t('Not recorded')}</bdi> · {stamp(current.subscription?.scheduledChangeAt)}</dd></div></dl><p>{t('Metadata does not authorize payment overrides, impersonation or tenant workforce access.')}</p></section>:<section className="ops-panel ops-panel-body"><h3>{t('Administrative activity')}</h3>{current.activity.length?<ol>{current.activity.map(row=><li key={row.id}><strong>{t(row.action==='COMPANY_SUSPENDED'?'Company suspended':row.action==='COMPANY_REACTIVATED'?'Company reactivated':row.action)}</strong> · {stamp(row.createdAt)}<p>{row.reason??t('Not recorded')}</p></li>)}</ol>:<p>{t('No platform status changes recorded.')}</p>}</section>}
   <Dialog open={open} onOpenChange={value=>{if(!busy)setOpen(value);}}><DialogContent className="workspace platform-company-dialog" showCloseButton={!busy} onInteractOutside={e=>{if(busy)e.preventDefault();}} onEscapeKeyDown={e=>{if(busy)e.preventDefault();}}><DialogTitle>{t(target==='SUSPENDED'?'Confirm suspension':'Confirm reactivation')}</DialogTitle><DialogDescription>{current.company.name} · {t('This changes operational access only. It does not mark the company paid or delete its records.')}</DialogDescription><form className="space-y-4" onSubmit={save}><label className="block">{t('Reason')}<Input required maxLength={500} value={reason} disabled={busy} onChange={e=>setReason(e.target.value)}/></label>{error?<p role="alert">{t(error)}</p>:null}<div className="platform-company-links"><Button type="button" variant="outline" disabled={busy} onClick={()=>setOpen(false)}>{t('Cancel')}</Button>{error?<Button type="button" variant="outline" disabled={busy||detail.isFetching} onClick={async()=>{const result=await detail.refetch();if(result.data&&!result.isError)setVersion(result.data.company.accountVersion);}}>{t('Refresh company')}</Button>:null}<Button type="submit" disabled={busy||!reason.trim()}>{t(busy?'Saving…':'Confirm status change')}</Button></div></form></DialogContent></Dialog>
  </>:null}
 </div></OperatorShell>;
}
export type {CompanySummary};
