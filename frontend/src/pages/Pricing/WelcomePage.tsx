import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/pages/Subscription/queries';

export default function WelcomePage() {
  const subscription = useSubscription({ poll: true });
  const active = subscription.data?.company.subscriptionStatus === 'ACTIVE';

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl border border-line bg-surface p-7 sm:p-12">
        {active
          ? <CheckCircle2 className="h-10 w-10 text-status-complete" aria-hidden="true" />
          : <LoaderCircle className="h-10 w-10 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />}
        <div role="status" aria-live="polite">
          <p className="mt-8 font-mono text-xs uppercase tracking-wider text-ink/55">
            {active ? 'Workspace activated' : 'Checking your subscription'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {active ? 'Your workspace is ready.' : 'Your account is ready. Confirming your plan.'}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink/65">
            {active
              ? 'Your subscription is active. You can now add your locations and team.'
              : subscription.isError
                ? 'We couldn’t check your subscription. Please try again.'
                : 'After checkout, activation can take a moment. This page updates automatically. If you completed checkout, you do not need to pay again.'}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {active ? (
            <Button asChild><Link to="/dashboard">Open dashboard</Link></Button>
          ) : (
            <>
              <Button disabled={subscription.isFetching} onClick={() => void subscription.refetch()}>
                {subscription.isFetching ? 'Checking…' : 'Check again'}
              </Button>
              <Button asChild variant="outline"><Link to="/choose-plan">Back to plans</Link></Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
