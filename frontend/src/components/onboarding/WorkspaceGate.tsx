import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/pages/Subscription/queries';
import { needsPlanSelection } from '@/lib/onboarding';

function AdminWorkspaceGate({ children }: { children: React.ReactNode }) {
  const subscription = useSubscription();
  if (subscription.isPending) return <LoadingSpinner fullScreen />;
  if (subscription.isError) {
    return (
      <div role="alert" className="mx-auto max-w-lg space-y-4 px-6 py-16">
        <h1 className="text-xl font-semibold">We couldn’t check your workspace</h1>
        <p className="text-sm text-muted-foreground">Please try again to continue setting up your account.</p>
        <Button disabled={subscription.isFetching} onClick={() => void subscription.refetch()}>Try again</Button>
      </div>
    );
  }
  if (needsPlanSelection(subscription.data.company)) return <Navigate to="/choose-plan" replace />;
  return children;
}

export default function WorkspaceGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <AdminWorkspaceGate>{children}</AdminWorkspaceGate> : children;
}
