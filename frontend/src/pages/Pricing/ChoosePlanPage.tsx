import { Navigate, Link } from 'react-router-dom';
import { useSubscription } from '@/pages/Subscription/queries';
import { useLogout } from '@/queries/auth';
import { needsPlanSelection } from '@/lib/onboarding';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { PaddlePricing } from './PaddlePricing';

export default function ChoosePlanPage() {
  const subscription = useSubscription({ poll: true });
  const logout = useLogout();

  if (subscription.isPending) return <LoadingSpinner fullScreen />;
  if (subscription.data && !needsPlanSelection(subscription.data.company)) {
    return <Navigate to={subscription.data.company.subscriptionStatus === 'ACTIVE' ? '/dashboard' : '/subscription'} replace />;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Step 2 of 2 · Choose your plan</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Activate your workspace</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Your account is ready{subscription.data ? ` for ${subscription.data.company.name}` : ''}.
            {' '}Choose a plan below to start managing your team. Your subscription will be linked to this workspace.
          </p>
        </div>
        <Button variant="outline" disabled={logout.isPending} onClick={() => logout.mutate()}>Sign out</Button>
      </div>
      {logout.isError ? <p role="alert" className="mt-4 text-sm text-status-missed">Could not sign out. Please try again.</p> : null}
      {subscription.isError ? (
        <div role="alert" className="mt-8 space-y-3">
          <p>We couldn’t load your workspace. Please try again before choosing a plan.</p>
          <Button disabled={subscription.isFetching} onClick={() => void subscription.refetch()}>Try again</Button>
        </div>
      ) : (
        <div className="mt-8"><PaddlePricing /></div>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        Already finished checkout? <Link to="/welcome" className="font-medium text-primary underline">Check activation status</Link>
      </p>
    </section>
  );
}
