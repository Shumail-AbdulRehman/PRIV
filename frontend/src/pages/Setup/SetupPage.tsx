import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ArrowRight, RefreshCw } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import OperationsState from '../Manager/OperationsState';
import { getBillingLifecycle } from '../Subscription/api';
import { getSetupReadiness } from './api';
import './setup.css';

function errorStatus(error:unknown) {return (error as {response?:{status?:number}})?.response?.status;}
export default function SetupPage() {
 const {user}=useAuth();const {t,language}=useLanguage();const [params,setParams]=useSearchParams();
 const owner=user?.role==='ADMIN',operational=owner||user?.role==='MANAGER';
 const cursor=Number(params.get('afterId')??0),afterId=Number.isSafeInteger(cursor)&&cursor>=0?cursor:0;
 const scope=[user?.companyId,user?.role,user?.id];
 const readiness=useQuery({queryKey:['setup-readiness',...scope,afterId],queryFn:({signal})=>getSetupReadiness(afterId,signal),enabled:operational,staleTime:0,refetchOnMount:'always',refetchOnWindowFocus:true,refetchOnReconnect:true});
 const billing=useQuery({queryKey:['billing-lifecycle',...scope],queryFn:({signal})=>getBillingLifecycle(signal),enabled:owner,staleTime:0});
 const data=readiness.isError?undefined:readiness.data;
 const selected=data?.sites.find(site=>String(site.id)===params.get('site'))??data?.sites[0];
 const canManage=data?.access?.manageWork===true;
 const siteLink=selected?`/locations/${selected.id}`:'/locations';
 const teamLink=selected?`/staff?locationId=${selected.id}`:'/staff';
 const steps=[
  {id:'location',title:'Create a location',description:'Set the site name, timezone and check-in area.',done:!!selected,href:selected?siteLink:'/locations?create=1',action:selected?'Review location':'Add location',allowed:!!selected||(owner&&canManage)},
  {id:'team',title:'Add staff and a shift',description:'Assign staff to this location and confirm their working hours.',done:!!selected&&selected.counts.staffWithShift>0,href:teamLink,action:'Open team and shifts',allowed:!!selected},
  {id:'area',title:'Prepare an area template',description:'Name the fixtures and required photo views.',done:!!selected&&selected.counts.activeAreas>0,href:siteLink+'?tab=areas'+(selected?.counts.activeAreas?'':'&newArea=1'),action:selected?.counts.activeAreas?'Review area templates':'Add area template',allowed:!!selected},
  {id:'schedule',title:'Create the first schedule',description:'Use the existing daily or one-time schedule.',done:!!selected&&selected.counts.readySchedules>0,href:siteLink+'?tab=templates'+(selected?.counts.readySchedules?'':'&newSchedule=1'),action:selected?.counts.readySchedules?'Review cleaning schedules':'Add cleaning schedule',allowed:!!selected&&selected.counts.staffWithShift>0&&selected.counts.activeAreas>0},
 ];
 const completed=steps.filter(step=>step.done).length,next=steps.findIndex(step=>!step.done);
 const changePage=(value:number)=>setParams(previous=>{const result=new URLSearchParams(previous);result.set('afterId',String(value));result.delete('site');return result;});
 let refreshed='';
 if(selected&&data&&Number.isFinite(Date.parse(data.asOf)))refreshed=new Intl.DateTimeFormat(language==='ur'?'ur-PK':'en-PK',{timeZone:selected.timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(data.asOf));
 if(!operational)return <p role="alert">{t('Owner or assigned-site manager access is required.')}</p>;
 return <div className="ops-page setup-page">
  <PageHeader title={owner?'Get your company ready':'Prepare your assigned locations'} subtitle="A short path from a new location to the first working shift." action={<Button asChild variant="outline"><Link to="/dashboard">{t('Open overview')}</Link></Button>}/>
  <div className="setup-layout">
   <section className="ops-panel setup-checklist" aria-labelledby="setup-heading">
    <div className="setup-heading-row"><div><h2 id="setup-heading">{t('Your setup checklist')}</h2><p>{t('Progress comes from saved locations, staff shifts, areas and schedules.')}</p></div><Button variant="outline" disabled={readiness.isFetching} onClick={()=>void readiness.refetch()}><RefreshCw size={16} aria-hidden="true"/>{t('Refresh status')}</Button></div>
    {readiness.isPending?<div role="status" className="setup-loading"><p>{t('Loading setup status…')}</p><OperationsState loading/></div>:null}
    {readiness.isError?<div className="setup-notice" role="alert"><h3>{t(errorStatus(readiness.error)===403?'Setup access is restricted':'Setup status could not load')}</h3><p>{t(errorStatus(readiness.error)===403?'Ask your company owner about workspace access. Existing account security and owner billing remain available.':'Check your connection and refresh. Your saved setup has not changed.')}</p><Button variant="outline" onClick={()=>void readiness.refetch()}>{t('Try again')}</Button></div>:null}
    {data?<>
     {!canManage?<p id="setup-access-note" role="status" className="setup-notice">{t(data.access?.manageWork!==false?'New-work access is unavailable':owner?'This workspace is read-only for new work. Review plan activation to add or change setup.':'This workspace is read-only for new work. Ask your company owner to review plan activation.')}</p>:null}
     {selected?<div className="setup-site"><label htmlFor="setup-site">{t('Setup for location')}</label><select id="setup-site" value={selected.id} onChange={event=>setParams(previous=>{const result=new URLSearchParams(previous);result.set('site',event.target.value);return result;})}>{data.sites.map(site=><option key={site.id} value={site.id}>{site.name}</option>)}</select><p><bdi>{selected.timezone}</bdi>{refreshed?<> · {t('Checked')} <bdi>{refreshed}</bdi></>:null}</p></div>:<div className="setup-notice"><h3>{t(data.totalLocations?'No locations on this page':owner?'No locations yet':'No assigned locations yet')}</h3><p>{t(data.totalLocations?'Return to the first page to choose a location.':owner?'Create a location to begin. Nothing is marked complete until it is saved.':'Ask your owner to assign a location before setting up its team or schedules.')}</p></div>}
     {(selected||!data.totalLocations)?<>
      <div className="setup-progress"><div><span>{t('Saved setup for this location')}</span><strong><span>{t('{count} of 4 configured',{count:completed})}</span> · {completed*25}%</strong></div><progress max={4} value={completed} aria-label={t('Saved setup for this location')}/></div>
      <ol className="setup-task-list">{steps.map((step,index)=>{
       const mutation=!step.done&&step.id!=='team',available=step.allowed&&(!mutation||canManage);
       return <li key={step.id}><span className={'setup-step-number'+(step.done?' is-complete':'')} aria-hidden="true">{step.done?<Check size={18}/>:index+1}</span><div className="setup-step-copy"><h3>{t(step.title)}</h3><p>{t(step.description)}</p><span className={step.done?'setup-complete':'setup-incomplete'}>{t(step.done?'Configured':'Not configured')}</span>{step.id==='team'&&selected&&!step.done?<p>{t('Use Edit on an existing team member to add their shift.')}</p>:null}{step.id==='schedule'&&!step.allowed?<p>{t('Prepare an area template and a staff shift first.')}</p>:null}</div>{available?<Button asChild variant={index===next&&canManage?'default':'outline'}><Link to={step.href}>{t(step.action)}<ArrowRight size={16} aria-hidden="true"/></Link></Button>:<Button disabled variant="outline" aria-describedby={!canManage?'setup-access-note':undefined}>{t(step.action)}</Button>}</li>;
      })}</ol>
      {selected&&completed===4?<p className="setup-ready" role="status">{t('Setup is configured for this location. Open Today to inspect its work.')}</p>:null}
      {selected?<div className="setup-followup"><Button asChild variant="outline"><Link to={`/today-status?locationId=${selected.id}&date=today`}>{t('Open Today')}</Link></Button>{canManage?<Button asChild variant="ghost"><Link to={teamLink+'&create=1'}>{t('Add staff')}</Link></Button>:null}</div>:null}
     </>:null}
     <div className="setup-pagination"><span>{t('Showing {count} of {total} locations',{count:data.sites.length,total:data.totalLocations})}</span><div>{afterId>0?<Button variant="outline" onClick={()=>changePage(0)}>{t('First locations')}</Button>:null}{data.nextCursor!==null?<Button variant="outline" onClick={()=>changePage(data.nextCursor!)}>{t('More locations')}</Button>:null}</div></div>
    </>:null}
   </section>
   <aside className="setup-aside" aria-label={t('Setup guidance')}>
    {owner?<section className="ops-panel setup-guidance"><h2>{t('Account readiness')}</h2>{billing.isPending?<p role="status">{t('Checking account readiness…')}</p>:billing.isError?<div role="alert"><p>{t('Account readiness could not load. Setup progress is shown separately.')}</p><Button variant="outline" onClick={()=>void billing.refetch()}>{t('Try again')}</Button></div>:billing.data?<><dl><dt>{t('Owner email')}</dt><dd>{t(billing.data.ownerVerified?'Verified':'Not verified')}</dd><dt>{t('Plan activation')}</dt><dd>{t(readiness.isPending?'Checking new-work access…':typeof data?.access?.manageWork!=='boolean'?'New-work access is unavailable':canManage?'New work is available':'Review plan activation')}</dd></dl>{!billing.data.ownerVerified?<p>{t('Verify your email before activating a new plan.')}</p>:null}{!billing.data.billingConfigured?<p>{t('Billing service is currently unavailable. Existing records remain saved.')}</p>:null}<div className="setup-guidance-links"><Link to="/settings">{t('Account settings')}</Link><Link to="/subscription">{t('Plan & billing')}</Link></div></>:null}</section>:null}
    <section className="ops-panel setup-guidance"><h2>{t('Before the first shift')}</h2><p>{t('Daily schedules include every day, including weekends. Dates and times follow each location’s timezone.')}</p><p>{t('Each task QR belongs to a generated task. A room code cannot start another task.')}</p><p>{t('Use only the approved Android app link shared by your company owner.')}</p></section>
    {selected&&selected.counts.unassignedTasksToday>0?<section className="ops-panel setup-guidance"><h2>{t('Unassigned work')}</h2><p>{t('{count} tasks have no assigned worker.',{count:selected.counts.unassignedTasksToday})}</p><p>{t(selected.counts.staffWithShift?'Check staff availability and the cleaning schedule. A replacement is not guaranteed.':'No staff shift is configured for this location. Add or update a shift before assigning work.')}</p><Link to={`/today-status?locationId=${selected.id}&date=today&tab=tasks&status=unassigned`}>{t('Review unassigned tasks')}</Link><Link to={teamLink}>{t('Open team and shifts')}</Link></section>:null}
   </aside>
  </div>
 </div>;
}
