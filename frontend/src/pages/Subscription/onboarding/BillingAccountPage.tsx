import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { getCurrentUser } from '@/api/auth';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { getBillingLifecycle, navigateToBillingPortal, prepareBillingPortal } from '../api';
import { useBillingCatalog, useBillingLifecycle } from '../queries';
import { deriveBillingViewState } from './billingViewState';
import { formatBillingPrice } from './billingPrice';
import BillingSetupLayout from './BillingSetupLayout';

export default function BillingAccountPage() {
 const {user}=useAuth();const {t}=useLanguage();
 if(user?.role!=='ADMIN')return <BillingSetupLayout variant="settings"><h1>{t('Plan & billing')}</h1><p role="alert">{t('Only the company owner can view or change billing.')}</p><Link to="/login">{t('Sign in again')}</Link></BillingSetupLayout>;
 return <OwnerAccount key={`${user.companyId}:${user.id}`} companyId={user.companyId} ownerId={user.id}/>;
}
function OwnerAccount({companyId,ownerId}:{companyId:number;ownerId:number}) {
 const {t,language}=useLanguage();const query=useBillingLifecycle(),catalog=useBillingCatalog();const [opening,setOpening]=useState(false),[error,setError]=useState(false);
 const session=useRef<{active:boolean;busy:boolean;controller:AbortController}|null>(null);
 useLayoutEffect(()=>{const current={active:true,busy:false,controller:new AbortController()};session.current=current;return()=>{current.active=false;current.controller.abort();};},[]);
 const view=deriveBillingViewState({owner:{companyId,ownerId},dataOwner:query.dataOwner,data:query.data,read:query.isPending?'loading':query.isError?'error':query.isFetching?'stale':'fresh',httpStatus:(query.error as {response?:{status?:number}}|null)?.response?.status});
 const data=view.data,sub=data?.subscription;
 const matches=catalog.data?.filter(row=>sub?.priceId===row.priceId&&sub?.interval===row.interval&&sub?.plan===row.plan)??[];
 const entry=matches.length===1&&!catalog.isError&&!catalog.isFetching?matches[0]:null;
 const price=entry?formatBillingPrice(entry.amount,entry.currencyCode,entry.interval,language==='ur'?'ur-PK':'en-PK'):null;
 const date=(value:string|null|undefined)=>value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat(language==='ur'?'ur-PK':'en-PK',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(value)):t('Not available');
 const openPortal=async()=>{
  const current=session.current;if(!current?.active||current.busy||!view.canOpenPortal||query.isFetching)return;
  current.busy=true;setOpening(true);setError(false);
  const verify=async()=>{const actor=await getCurrentUser();if(!current.active||actor?.role!=='ADMIN'||actor.companyId!==companyId||actor.id!==ownerId)throw new Error('Account changed');};
  try{
   await verify();const facts=await getBillingLifecycle(current.controller.signal,companyId);
   if(!current.active||!facts.portalAvailable)throw new Error('Unavailable');
   await verify();const portal=await prepareBillingPortal(current.controller.signal);await verify();
   if(current.active)navigateToBillingPortal(portal.url);
  }catch{if(current.active)setError(true);}finally{current.busy=false;if(current.active)setOpening(false);}
 };
 const statuses:Record<string,string>={active:'Active',trialing:'Trialing',past_due:'Past due',paused:'Paused',canceled:'Canceled'};
 return <BillingSetupLayout variant="settings">
  <header style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:20}}><h1>{t('Plan & billing')}</h1><Button variant="outline" disabled={query.isFetching} onClick={()=>void query.refreshBilling()}>{t('Refresh status')}</Button></header>
  {!data?<p role={query.isError?'alert':'status'} style={{marginBlockStart:24}}>{t(query.isPending?'Checking subscription status…':'Billing is temporarily unavailable. Refresh status to try again.')}</p>:<>
   {view.kind==='restricted'?<p role="status" style={{marginBlockStart:24}}>{t('Company operations are restricted. Billing and account security remain available.')}</p>:null}
   <section aria-labelledby="current-subscription" style={{marginBlockStart:32,paddingBlock:24,borderBlock:'1px solid var(--billing-line)'}}>
    <h2 id="current-subscription">{t('Your subscription')}</h2>
    <dl className="billing-account-facts" style={{display:'grid',gap:20,marginBlock:24}}>
     {[[t('Current plan'),t((sub?.plan??data.company.plan)==='ADVANCED'?'Enterprise':sub?.plan??data.company.plan)], [t('Provider subscription status'),t(sub?statuses[sub.status]??'Unknown':'No linked subscription record')], [t('Recurring price'),price?<><bdi dir="ltr">{price.formatted}</bdi> · {t(entry?.interval==='year'?'Yearly':'Monthly')}</>:t('Provider price unavailable')], [t('Next billing date'),sub?.scheduledChangeAction?t('Not available'):['active','trialing'].includes(sub?.status??'')?date(sub?.periodEnd):t('Not available')], [t('Scheduled change'),sub?.scheduledChangeAction?<>{sub.scheduledChangeAction} · <bdi>{date(sub.scheduledChangeAt)}</bdi></>:t('No scheduled change recorded')]].map(([label,value],i)=><div key={i} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))',gap:8}}><dt style={{color:'var(--billing-muted)'}}>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    <p>{t('Your existing subscription is managed in Paddle.')}</p><Button disabled={!view.canOpenPortal||query.isFetching||opening} style={{marginBlockStart:20}} onClick={()=>void openPortal()}>{t(opening?'Opening billing portal…':'Manage in Paddle')}</Button>
    {error?<p role="alert" style={{marginBlockStart:16}}>{t('Billing portal unavailable. Refresh status to try again.')}</p>:null}
   </section>
   <section aria-labelledby="usage-heading" style={{marginBlockStart:32}}><h2 id="usage-heading">{t('Workspace usage')}</h2>
    <div style={{display:'grid',gap:24,marginBlock:24}}>{(['locations','staff','managers'] as const).map(resource=>{const used=data.usage[resource],limit=data.limits[resource];return <div key={resource} style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',gap:12}}><span>{t({locations:'Locations',staff:'Staff seats',managers:'Manager seats'}[resource])}</span><bdi dir="ltr">{used} / {limit}</bdi><span aria-hidden="true" style={{width:'100%',gridColumn:'1 / -1',height:4,background:'var(--billing-line)',overflow:'hidden'}}><span style={{display:'block',height:'100%',width:`${Math.min(100,used/Math.max(1,limit)*100)}%`,background:'var(--billing-blue)'}}/></span>{used>limit?<span>{t('Over limit')}</span>:null}</div>;})}</div>
    <p style={{color:'var(--billing-muted)',fontSize:13}}>{t('The company owner uses one manager seat.')}</p><p style={{marginBlockStart:12,color:'var(--billing-muted)',fontSize:13}}>{t('Existing records and history are preserved when a limit is exceeded. New capacity is checked by the server.')}</p>
   </section>
  </>}
 </BillingSetupLayout>;
}
