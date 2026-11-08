import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useBillingLifecycle } from './queries';
import { deriveBillingViewState } from './onboarding/billingViewState';
import BillingPlanPage from './onboarding/BillingPlanPage';
import BillingPaymentPage from './onboarding/BillingPaymentPage';
import BillingActivationPage from './onboarding/BillingActivationPage';
import BillingAccountPage from './onboarding/BillingAccountPage';
import BillingRecoveryPage from './onboarding/BillingRecoveryPage';
import BillingSetupLayout from './onboarding/BillingSetupLayout';
import { useLanguage } from '@/i18n/context';

export default function SubscriptionPage({activationReturn=false}:{activationReturn?:boolean}) {
 const {user}=useAuth();const {t}=useLanguage();
 if(user?.role!=='ADMIN')return <BillingSetupLayout currentStep="plan"><p role="alert">{t('Only the company owner can view or change billing.')}</p></BillingSetupLayout>;
 return <OwnerBilling key={`${user.companyId}:${user.id}`} companyId={user.companyId} ownerId={user.id} activationReturn={activationReturn}/>;
}
function OwnerBilling({companyId,ownerId,activationReturn}:{companyId:number;ownerId:number;activationReturn:boolean}) {
 const query=useBillingLifecycle();const {pathname}=useLocation();const [params]=useSearchParams();const {t}=useLanguage();
 // Refetch disables actions inside each screen; it must not unmount a checkout controller.
 const view=deriveBillingViewState({owner:{companyId,ownerId},dataOwner:query.dataOwner,data:query.data,read:query.isPending?'loading':query.isError?'error':'fresh',httpStatus:(query.error as {response?:{status?:number}}|null)?.response?.status});
 if(query.isPending)return <BillingSetupLayout currentStep="plan"><h1>{t('Checking subscription status…')}</h1><p role="status">{t('Loading available plans…')}</p></BillingSetupLayout>;
 if(activationReturn||params.get('activation')==='pending'||pathname==='/subscription/activation')return <BillingActivationPage/>;
 const linked=!!view.data?.subscription||view.data?.providerState==='MIRRORED'||view.data?.checkoutReadiness==='LINKED_SUBSCRIPTION';
 if(pathname==='/subscription/recovery')return <BillingRecoveryPage/>;
 if(view.data?.subscription?.status==='unknown')return <BillingActivationPage/>;
 if(linked){if(pathname!=='/subscription')return <Navigate to="/subscription" replace/>;return <BillingAccountPage/>;}
 if(view.kind==='confirmed')return <BillingActivationPage/>;
 if(pathname==='/subscription/payment')return <BillingPaymentPage/>;
 if(view.kind==='resume'&&view.resume)return <Navigate to={`/subscription/payment?${new URLSearchParams({plan:view.resume.plan,interval:view.resume.interval})}`} replace/>;
 if(pathname==='/choose-plan')return <BillingPlanPage/>;
 if(view.kind==='choose-plan')return <Navigate to="/choose-plan" replace/>;
 return <BillingRecoveryPage/>;
}
