import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { PaddlePricing } from "./PaddlePricing";

export default function PricingPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const managerCannotSubscribe = user?.role === "MANAGER" || user?.role === "STAFF";

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]" aria-hidden="true">
          <defs>
            <pattern id="pricing-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="var(--ink)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pricing-grid)" />
        </svg>
        <div className="relative mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink/65">
            CleanOps / Plans
          </p>
          <div className="mt-5 grid gap-7 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <h1 className="max-w-4xl font-heading text-[clamp(2.5rem,6vw,5.25rem)] font-bold leading-[0.96] tracking-tight text-ink">
              Match the system to your operation.
            </h1>
            <p className="max-w-md text-base leading-7 text-ink/65 lg:pb-1">
              Start with the capacity you need today. Every plan includes the core attendance, task, and verification workflow, with a 7-day free trial.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PaddlePricing
            email={user?.email}
            companyId={user?.companyId}
            subscribeDisabled={managerCannotSubscribe}
            disabledMessage="Only the company administrator can subscribe for this workspace."
          />
        </div>
      </section>
    </div>
  );
}
