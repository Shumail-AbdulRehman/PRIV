import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useBillingLifecycle } from '@/pages/Subscription/queries';
import { deriveBillingViewState } from '@/pages/Subscription/onboarding/billingViewState';
import { FlowEntryStatus } from '@/pages/Onboarding/FlowEntry';
import { isSafeFromPath, onboardingRouteForStep } from '@/pages/Onboarding/onboardingRoutes';

function OwnerWorkspaceGate({ children, companyId, ownerId }: { children: React.ReactNode; companyId: number; ownerId: number }) {
  const query = useBillingLifecycle();
  const location = useLocation();
  const view = deriveBillingViewState({ owner: { companyId, ownerId }, dataOwner: query.dataOwner, data: query.data,
    read: query.isPending ? 'loading' : query.isError ? 'error' : 'fresh' });
  const data = view.data;
  if (!query.isPending && !query.isError && data?.company.isActive && data.company.operationalStatus === 'ACTIVE' && view.kind !== 'restricted') {
    // Historical subscribers retain READ_OPERATIONAL. Work and capacity stay server-authorized.
    const historical = data.subscription && ['active', 'trialing', 'past_due', 'canceled', 'paused'].includes(data.subscription.status);
    if (view.canOpenWorkspace || (data.onboardingRequired !== true && (historical || data.onboardingRequired === false))) return children;
  }
  const route = onboardingRouteForStep(view.step);
  if (route && route !== location.pathname) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={route} state={isSafeFromPath(from) ? { from } : null} replace />;
  }
  return <FlowEntryStatus pending={query.isPending} busy={query.isFetching} retry={query.refetch} />;
}

export default function WorkspaceGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (user?.role !== 'ADMIN' || /^\/(subscription|settings)(\/|$)/.test(pathname)) return children;
  return <OwnerWorkspaceGate key={`${user.companyId}:${user.id}`} companyId={user.companyId} ownerId={user.id}>{children}</OwnerWorkspaceGate>;
}
