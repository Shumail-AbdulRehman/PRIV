import {
  CircleGauge,
  ExternalLink,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AxiosError } from "axios";
import { useSelector } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/store/store";
import { cn } from "@/lib/utils";
import { PaddlePricing } from "@/pages/Pricing/PaddlePricing";
import { useCustomerPortalSession, useSubscription } from "./queries";

type ApiErrorBody = { message?: string };

function UsageMeter({
  label,
  value,
  limit,
  icon: Icon,
}: {
  label: string;
  value: number;
  limit: number;
  icon: typeof MapPin;
}) {
  const percentage = Math.min((value / limit) * 100, 100);
  const nearLimit = value >= limit;

  return (
    <div className="min-w-0 flex-1 py-2">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {label}
        </span>
        <span
          className={cn(
            "text-sm tabular-nums",
            nearLimit
              ? "font-semibold text-amber-700"
              : "text-muted-foreground",
          )}
        >
          {value} / {limit}
        </span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
        aria-hidden="true"
      >
        <div
          className={cn(
            "h-full rounded-full",
            nearLimit ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const subscription = useSubscription();
  const portalSession = useCustomerPortalSession();

  if (subscription.isPending) return <LoadingSpinner />;

  if (subscription.isError || !subscription.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Plan & usage"
          subtitle="Subscription information could not be loaded."
        />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Please refresh the page and try again.
        </div>
      </div>
    );
  }

  const summary = subscription.data;
  const isAdmin = user?.role === "ADMIN";
  const portalError =
    portalSession.error instanceof AxiosError
      ? (portalSession.error.response?.data as ApiErrorBody | undefined)
          ?.message
      : portalSession.error instanceof Error
        ? portalSession.error.message
        : undefined;

  const openBillingPortal = () => {
    portalSession.mutate(undefined, {
      onSuccess: ({ url }) => window.location.assign(url),
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Plan & usage"
        subtitle="Review workspace allowances and choose the plan that matches your operation."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="px-3 py-1.5">
              {summary.plan.name} plan
            </Badge>
            {isAdmin ? (
              <Button
                type="button"
                variant="outline"
                disabled={portalSession.isPending}
                onClick={openBillingPortal}
                className="rounded-2xl"
              >
                {portalSession.isPending ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                )}
                {portalSession.isPending ? "Opening…" : "Manage billing"}
              </Button>
            ) : null}
          </div>
        }
      />

      {portalError ? (
        <div
          role="alert"
          className="border border-status-missed bg-status-missed-bg px-4 py-3 text-sm text-status-missed"
        >
          {portalError}
        </div>
      ) : null}

      <section
        aria-labelledby="usage-heading"
        className="overflow-hidden rounded-3xl border border-border/70 bg-card"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 px-6 py-5">
          <div>
            <h2
              id="usage-heading"
              className="text-lg font-semibold text-foreground"
            >
              Current usage
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Active resources count toward your plan limits.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Subscription {summary.company.subscriptionStatus.toLowerCase()}
          </div>
        </div>
        <div className="grid gap-x-8 px-6 py-4 md:grid-cols-3">
          <UsageMeter
            label="Locations"
            value={summary.usage.locations}
            limit={summary.plan.limits.locations}
            icon={MapPin}
          />
          <UsageMeter
            label="Staff"
            value={summary.usage.staff}
            limit={summary.plan.limits.staff}
            icon={Users}
          />
          <UsageMeter
            label="Manager seats"
            value={summary.usage.managers}
            limit={summary.plan.limits.managers}
            icon={CircleGauge}
          />
        </div>
      </section>

      <details className="rounded-xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          Compare plans & change subscription
        </summary>
        <section
          aria-labelledby="plans-heading"
          className="mt-6 marketing-site"
        >
          <div className="mb-4">
            <h2
              id="plans-heading"
              className="text-xl font-semibold text-foreground"
            >
              Plans and billing
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Prices are localized by Paddle. Manager seats include the original
              company administrator.
            </p>
          </div>
          <PaddlePricing
            appearance="marketing"
            currentPlan={
              summary.company.subscriptionStatus === "ACTIVE"
                ? summary.company.plan
                : undefined
            }
            subscribeDisabled={!isAdmin}
            disabledMessage="Only the company administrator can subscribe for this workspace."
          />
        </section>
      </details>
    </div>
  );
}
