import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { subscribePaddleEvents, CheckoutEventNames } from '@/lib/paddle';
import { useBillingLifecycle } from '../queries';
import { deriveBillingViewState } from './billingViewState';
import BillingSetupLayout from './BillingSetupLayout';

export default function BillingActivationPage() {
 const {user}=useAuth();const {t}=useLanguage();
 if(user?.role!=='ADMIN')return <BillingSetupLayout currentStep="confirmation" completedSteps={['account','plan']}><h1>{t('Waiting for subscription confirmation')}</h1><p role="alert">{t('Only the company owner can view or change billing.')}</p><Link to="/login">{t('Sign in again')}</Link></BillingSetupLayout>;
 return <OwnerActivation key={`${user.companyId}:${user.id}`} companyId={user.companyId} ownerId={user.id}/>;
}
function OwnerActivation({companyId,ownerId}:{companyId:number;ownerId:number}) {
 const {t}=useLanguage();const query=useBillingLifecycle({poll:true});const refresh=useRef(query.refetch);useEffect(()=>{refresh.current=query.refetch;},[query.refetch]);
 const view=deriveBillingViewState({owner:{companyId,ownerId},dataOwner:query.dataOwner,data:query.data,read:query.isPending?'loading':query.isError?'error':query.isFetching?'stale':'fresh',httpStatus:(query.error as {response?:{status?:number}}|null)?.response?.status});
 useEffect(()=>subscribePaddleEvents(event=>{if([CheckoutEventNames.CHECKOUT_COMPLETED,CheckoutEventNames.CHECKOUT_CLOSED,CheckoutEventNames.CHECKOUT_ERROR].includes(event.name!))void refresh.current();}),[companyId,ownerId]);
 const ready=view.canOpenWorkspace;
 return <BillingSetupLayout currentStep="confirmation" completedSteps={ready?['account','plan','payment']:['account','plan']}>
  <section style={{maxWidth:600,marginInline:'auto',paddingBlock:32}} aria-live="polite">
   <h1>{t(ready?'Your workspace is ready':'Waiting for subscription confirmation')}</h1>
   <p style={{color:'var(--billing-muted)',marginBlockStart:20}}>{t(ready?'Your subscription has been confirmed by the server.':'Do not enter your card again while confirmation is pending.')}</p>
   {view.data?<p style={{marginBlockStart:24}}>{t('Selected plan')}: <bdi>{t((view.data.subscription?.plan??view.data.company.plan)==='ADVANCED'?'Enterprise':view.data.subscription?.plan??view.data.company.plan)}</bdi></p>:null}
   {view.kind==='restricted'?<p role="alert" style={{marginBlockStart:24}}>{t('Company operations are restricted. Billing and account security remain available.')}</p>:query.isError?<p role="alert" style={{marginBlockStart:24}}>{t('Billing is temporarily unavailable. Refresh status to try again.')}</p>:null}
   {query.pollingTimedOut?<p role="status" style={{marginBlockStart:24}}>{t('Confirmation is taking longer than expected. Check subscription status to continue.')}</p>:null}
   {ready?<Button asChild style={{marginBlockStart:32}}><Link to="/dashboard">{t('Open workspace')}</Link></Button>:<Button style={{marginBlockStart:32}} disabled={query.isFetching} onClick={()=>void query.refetch()}>{t(query.isFetching?'Checking subscription status…':'Check subscription status')}</Button>}
   {!ready?<p style={{marginBlockStart:24}}><Link to="/account/security">{t('Account security')}</Link></p>:null}
  </section>
 </BillingSetupLayout>;
}
