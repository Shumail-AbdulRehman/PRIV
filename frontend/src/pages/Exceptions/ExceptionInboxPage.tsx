import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Camera, CheckCircle2, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import type { RootState } from '@/store/store';
import { client } from '@/api/client';
import { useLanguage } from '@/i18n/context';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/common/Pagination';
import OperationsState from '../Manager/OperationsState';
import { localTime } from '../Manager/operations';
import { useAreas } from '../Area/queries';
import { plainReason } from '../Verification/presentation';
import ReviewDetail from './ReviewDetail';
import type { VerificationException } from './types';
import './review-workspace.css';

type ReviewPage = {
  cases: VerificationException[]; page:number; pageSize:number; total:number; totalPages:number;
  locations:Array<{id:number;name:string;timezone:string}>; queueCounts:Record<string,number>;
};
const FILTERS=['locationId','areaId','queue','period','date','q','page','pageSize','reasonCode'];
const QUEUES=[['needs-me','Pending'],['resolved','Reviewed'],['staff','Waiting for staff'],['service','Checks pending']];
export default function ExceptionInboxPage() {
  const {t}=useLanguage();
  const user=useSelector((s:RootState)=>s.auth.user);
  const scope=`${user?.companyId}:${user?.role}:${user?.id}`;
  const [params]=useSearchParams();
  const navigate=useNavigate();
  const location=useLocation();
  const rawId=useParams().id;
  const id=rawId ? Number(rawId) : undefined;
  const returnValue=params.get('returnTo');
  const source=rawId && returnValue?.startsWith('/exceptions?')
    ? new URLSearchParams(returnValue.slice('/exceptions?'.length)) : params;
  const filters=Object.fromEntries(FILTERS.map(k=>[k,source.get(k)??'']).filter(([,v])=>v));
  filters.queue??=source.get('state')==='RESOLVED'?'resolved':source.get('state')==='WAITING_SERVICE'?'service':source.get('state')==='STAFF_ACTION_REQUIRED'?'staff':'needs-me';
  filters.page??='1';
  const search=useDebouncedValue(filters.q??'');
  const applied={...filters,q:search};
  const query=useQuery({
    queryKey:['review-page',scope,applied],
    queryFn:async({signal})=>(await client.get<{data:ReviewPage}>('/verification-exceptions',{params:applied,signal})).data.data,
    refetchInterval:30000,refetchOnWindowFocus:true,
  });
  const data=query.isError?undefined:query.data;
  const areas=useAreas(Number(filters.locationId));
  const returnTo='/exceptions?'+new URLSearchParams(filters);
  function update(values:Record<string,string>) {
    const next=new URLSearchParams(filters);
    for(const [key,value]of Object.entries(values)) { if(value)next.set(key,value);else next.delete(key); }
    if(!('page' in values))next.delete('page');
    if('locationId' in values)next.delete('areaId');
    navigate('/exceptions?'+next,{preventScrollReset:true});
  }
  if(rawId && (!Number.isSafeInteger(id)||!id||id<1))return <p role="alert">{t('Review unavailable.')}</p>;
  return <div className={'v5-review-page'+(id?' v5-review-selected':'')}>
    <header className="ops-header">
      <div><h1>{t('Photo Reviews')}</h1><p>{t('The evidence, the context, and a clear next decision.')}</p></div>
      {data?.queueCounts&&<div className="review-counts"><span>{data.queueCounts['needs-me']??0} {t('pending')}</span><span>{data.queueCounts.resolved??0} {t('reviewed')}</span></div>}
    </header>
    <ReviewFilters filters={filters} locations={data?.locations??[]} areas={areas.data??[]} onUpdate={update}/>
    <ReviewPanels key={scope+JSON.stringify(applied)} data={query.isError?undefined:data} selectedId={id} returnTo={returnTo}
      filters={filters} onUpdate={update} loading={query.isPending} error={query.error} retry={()=>void query.refetch()}
      returnState={location.state as {scrollY?:number;focusId?:number}|null}/>

  </div>;
}

// Shared queue and detail routes mount this same component so selected evidence and
// saved decisions stay in one workspace. A closed selection stays visible until next.
type UpdateFilters=(values:Record<string,string>)=>void;
function ReviewPanels({data,selectedId,returnTo,filters,onUpdate,loading,error,retry,returnState}:{
  data?:ReviewPage;selectedId?:number;returnTo:string;filters:Record<string,string>;onUpdate:UpdateFilters;
  loading:boolean;error:unknown;retry:()=>void;returnState:{scrollY?:number;focusId?:number}|null;
}) {
  const {t,language}=useLanguage();
  const [initialId,setInitialId]=useState<number|undefined>(()=>data?.cases?.[0]?.id);
  if(initialId===undefined&&data?.cases?.[0])setInitialId(data.cases[0].id);
  const id=selectedId??initialId;
  return <div className="v5-review-grid">
    <section className="v5-review-queue" aria-label={t('Review queue')}>
      <div className="v5-queue-top">
        <div className="v5-queue-tabs" role="group" aria-label={t('Review queues')}>
          {QUEUES.slice(0,2).map(([value,label])=><button type="button" key={value} aria-pressed={filters.queue===value} onClick={()=>onUpdate({queue:value})}>{t(label)}{data?.queueCounts?.[value]!==undefined&&<span>{data.queueCounts[value]}</span>}</button>)}
        </div>
        <label className="v5-queue-search"><Search size={16} aria-hidden="true"/><Input aria-label={t('Find a review')} placeholder={t('Search task, staff or site…')} value={filters.q??''} onChange={event=>onUpdate({q:event.target.value})}/></label>
      </div>
      <OperationsState loading={loading} error={error} retry={retry}/>
      {data&&!error&&<div className="v5-queue-meta"><span>{t('{count} reviews',{count:data.total})}</span><span>{t('Priority, then oldest first')}</span></div>}
    <div className="v5-queue-records">
      {data?.cases?.map(record=>{
        const reason=record.displayReasonCode??record.issues.find(issue=>issue.state!=='RESOLVED')?.reasonCode??(record.kind==='SETUP'?'SETUP_REQUIRED':'REVIEW_REQUIRED');
        return <Link key={record.id} className="v5-queue-record" data-review-id={record.id} aria-current={id===record.id?'true':undefined}
          to={`/exceptions/${record.id}?returnTo=${encodeURIComponent(returnTo)}`}
          state={{returnTo,focusId:record.id,scrollY:window.scrollY}} preventScrollReset>
          <h2><bdi>{record.area?.name??record.task?.areaNameSnapshot??record.task?.title??t('Room setup')}</bdi></h2>
          {record.kind!=='SETUP'&&<p><bdi>{record.task?.staff?.name??t('Unassigned')}</bdi></p>}
          <p className="v5-queue-site"><MapPin size={13} aria-hidden="true"/><bdi>{record.location?.name}</bdi></p>
          <strong className={"v5-queue-reason"+(record.state==='RESOLVED'?' v5-queue-handled':'')}><Camera size={14} aria-hidden="true"/>{t(record.state==='RESOLVED'?'Review handled':plainReason(reason))}</strong>
          <div className="v5-queue-lifecycle"><span>{t(record.kind==='SETUP'?'No task generated':!record.task?'Task submission information unavailable':record.task.staffSubmittedAt?'Task submitted':'Task not submitted')}</span><span>{t(record.state==='RESOLVED'?'Review closed':'Review pending')}</span></div>
          <small><bdi>{localTime(record.updatedAt,record.location?.timezone??'Asia/Karachi',language,true)}</bdi></small>
        </Link>;
      })}
      {data&&!data.cases?.length&&!error&&<div className="v5-review-empty"><CheckCircle2 size={25} aria-hidden="true"/><h2>{t('No matching reviews')}</h2><p>{t('Try another filter or search.')}</p></div>}
    </div>
    {data&&!error&&<Pagination page={data.page} pageSize={data.pageSize} total={data.total} totalPages={data.totalPages} onPage={value=>onUpdate({page:String(value)})} onSize={value=>onUpdate({pageSize:String(value)})}/>}
    </section>
    <div className="v5-review-detail">
      {id ? <ReviewDetail key={id} id={id} backTo={returnTo} returnState={returnState}/>
        : <div className="ops-panel v5-review-empty"><Camera size={30} aria-hidden="true"/><h2>{t('Select a review')}</h2><p>{t('Choose a task from the queue to inspect its evidence and record a decision.')}</p></div>}
    </div>
  </div>;
}

function ReviewFilters({filters,locations,areas,onUpdate}:{filters:Record<string,string>;locations:ReviewPage['locations'];areas:Array<{id:number;name:string}>;onUpdate:UpdateFilters}) {
 const {t}=useLanguage();
 return <div className="v5-review-filters">
  <label>{t('Location')}<select value={filters.locationId??''} onChange={event=>onUpdate({locationId:event.target.value})}><option value="">{t('All locations')}</option>{locations.map(site=><option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
  <label>{t('Period')}<select value={filters.period??'all'} onChange={event=>onUpdate({period:event.target.value})}>{[['all','All dates'],['today','Today'],['earlier','Earlier work'],['date','Specific date']].map(([value,label])=><option key={value} value={value}>{t(label)}</option>)}</select></label>
  {filters.period==='date'&&<label>{t('Local date')}<Input type="date" value={filters.date==='today'?'':filters.date??''} onChange={event=>onUpdate({date:event.target.value})}/></label>}
  <details className="v5-review-more"><summary><SlidersHorizontal size={16} aria-hidden="true"/>{t('Review filters')}</summary><div>
   <label>{t('Review reason')}<select value={filters.reasonCode??''} onChange={event=>onUpdate({reasonCode:event.target.value})}><option value="">{t('All reasons')}</option>{['SERVICE_FAILURE','MISSING_EVIDENCE','CANNOT_ASSESS','PRIVACY_HOLD','CLEANING_REQUIRED','WRONG_ITEM'].map(reason=><option key={reason} value={reason}>{t(plainReason(reason))}</option>)}</select></label>
   <label>{t('Area')}<select value={filters.areaId??''} disabled={!filters.locationId} onChange={event=>onUpdate({areaId:event.target.value})}><option value="">{t('All areas')}</option>{areas.map(area=><option key={area.id} value={area.id}>{area.name}</option>)}</select></label>
   <label>{t('Review queue')}<select value={filters.queue} onChange={event=>onUpdate({queue:event.target.value})}>{QUEUES.map(([value,label])=><option value={value} key={value}>{t(label)}</option>)}</select></label>
   <button type="button" onClick={()=>onUpdate(Object.fromEntries(FILTERS.filter(key=>key!=='queue').map(key=>[key,''])))}>{t('Clear filters')}</button>
  </div></details>
 </div>;
}
