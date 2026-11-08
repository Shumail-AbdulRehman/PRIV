import { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { useBillingLifecycle } from '../queries';
import { deriveBillingViewState } from './billingViewState';
import { useBillingCheckout } from './useBillingCheckout';
import BillingSetupLayout from './BillingSetupLayout';
import type { PlanCode } from '../types';

export default function BillingRecoveryPage() {
 const {user}=useAuth();const {t}=useLanguage();
 if(user?.role!=='ADMIN')return <BillingSetupLayout currentStep="payment"><h1>{t('Check subscription status')}</h1><p role="alert">{t('Only the company owner can view or change billing.')}</p><Link to="/login">{t('Sign in again')}</Link></BillingSetupLayout>;
 return <OwnerRecovery key={`${user.companyId}:${user.id}`} companyId={user.companyId} ownerId={user.id}/>;
}
function OwnerRecovery({companyId,ownerId}:{companyId:number;ownerId:number}) {
 const {t}=useLanguage();const [params]=useSearchParams();const navigate=useNavigate();const query=useBillingLifecycle();const checkout=useBillingCheckout();
 const view=deriveBillingViewState({owner:{companyId,ownerId},dataOwner:query.dataOwner,data:query.data,read:query.isPending?'loading':query.isError?'error':query.isFetching?'stale':'fresh',uncertain:checkout.status==='uncertain',httpStatus:(query.error as {response?:{status?:number}}|null)?.response?.status});
 const saved=view.resume;
 const requestedPlan=['STARTER','PRO','ADVANCED'].includes(params.get('plan')??'')?params.get('plan') as PlanCode:null;
 const requestedInterval=params.get('interval')==='year'?'year':params.get('interval')==='month'?'month':null;
 const plan=saved?.plan??checkout.prepared?.plan??requestedPlan;
 const interval=saved?.interval??checkout.prepared?.interval??requestedInterval;
 const canRetry=checkout.status==='pre-submit-error'&&view.canChoosePlan&&!!plan&&!!interval&&!checkout.prepared;
 const canReopen=!!saved&&!['uncertain','pending','open'].includes(checkout.status);
 const busy=checkout.isBusy||query.isFetching;
 const heading=useRef<HTMLHeadingElement>(null);const previous=useRef(view.kind+checkout.status);
 useEffect(()=>{const next=view.kind+checkout.status;if(previous.current!==next){heading.current?.focus();previous.current=next;}},[view.kind,checkout.status]);
 useEffect(()=>{if(checkout.status==='pending'||view.canOpenWorkspace)navigate('/subscription/activation',{replace:true});},[checkout.status,view.canOpenWorkspace,navigate]);
 const message=view.kind==='restricted'?'Company operations are restricted. Billing and account security remain available.':saved?'Your prepared checkout is ready to reopen.':canRetry?'Checkout could not open. Try again.':view.kind==='uncertain'||checkout.status==='uncertain'?'We could not confirm the outcome. Check subscription status before trying another payment.':'Billing is temporarily unavailable. Refresh status to try again.';
 return <BillingSetupLayout currentStep="payment" completedSteps={['account','plan']}>
  <section style={{maxWidth:600,marginInline:'auto',paddingBlock:32}}>
   <h1 ref={heading} tabIndex={-1}>{t(canRetry?'Checkout could not open. Try again.':'Check subscription status')}</h1>
   <p role={canRetry?'alert':'status'} style={{marginBlockStart:20}}>{t(message)}</p>
   {plan&&interval?<section aria-label={t('Selected plan')} style={{paddingBlock:24,marginBlock:24,borderBlock:'1px solid var(--billing-line)'}}><h2>{t('Selected plan')}</h2><p style={{marginBlockStart:12}}><bdi>{t(plan==='ADVANCED'?'Enterprise':plan)}</bdi> · {t(interval==='year'?'Yearly':'Monthly')}</p></section>:null}
   {canRetry||canReopen?<Button style={{marginBlockStart:24,width:'100%'}} disabled={busy} onClick={()=>plan&&interval&&void checkout.openCheckout({plan,interval})}>{t(canReopen?'Reopen existing checkout':'Try again')}</Button>:null}
   <Button variant={canRetry||canReopen?'outline':'default'} style={{marginBlockStart:16,width:'100%'}} disabled={busy} onClick={()=>{void checkout.checkStatus();void query.refetch();}}>{t(busy?'Checking subscription status…':'Check subscription status')}</Button>
   <p style={{marginBlockStart:24}}><Link to="/account/security">{t('Account security')}</Link></p>
   {view.reason==='denied'||view.reason==='identity'?<p style={{marginBlockStart:16}}><Link to="/login">{t('Sign in again')}</Link></p>:null}
  </section>
 </BillingSetupLayout>;
}
