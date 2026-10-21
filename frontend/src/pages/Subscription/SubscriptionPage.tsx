import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { getCurrentUser } from '@/api/auth';
import { getPaddle } from '@/lib/paddle';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { getBillingCatalog, getBillingLifecycle, navigateToBillingPortal, prepareBillingCheckout, prepareBillingPortal } from './api';
import { useBillingLifecycle } from './queries';
import type { BillingCatalogEntry, BillingCheckout } from './types';
import './billing.css';

export default function SubscriptionPage({activationReturn=false}:{activationReturn?:boolean}) {
 const {user}=useAuth(); const {t}=useLanguage(); const [params]=useSearchParams();
 if(user?.role!=='ADMIN')return <div role="alert" className="ops-page">{t('Only the company owner can view or change billing.')} <Link to="/account/security">{t('Your account security')}</Link></div>;
 return <OwnerBilling key={`${user.companyId}:${user.id}`} activationReturn={activationReturn||params.get('activation')==='pending'}/>;
}
function providerPrice(entry:BillingCatalogEntry, language:string) {
 try {
  const format=new Intl.NumberFormat(language==='ur'?'ur-PK':'en-PK',{style:'currency',currency:entry.currencyCode});
  const digits=format.resolvedOptions().maximumFractionDigits;
  const amount=Number(entry.amount);
  return /^\d+$/.test(entry.amount)&&Number.isSafeInteger(amount)?format.format(amount/(10**(digits??2))):null;
 }catch{return null;}
}
function OwnerBilling({activationReturn}:{activationReturn:boolean}) {
 const {user}=useAuth(); const {t,language}=useLanguage(); const query=useBillingLifecycle({poll:true});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[uncertain,setUncertain]=useState(false);
 const [prepared,setPrepared]=useState<(BillingCheckout&{plan:string;interval:string})|null>(null);
 const lock=useRef(false),alive=useRef(true),request=useRef<AbortController|null>(null);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;request.current?.abort();};},[]);
 const data=query.data;
 const linked=data?.providerState==='MIRRORED';
 const catalog=useQuery({queryKey:['billing-catalog',user!.companyId,user!.id],queryFn:({signal})=>getBillingCatalog(signal),enabled:!query.isError&&!!data?.checkoutAvailable&&data.billingConfigured&&!linked&&!data.reconciliationRequired&&!uncertain,retry:false,staleTime:0});
 const refresh=async()=>{
  const result=await query.refetch();
  if(!result.isError&&alive.current){setUncertain(false);setError('');if(result.data?.providerState==='MIRRORED')setPrepared(null);if(result.data?.checkoutAvailable&&result.data.billingConfigured)void catalog.refetch();}
 };
 const act=async(kind:'portal'|'checkout',entry?:BillingCatalogEntry)=>{
  if(lock.current||!data)return;
  lock.current=true;setBusy(true);setError('');const abort=new AbortController();request.current=abort;
  let purchaseRequested=false;
  try{
   const account=await getCurrentUser();
   if(!alive.current)return;
   if(account.role!=='ADMIN'||account.companyId!==user!.companyId||account.id!==user!.id)throw new Error('ACCOUNT_CHANGED');
   const fresh=await getBillingLifecycle(abort.signal);
   if(!alive.current)return;
   if(fresh.company.id!==user!.companyId)throw new Error('ACCOUNT_CHANGED');
   if(kind==='portal'){
    if(!fresh.portalAvailable)throw new Error('PORTAL_UNAVAILABLE');
    const {url}=await prepareBillingPortal(abort.signal);
    if(alive.current)navigateToBillingPortal(url);
   }else{
    if(!entry||!fresh.checkoutAvailable||fresh.providerState==='MIRRORED'||fresh.reconciliationRequired||uncertain)throw new Error('CHECKOUT_UNAVAILABLE');
    const paddle=await getPaddle(); // Missing browser configuration never reserves a purchase.
    if(!alive.current)return;
    let ready=prepared;
    if(!ready){
     purchaseRequested=true;
     const result=await prepareBillingCheckout(entry.plan,entry.interval,abort.signal);
     ready={...result,plan:entry.plan,interval:entry.interval};
     if(alive.current)setPrepared(ready);
    }
    if(ready.plan!==entry.plan||ready.interval!==entry.interval)throw new Error('CHECKOUT_UNAVAILABLE');
    if(!/^txn_[a-z0-9]{26}$/.test(ready.transactionId))throw new Error('CHECKOUT_UNAVAILABLE');
    if(!alive.current)return;
    paddle.Checkout.open({transactionId:ready.transactionId,settings:{displayMode:'overlay',theme:'light',successUrl:new URL('/welcome',window.location.origin).toString()}});
    setNotice('Checkout opened. Activation is confirmed only after provider synchronization. Do not purchase another subscription.');
    void query.refetch();
   }
  }catch(cause){
   if(!alive.current)return;
   const status=(cause as {response?:{status?:number}})?.response?.status;
   if(kind==='checkout'&&(purchaseRequested||status===409)){
    setUncertain(true);setError('The billing request could not be confirmed. Refresh billing status before retrying. Do not pay again.');void query.refetch();
   }else setError(status===403?'Billing access changed. Refresh your account before continuing.':kind==='portal'?'The billing portal is unavailable. Refresh billing status or try again later.':'Checkout is unavailable. Check your account and billing configuration, then refresh.');
  }finally{lock.current=false;if(alive.current)setBusy(false);}
 };
 const date=(value:string|null|undefined)=>value&&Number.isFinite(Date.parse(value))?<time dateTime={value}><bdi>{new Intl.DateTimeFormat(language==='ur'?'ur-PK':'en-PK',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}</bdi></time>:t('Not available');
 const statusLabels:Record<string,string>={active:'Active',trialing:'Trialing',past_due:'Past due',paused:'Paused',canceled:'Canceled'};
 return <div className="ops-page billing-page">
  <PageHeader title="Plan & billing" subtitle="Provider billing records, current capacity and available account actions." action={<Button variant="outline" className="min-h-12!" disabled={query.isFetching||busy} onClick={()=>void refresh()}>{t(query.isFetching?'Refreshing…':'Refresh billing status')}</Button>}/>
  <div className="billing-recovery-links"><Link to="/account/security">{t('Your account security')}</Link><Link to="/settings">{t('Owner verification and settings')}</Link></div>
  {query.isPending?<p role="status">{t('Loading billing records…')}</p>:null}
  {query.isError?<div role="alert" className="operations-notice">{t('Billing records could not be loaded. Your account security remains available. Refresh to try again.')}</div>:null}
  {data&&data.company.id!==user!.companyId?<p role="alert">{t('Billing records do not match the current workspace. Refresh your account.')}</p>:null}
  {data&&data.company.id===user!.companyId?<>
   {query.isError?<p role="status">{t('Showing previously loaded billing records. Refresh before taking any action.')}</p>:null}
   {data.company.operationalStatus==='SUSPENDED'?<p className="operations-notice" role="status">{t('Company operations are suspended. Owner billing and account security remain available. Payment does not remove an administrative suspension.')}</p>:null}
   {data.reconciliationRequired||uncertain?<p className="operations-notice" role="status">{t('A billing request needs reconciliation. Do not start another purchase. Refresh status or contact your configured support channel.')}</p>:null}
   {data.providerState==='AWAITING_PROVIDER'||(activationReturn&&!linked)?<p className="operations-notice" role="status">{t('Activation is awaiting provider synchronization. Completing checkout does not confirm an active subscription. Do not pay again.')}</p>:null}
   {notice?<p role="status" className="ops-save-result">{t(notice)}</p>:null}
   {error?<p role="alert" className="operations-notice">{t(error)}</p>:null}
   <div className="billing-columns">
    <section className="ops-panel ops-panel-body" aria-labelledby="billing-record-heading"><h2 id="billing-record-heading">{t('Your subscription')}</h2>
     <dl className="billing-facts">
      <div><dt>{t('Workspace capacity plan')}</dt><dd><bdi>{data.company.plan}</bdi></dd></div>
      <div><dt>{t('Provider subscription status')}</dt><dd>{data.subscription?<bdi>{t(statusLabels[data.subscription.status]??data.subscription.status)}</bdi>:t(data.providerState==='AWAITING_PROVIDER'?'Awaiting provider record':'No linked subscription record')}</dd></div>
      <div><dt>{t('Billing period starts')}</dt><dd>{date(data.subscription?.periodStart)}</dd></div>
      <div><dt>{t('Billing period ends')}</dt><dd>{date(data.subscription?.periodEnd)}</dd></div>
      <div><dt>{t('Scheduled change')}</dt><dd>{data.subscription?.scheduledChangeAction?<><bdi>{data.subscription.scheduledChangeAction}</bdi> · {date(data.subscription.scheduledChangeAt)}</>:t('No scheduled change recorded')}</dd></div>
      <div><dt>{t('Last provider event')}</dt><dd>{date(data.subscription?.lastEventAt)}</dd></div>
     </dl>
     {data.subscription&&!data.subscription.catalogQualified?<p className="operations-notice">{t('The linked subscription is not matched to the configured catalog. Billing records do not confirm new workspace access.')}</p>:null}
     <p>{t('Provider subscription status and workspace permissions are separate. Periods and changes follow recorded provider events.')}</p>
     {data.portalAvailable?<Button className="min-h-12!" disabled={busy||query.isError} onClick={()=>void act('portal')}>{t(busy?'Opening…':'Manage billing in Paddle')}</Button>:<p>{t('The billing portal is unavailable until the provider account and billing service are configured.')}</p>}
     {linked?<p>{t('Use the billing portal for plan changes, payment details and cancellation. A second subscription cannot be purchased here.')}</p>:null}
    </section>
    <section className="ops-panel ops-panel-body" aria-labelledby="billing-usage-heading"><h2 id="billing-usage-heading">{t('Usage and capacity')}</h2>
     <p>{t('Active records count toward capacity. Manager seats include the company owner.')}</p>
     <dl className="billing-usage">{(['locations','staff','managers'] as const).map(key=><div key={key}><dt>{t({locations:'Locations',staff:'Staff seats',managers:'Manager seats'}[key])}</dt><dd><bdi>{data.usage[key]} / {data.limits[key]}</bdi>{data.usage[key]>data.limits[key]?<strong>{t('Over limit')}</strong>:data.usage[key]===data.limits[key]?<span>{t('At limit')}</span>:null}</dd></div>)}</dl>
     <p>{t('Existing records and history are preserved when a limit is exceeded. New capacity is checked by the server.')}</p>
    </section>
   </div>
   {!linked?<section className="ops-panel ops-panel-body" aria-labelledby="billing-offers-heading"><h2 id="billing-offers-heading">{t('Available billing options')}</h2>
    {!data.billingConfigured?<p role="status">{t('Checkout is unavailable until the billing catalog and commercial terms are approved and configured.')}</p>:!data.ownerVerified?<p>{t('Verify your owner email in Settings before starting checkout.')}</p>:!data.checkoutAvailable?<p>{t('New checkout is unavailable for this account. Refresh billing status before continuing.')}</p>:null}
    {catalog.isFetching?<p role="status">{t('Loading configured provider prices…')}</p>:null}
    {catalog.isError?<p role="alert">{t('Configured prices could not be loaded. Checkout is unavailable. Refresh billing status to try again.')}</p>:null}
    {data.checkoutAvailable&&!catalog.isFetching&&!catalog.isError&&catalog.data?.length===0?<p>{t('No approved provider prices are available. Checkout is disabled.')}</p>:null}
    {!!catalog.data?.length&&data.checkoutAvailable&&!uncertain?<div className="billing-offers">{catalog.data.map(entry=>{
     const price=providerPrice(entry,language),same=prepared?.plan===entry.plan&&prepared.interval===entry.interval;
     return <div key={`${entry.plan}:${entry.interval}`}><div><h3><bdi>{entry.plan}</bdi> · {t(entry.interval==='month'?'Monthly':'Yearly')}</h3><p>{price??t('Provider price unavailable')} · {t('Final total and taxes are shown by Paddle before confirmation.')}</p>{entry.trialPeriod?<p>{t('Provider trial')}: <bdi>{entry.trialPeriod.frequency} {entry.trialPeriod.interval}</bdi></p>:null}</div><Button className="min-h-12!" disabled={busy||query.isError||!price||!!prepared&&!same} onClick={()=>void act('checkout',entry)}>{t(busy?'Opening…':same?'Reopen existing checkout':'Continue to checkout')}</Button></div>;
    })}</div>:null}
   </section>:null}
  </>:null}
 </div>;
}
