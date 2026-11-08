import { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { useBillingCatalog, useBillingLifecycle, useSubscription } from '../queries';
import { billingPlanDefinition, deriveBillingViewState } from './billingViewState';
import { formatBillingPrice } from './billingPrice';
import { useBillingCheckout } from './useBillingCheckout';
import BillingSetupLayout from './BillingSetupLayout';
import type { PlanCode } from '../types';

export default function BillingPaymentPage() {
 const {user}=useAuth(); const {t}=useLanguage();
 if(user?.role!=='ADMIN') return <BillingSetupLayout currentStep="payment"><h1>{t('Review your plan')}</h1><p role="alert">{t('Only the company owner can view or change billing.')}</p><Link to="/login">{t('Sign in again')}</Link></BillingSetupLayout>;
 return <OwnerPayment key={`${user.companyId}:${user.id}`} companyId={user.companyId} ownerId={user.id}/>;
}
function OwnerPayment({companyId,ownerId}:{companyId:number;ownerId:number}) {
 const {t,language}=useLanguage(); const [params]=useSearchParams(); const navigate=useNavigate();
 const life=useBillingLifecycle(), catalog=useBillingCatalog(), summary=useSubscription(), checkout=useBillingCheckout();
 const view=deriveBillingViewState({owner:{companyId,ownerId},dataOwner:life.dataOwner,data:life.data,read:life.isPending?'loading':life.isError?'error':life.isFetching?'stale':'fresh'});
 const draft=checkout.prepared??view.resume;
 const planCode=draft?.plan??(['STARTER','PRO','ADVANCED'].includes(params.get('plan')??'')?params.get('plan') as PlanCode:null);
 const interval=draft?.interval??(params.get('interval')==='year'?'year':params.get('interval')==='month'?'month':null);
 const matches=catalog.data?.filter(row=>row.plan===planCode&&row.interval===interval)??[];
 const entry=matches.length===1?matches[0]:null;
 const plan=planCode?billingPlanDefinition(summary.data?.availablePlans??[],planCode):null;
 const price=entry?formatBillingPrice(entry.amount,entry.currencyCode,entry.interval,language==='ur'?'ur-PK':'en-PK'):null;
 const busy=life.isFetching||catalog.isFetching||summary.isFetching||checkout.isBusy;
 const unresolved=!!draft||['uncertain','pending','open','reopenable'].includes(checkout.status)||['pending','uncertain'].includes(view.kind);
 const opener=useRef<HTMLButtonElement>(null),wasOpen=useRef(false);
 const safe=!!plan&&!!price&&!busy&&!life.isError&&!catalog.isError&&!summary.isError&&(view.canChoosePlan||view.kind==='resume')&&!['uncertain','pending','open'].includes(checkout.status);
 const sandbox=view.data?.billingEnvironment==='sandbox'&&import.meta.env.VITE_PADDLE_ENVIRONMENT==='sandbox'&&import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.startsWith('test_');
 useEffect(()=>{if(checkout.status==='open')wasOpen.current=true;if(checkout.status==='reopenable'&&wasOpen.current&&!busy){wasOpen.current=false;opener.current?.focus();}},[checkout.status,busy]);
 useEffect(()=>{if(checkout.status==='pending')navigate('/subscription/activation',{replace:true});},[checkout.status,navigate]);
 return <BillingSetupLayout currentStep="payment" environment={sandbox?'sandbox':undefined}>
  <style>{`
   @media(max-width:760px){
    .billing-onboarding .billing-order-summary{padding:16px!important;}
    .billing-onboarding .billing-order-summary>p{margin-block:10px!important;font-size:13px;}
    .billing-onboarding .billing-order-summary .billing-order-plan{font-size:20px;margin-block:12px!important;}
    .billing-onboarding .billing-order-capacities{grid-template-columns:repeat(3,minmax(0,1fr));padding:12px 0!important;list-style:none;gap:8px!important;margin-block:12px!important;border-block:1px solid var(--billing-line);font-size:12px;}
    .billing-onboarding .billing-order-summary a{margin-block-start:12px!important;}
    .billing-onboarding .billing-order-price{font-size:24px!important;}
   }
  `}</style>
  <h1>{t('Review your plan')}</h1>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))',gap:32,marginBlockStart:32}}>
   <section className="billing-order-summary" aria-labelledby="order-summary" style={{padding:24,background:'var(--billing-canvas)',border:'1px solid var(--billing-line)',borderRadius:'var(--billing-radius)',minWidth:0}}>
    <h2 id="order-summary">{t('Order summary')}</h2>
    <p className="billing-order-plan" style={{fontSize:24,fontWeight:600,marginBlock:20}}>{plan?t(plan.name):t('Provider price unavailable')}</p>
    <dl style={{display:'grid',gap:16}}><div><dt>{t('Recurring price')}</dt><dd><bdi className="billing-order-price" dir="ltr" style={{fontSize:28,fontWeight:600,overflowWrap:'anywhere'}}>{price?.formatted??t('Not available')}</bdi> · {interval?t(interval==='year'?'Yearly':'Monthly'):t('Not available')}</dd></div></dl>
    {plan?<ul className="billing-order-capacities" style={{paddingInlineStart:20,display:'grid',gap:12,marginBlock:24}}>{(['locations','staff','managers'] as const).map(resource=><li key={resource}>{t({locations:'Includes {count} locations',staff:'Includes {count} staff seats',managers:'Includes {count} manager seats'}[resource],{count:plan.limits[resource]})}</li>)}</ul>:null}
    <p style={{color:'var(--billing-muted)',fontSize:13}}>{t('The company owner uses one manager seat.')}</p>
    {entry?.trialPeriod?<p>{t('Provider trial')}: <bdi dir="ltr">{entry.trialPeriod.frequency}</bdi> {t(entry.trialPeriod.interval)}</p>:null}
    <p style={{color:'var(--billing-muted)',marginBlockStart:20}}>{t('Taxes and the final amount are confirmed by Paddle.')}</p>
    {!unresolved?<Link style={{display:'inline-block',marginBlockStart:24}} to={planCode&&interval?`/choose-plan?${new URLSearchParams({plan:planCode,interval})}`:'/choose-plan'}>{t('Change plan')}</Link>:<p style={{marginBlockStart:24}}>{t('Your prepared checkout keeps its selected plan. Check status before making another payment.')}</p>}
   </section>
   <section aria-labelledby="payment-details" style={{minWidth:0}}>
    <h2 id="payment-details">{t('Secure checkout with Paddle')}</h2><p style={{marginBlockStart:16}}>{t('Payment details are entered securely in Paddle.')}</p>
    {sandbox?<section style={{marginBlock:24,padding:20,background:'var(--billing-amber-wash)',borderRadius:'var(--billing-radius)'}}><h3>{t('Sandbox · test cards only')}</h3><p style={{marginBlockStart:12}}>{t('Use a Paddle test card. No real money is charged.')}</p><p style={{marginBlockStart:12}}><bdi dir="ltr">4242 4242 4242 4242</bdi></p><p>{t('Use a future expiry date and any three-digit security code.')}</p></section>:null}
    {checkout.message?<p role="alert" style={{marginBlock:20}}>{t(checkout.message)}</p>:null}
    {!price||!plan||(!view.canChoosePlan&&view.kind!=='resume')||life.isError||catalog.isError||summary.isError?<p role="status" style={{marginBlock:20}}>{t('Billing is temporarily unavailable. Refresh status to try again.')}</p>:null}
    <Button ref={opener} style={{marginBlockStart:24,width:'100%'}} disabled={!safe} onClick={()=>planCode&&interval&&void checkout.openCheckout({plan:planCode,interval})}>{t(checkout.status==='loading'?'Opening secure checkout…':draft?'Reopen secure checkout':'Open secure checkout')}</Button>
    {unresolved||!safe?<Button variant="outline" style={{marginBlockStart:12,width:'100%'}} disabled={busy} onClick={()=>{void checkout.checkStatus();void life.refetch();void catalog.refetch();void summary.refetch();}}>{t('Check subscription status')}</Button>:null}
    {checkout.status==='open'?<p role="status">{t('Complete your payment in the Paddle checkout window.')}</p>:checkout.status==='reopenable'?<p role="status">{t('Your prepared checkout is ready to reopen.')}</p>:null}
    <p style={{marginBlockStart:20,color:'var(--billing-muted)',fontSize:13}}>{t('Final total and taxes are shown by Paddle before confirmation.')}</p>
   </section>
  </div>
 </BillingSetupLayout>;
}
