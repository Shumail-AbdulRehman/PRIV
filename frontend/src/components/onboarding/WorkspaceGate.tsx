import { Link, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/context';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useBillingLifecycle } from '@/pages/Subscription/queries';
import './workspace-access.css';

// Presentation only: provider state must never block permitted operational reads.
// The API continues to enforce all permissions.
function OwnerWorkspaceGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const query = useBillingLifecycle();
  const matches = query.data?.company?.id === user?.companyId;
  const suspended = matches && (!query.data?.company.isActive || query.data?.company.operationalStatus === 'SUSPENDED');
  const status = (query.error as { response?: { status?: number } } | null)?.response?.status;
  const denied = status === 401 || status === 403;
  if (matches && !suspended && !denied) return children;

  return <div className="ops-page workspace-access-page">
    <PageHeader title={suspended ? 'Account access needs attention' : query.isPending ? 'Checking workspace access…' : 'Workspace access could not be checked'} />
    <section className="ops-panel ops-panel-body workspace-access-panel" aria-labelledby="workspace-access-heading">
      <h2 id="workspace-access-heading">{t('Your next step')}</h2>
      {suspended ? <>
        <div className="workspace-access-notice" role="status"><strong>{t('Company operations are suspended')}</strong><p>{t('Owner billing, account security and support remain available. Payment does not remove an administrative suspension.')}</p></div>
        <p>{t('Review the account issue with your company contact or configured support channel.')}</p>
        {query.isError ? <p role="alert">{t('Refresh workspace access to try again. Billing, security and help remain available.')}</p> : null}
      </> : query.isPending ? <p role="status">{t('Checking workspace access…')}</p> : <p role="alert">{t(query.data && !matches ? 'Workspace records do not match the current account. Refresh your account before continuing.' : 'Refresh workspace access to try again. Billing, security and help remain available.')}</p>}
      <div className="workspace-access-actions">
        <Link className="workspace-access-primary" to="/subscription">{t('Open Plan & billing')}</Link>
        <Link to="/help">{t('Get help')}</Link>
        <Link to="/account/security">{t('Your account security')}</Link>
        <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>{t('Refresh workspace access')}</Button>
      </div>
    </section>
  </div>;
}

export default function WorkspaceGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  // Owner recovery destinations stay outside the operational presentation gate.
  if (user?.role !== 'ADMIN' || /^\/(subscription|settings)(\/|$)/.test(pathname)) return children;
  return <OwnerWorkspaceGate key={`${user.companyId}:${user.id}`}>{children}</OwnerWorkspaceGate>;
}
