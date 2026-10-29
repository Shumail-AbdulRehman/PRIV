import { useServiceInformation, getPublicSupport } from '../Help/serviceInformation';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, LifeBuoy, RefreshCw, ShieldCheck } from 'lucide-react';
import { SkeletonLine } from '@/components/common/LoadingSkeleton';
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
 const service=useServiceInformation();
 const data=query.data;
 const linked=data?.providerState==='MIRRORED';
 const catalog=useQuery({queryKey:['billing-catalog',user!.companyId,user!.id],queryFn:({signal})=>getBillingCatalog(signal),enabled:data?.company.id===user!.companyId&&!query.isError&&!!data?.checkoutAvailable&&data.billingConfigured&&!linked&&!data.reconciliationRequired&&!uncertain,retry:false,staleTime:0});
 const refresh=async()=>{
  const result=await query.refetch();
  if(!result.isError&&alive.current){setUncertain(false);setError('');if(result.data?.providerState==='MIRRORED')setPrepared(null);if(result.data?.company.id===user!.companyId&&result.data.checkoutAvailable&&result.data.billingConfigured)void catalog.refetch();}
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
    if(!service.purchaseReady||!(await getPublicSupport(abort.signal)).email)throw new Error('CHECKOUT_UNAVAILABLE');
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
 const current=data?.company.id===user!.companyId?data:undefined;
 const providerLabel=current?.subscription
  ? statusLabels[current.subscription.status]??current.subscription.status
  : current?.providerState==='AWAITING_PROVIDER'?'Awaiting provider record':'No linked subscription record';
 const providerTone=current?.providerState==='AWAITING_PROVIDER'?'attention'
  : current?.subscription?.status==='active'?'success'
  : current?.subscription?.status==='trialing'?'progress'
  : ['past_due','paused'].includes(current?.subscription?.status??'')?'attention':'neutral';
 return <div className="ops-page billing-page">
  <PageHeader title="Plan & billing" subtitle="Provider billing records, current capacity and available account actions." action={<div className="billing-header-actions">
   {current?.portalAvailable?<Button variant="outline" disabled={busy||query.isError} onClick={()=>void act('portal')}><CreditCard size={16} aria-hidden="true"/>{t(busy?'Opening…':'Manage billing in Paddle')}</Button>:null}
   <Button variant="outline" disabled={query.isFetching||busy} onClick={()=>void refresh()}><RefreshCw size={16} aria-hidden="true"/>{t(query.isFetching?'Refreshing…':'Refresh billing status')}</Button>
  </div>}/>
  <div className="billing-layout">
   <div className="billing-main">
    {query.isPending?<section className="ops-panel billing-loading" role="status" aria-busy="true"><h2>{t('Loading billing records…')}</h2><div aria-hidden="true"><SkeletonLine width="long"/><SkeletonLine/><SkeletonLine width="short"/></div></section>:null}
    {query.isError?<section role="alert" className="ops-panel billing-load-error"><h2>{t('Billing records could not load')}</h2><p>{t('Billing records could not be loaded. Your account security remains available. Refresh to try again.')}</p></section>:null}
    {data&&!current?<p role="alert" className="billing-notice">{t('Billing records do not match the current workspace. Refresh your account.')}</p>:null}
    {current?<>
     {query.isError?<p role="status" className="billing-notice">{t('Showing previously loaded billing records. Refresh before taking any action.')}</p>:null}
     {!current.company.isActive||current.company.operationalStatus==='SUSPENDED'?<p className="billing-notice" role="status">{t('Company operations are suspended. Owner billing and account security remain available. Payment does not remove an administrative suspension.')}</p>:null}
     {current.reconciliationRequired||uncertain?<p className="billing-notice" role="status">{t('A billing request needs reconciliation. Do not start another purchase. Refresh status or contact your configured support channel.')}</p>:null}
     {current.providerState==='AWAITING_PROVIDER'||(activationReturn&&!linked)?<p className="billing-notice" role="status">{t('Activation is awaiting provider synchronization. Completing checkout does not confirm an active subscription. Do not pay again.')}</p>:null}
     {notice?<p role="status" className="billing-notice billing-notice-info">{t(notice)}</p>:null}
     {error?<p role="alert" className="billing-notice">{t(error)}</p>:null}
     <section className="ops-panel billing-panel" aria-labelledby="billing-record-heading">
      <header className="billing-panel-heading"><h2 id="billing-record-heading">{t('Your subscription')}</h2></header>
      <div className="billing-panel-body">
       <dl className="billing-facts">
        <div><dt>{t('Workspace capacity plan')}</dt><dd><bdi>{current.company.plan}</bdi></dd></div>
        <div><dt>{t('Provider subscription status')}</dt><dd><span className="ops-status" data-tone={providerTone}><bdi>{t(providerLabel)}</bdi></span></dd></div>
        <div><dt>{t('Billing period starts')}</dt><dd>{date(current.subscription?.periodStart)}</dd></div>
        <div><dt>{t('Billing period ends')}</dt><dd>{date(current.subscription?.periodEnd)}</dd></div>
        <div><dt>{t('Scheduled change')}</dt><dd>{current.subscription?.scheduledChangeAction?<><bdi>{current.subscription.scheduledChangeAction}</bdi> · {date(current.subscription.scheduledChangeAt)}</>:t('No scheduled change recorded')}</dd></div>
       </dl>
       {current.subscription&&!current.subscription.catalogQualified?<p className="billing-notice">{t('The linked subscription is not matched to the configured catalog. Billing records do not confirm new workspace access.')}</p>:null}
       <p className="billing-explanation">{t('Provider subscription status and workspace permissions are separate. Periods and changes follow recorded provider events.')}</p>
       {!current.portalAvailable?<p className="billing-notice billing-notice-info">{t('The billing portal is unavailable until the provider account and billing service are configured.')}</p>:null}
       {linked?<p className="billing-explanation">{t('Use the billing portal for plan changes, payment details and cancellation. A second subscription cannot be purchased here.')}</p>:null}
      </div>
     </section>
     <section className="ops-panel billing-panel" aria-labelledby="billing-usage-heading">
      <header className="billing-panel-heading"><h2 id="billing-usage-heading">{t('Usage and capacity')}</h2></header>
      <div className="billing-panel-body">
       <dl className="billing-usage">{(['locations','staff','managers'] as const).map(key=><div key={key}><dt><strong>{t({locations:'Locations',staff:'Staff seats',managers:'Manager seats'}[key])}</strong><span>{t({locations:'Active locations',staff:'Active staff records',managers:'Includes the company owner'}[key])}</span></dt><dd><bdi>{current.usage[key]} / {current.limits[key]}</bdi>{current.usage[key]>current.limits[key]?<strong className="ops-status" data-tone="danger">{t('Over limit')}</strong>:current.usage[key]===current.limits[key]?<span className="ops-status" data-tone="attention">{t('At limit')}</span>:null}</dd></div>)}</dl>
       <p className="billing-explanation">{t('Active records count toward capacity. Manager seats include the company owner.')}</p>
       <p className="billing-explanation">{t('Existing records and history are preserved when a limit is exceeded. New capacity is checked by the server.')}</p>
      </div>
     </section>
     <section className="ops-panel billing-panel" aria-labelledby="billing-activity-heading">
      <header className="billing-panel-heading"><h2 id="billing-activity-heading">{t('Billing activity')}</h2></header>
      <div className="billing-panel-body">
       {current.subscription?<div className="billing-activity-row"><div><strong>{t('Last provider event')}</strong><p>{date(current.subscription.lastEventAt)}</p></div></div>:<p className="billing-empty">{t('No provider billing activity recorded.')}</p>}
       <p className="billing-explanation">{t('Only the latest recorded provider event is shown here. Invoices and payment totals are available in the billing portal when configured.')}</p>
      </div>
     </section>
     {!linked?<section className="ops-panel billing-panel" aria-labelledby="billing-offers-heading">
      <header className="billing-panel-heading"><h2 id="billing-offers-heading">{t('Available billing options')}</h2></header>
      <div className="billing-panel-body billing-options">
       {!service.purchaseReady?<p role="status">{t('New purchases are unavailable until approved customer policies and a support contact are available.')} <Link to="/help">{t('Help & service information')}</Link></p>:null}
       {!current.billingConfigured?<p role="status">{t('Checkout is unavailable until the billing catalog and commercial terms are approved and configured.')}</p>:!current.ownerVerified?<p>{t('Verify your owner email in Settings before starting checkout.')}</p>:!current.checkoutAvailable?<p>{t('New checkout is unavailable for this account. Refresh billing status before continuing.')}</p>:null}
       {catalog.isFetching?<p role="status">{t('Loading configured provider prices…')}</p>:null}
       {catalog.isError?<p role="alert">{t('Configured prices could not be loaded. Checkout is unavailable. Refresh billing status to try again.')}</p>:null}
       {current.checkoutAvailable&&!catalog.isFetching&&!catalog.isError&&catalog.data?.length===0?<p>{t('No approved provider prices are available. Checkout is disabled.')}</p>:null}
       {!!catalog.data?.length&&!catalog.isError&&!catalog.isFetching&&current.checkoutAvailable&&!uncertain?<div className="billing-offers">{catalog.data.map(entry=>{
        const price=providerPrice(entry,language),same=prepared?.plan===entry.plan&&prepared.interval===entry.interval;
        return <div key={`${entry.plan}:${entry.interval}`}><div><h3><bdi>{entry.plan}</bdi> · {t(entry.interval==='month'?'Monthly':'Yearly')}</h3><p>{price??t('Provider price unavailable')} · {t('Final total and taxes are shown by Paddle before confirmation.')}</p>{entry.trialPeriod?<p>{t('Provider trial')}: <bdi>{entry.trialPeriod.frequency} {entry.trialPeriod.interval}</bdi></p>:null}</div><Button disabled={!service.purchaseReady||busy||query.isError||!price||!!prepared&&!same} onClick={()=>void act('checkout',entry)}>{t(busy?'Opening…':same?'Reopen existing checkout':'Continue to checkout')}</Button></div>;
       })}</div>:null}
      </div>
     </section>:null}
    </>:null}
   </div>
   <aside className="billing-aside" aria-label={t('Billing guidance')}>
    <section className="ops-panel billing-panel" aria-labelledby="billing-help-heading">
     <header className="billing-panel-heading"><h2 id="billing-help-heading">{t('Subscription help')}</h2></header>
     <div className="billing-panel-body">
      <p>{t('Changing an existing plan must not start an accidental second subscription.')}</p>
      <p className="billing-explanation">{t('Use the provider portal for existing subscriptions. If activation is pending, refresh billing status before taking another action.')}</p>
      <Link className="billing-rail-link" to="/help"><LifeBuoy size={16} aria-hidden="true"/>{t('Contact support')}</Link>
     </div>
    </section>
    <section className="ops-panel billing-panel" aria-labelledby="billing-account-heading">
     <header className="billing-panel-heading"><h2 id="billing-account-heading">{t('Account recovery')}</h2></header>
     <div className="billing-panel-body">
      <p>{t('Owner billing, account security and help remain available when company operations are restricted.')}</p>
      <div className="billing-recovery-links"><Link to="/account/security"><ShieldCheck size={16} aria-hidden="true"/>{t('Your account security')}</Link><Link to="/settings">{t('Owner verification and settings')}</Link></div>
     </div>
    </section>
   </aside>
  </div>
 </div>;
}
