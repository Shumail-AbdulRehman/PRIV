import { Link, Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { useBillingLifecycle } from '@/pages/Subscription/queries';
import BillingSetupLayout from '@/pages/Subscription/onboarding/BillingSetupLayout';

function OwnerWorkspaceGate({children}:{children:React.ReactNode}) {
 const {user}=useAuth();const {t}=useLanguage();const query=useBillingLifecycle();
 const data=query.data;const matches=data?.company.id===user?.companyId;
 const suspended=matches&&(!data?.company.isActive||data.company.operationalStatus==='SUSPENDED');
 if(matches&&data&&!suspended&&!query.isError){
  // Historic linked subscribers retain READ_OPERATIONAL, including expired periods.
  // Start-work/capacity authorization remains server policy.
  if(data.workspaceAccessAllowed)return children;
  const historical=data.subscription&&['active','trialing','past_due','canceled','paused'].includes(data.subscription.status);
  if(data.onboardingRequired!==true&&(historical||data.onboardingRequired===false))return children;
  return <Navigate to="/subscription" replace/>;
 }
 return <BillingSetupLayout currentStep="confirmation" completedSteps={['account','plan']}>
  <h1>{t(suspended?'Account access needs attention':query.isPending?'Checking workspace access…':'Workspace access could not be checked')}</h1>
  {query.isPending?<p role="status">{t('Checking workspace access…')}</p>:<p role="alert" style={{marginBlockStart:20}}>{t(suspended?'Company operations are restricted. Billing and account security remain available.':'Refresh workspace access to try again. Billing and account security remain available.')}</p>}
  {suspended?<p role="status">{t('Payment does not remove an administrative suspension.')}</p>:null}
  <div style={{display:'flex',flexWrap:'wrap',gap:20,marginBlockStart:24}}><Link to="/subscription">{t('Open Plan & billing')}</Link><Link to="/account/security">{t('Your account security')}</Link><Button variant="outline" disabled={query.isFetching} onClick={()=>void query.refetch()}>{t('Refresh workspace access')}</Button></div>
 </BillingSetupLayout>;
}
export default function WorkspaceGate({children}:{children:React.ReactNode}) {
 const {user}=useAuth();const {pathname}=useLocation();
 if(user?.role!=='ADMIN'||/^\/(subscription|settings)(\/|$)/.test(pathname))return children;
 return <OwnerWorkspaceGate key={`${user.companyId}:${user.id}`}>{children}</OwnerWorkspaceGate>;
}
