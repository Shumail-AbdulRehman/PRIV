import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import type { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import heroCleaning from "@/assets/hero-cleaning-v2.webp";
import { DashboardPanel } from "@/components/landing/DashboardPanel";
import { LifecycleStrip } from "@/components/landing/LifecycleStrip";
import { VerificationDiagram } from "@/components/landing/VerificationDiagram";

const components = [
  {
    index: "01",
    label: "LOCATIONS",
    headline: "Sites with GPS and geofence radius",
    body: "Every location stores coordinates, radius, and timezone. Staff must be inside the fence to check in.",
    sample: "24.8607°N",
  },
  {
    index: "02",
    label: "STAFF",
    headline: "Shifts assigned to locations",
    body: "Staff accounts are tied to shift windows and locations. Managers only see their own assignments.",
    sample: "shift 09:00–17:00",
  },
  {
    index: "03",
    label: "TASKS",
    headline: "Recurring tasks with QR tokens",
    body: "Daily task instances are generated from templates. Each template has a unique QR token for verified starts.",
    sample: "qr tkn_8f2a",
  },
  {
    index: "04",
    label: "VERIFICATION",
    headline: "Per-area photo scoring",
    body: "Reference and submitted photos are compared per area. The result is a location match, cleanliness match, and a reason.",
    sample: "score 94/91",
  },
];

const dashboardRows = [
  { location: "DOWNTOWN TOWER", status: "complete" as const, label: "ON TRACK", detail: "38/42 checked" },
  { location: "METRO MALL", status: "progress" as const, label: "IN PROGRESS", detail: "22/39 done" },
  { location: "RIVERSIDE CLINIC", status: "missed" as const, label: "LATE START", detail: "3 late" },
];

export default function LandingPage() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const workspaceTarget = isAuthenticated ? "/dashboard" : "/signup";
  const ctaLabel = isAuthenticated ? "Open dashboard" : "Create workspace";

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* Blueprint grid */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="blueprint-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="var(--ink)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        </svg>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink/70">
              CleanOps / Operations System
            </p>
            <h1 className="font-heading mt-5 text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[0.98] tracking-tight text-ink">
              Run cleaning operations with proof, not promises.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-ink/70">
              CleanOps gives cleaning companies one system for locations, staff shifts, geofenced attendance, recurring tasks, and photo verification with scored, explainable results per area.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-[2px] border border-ink bg-primary px-6 font-mono text-xs uppercase tracking-wider text-surface hover:bg-primary/90"
              >
                <Link to={workspaceTarget}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-[2px] border-ink bg-transparent px-6 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink/5"
              >
                <Link to="/features">See features</Link>
              </Button>
            </div>

            {/* Mono status lines */}
            <div className="mt-8 font-mono text-sm leading-7 text-ink">
              <p>&gt; location 24.8607°N 67.0011°E</p>
              <p>&gt; qr_token tkn_8f2a1d3c</p>
              <p>
                &gt; status LIVE<span className="inline-block w-[0.6em] cursor-blink bg-primary" aria-hidden="true">_</span>
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden border border-line rounded-[2px] bg-surface">
              <img
                src={heroCleaning}
                alt="Professional floor cleaning equipment on a polished office floor"
                className="h-full w-full object-cover"
                style={{ aspectRatio: "4/3" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* System Components */}
      <section id="product" className="border-b border-line px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink/70">
            01 / System Components
          </p>
          <div className="mt-8 divide-y divide-line border-t border-line">
            {components.map((item) => (
              <div
                key={item.index}
                className="grid gap-4 py-6 sm:grid-cols-12 sm:gap-6 sm:py-7"
              >
                <div className="sm:col-span-1">
                  <span className="font-mono text-xs text-ink/50">{item.index}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-ink/70">{item.label}</span>
                </div>
                <div className="sm:col-span-6">
                  <h3 className="font-heading text-xl font-semibold tracking-tight text-ink">
                    {item.headline}
                  </h3>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-ink/70">{item.body}</p>
                </div>
                <div className="sm:col-span-3 sm:text-right">
                  <span className="font-mono text-xs text-primary">{item.sample}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard mockup + Reporting text */}
      <section className="border-b border-line px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <DashboardPanel rows={dashboardRows} />
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink/70">
                Reporting
              </p>
              <h2 className="font-heading mt-3 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-tight text-ink">
                See exceptions while the day is still active.
              </h2>
              <p className="mt-4 text-lg leading-8 text-ink/70">
                The Today Status view shows attendance counts, pending tasks, proof submissions, and late starts as they happen, not in tomorrow's spreadsheet.
              </p>
              <div className="mt-6 grid gap-2 font-mono text-xs text-ink/70">
                <p>mobile_check_in selfie + GPS</p>
                <p>qr_task_start location token scan</p>
                <p>shift_window 09:00–17:00</p>
                <p>status_report real-time exceptions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle strip */}
      <section className="border-b border-line px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink/70">
            Execution Flow
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-ink">
            From QR scan to scored proof.
          </h2>
          <div className="mt-8">
            <LifecycleStrip />
          </div>
        </div>
      </section>

      {/* Verification preview */}
      <section id="verification" className="border-b border-line px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink/70">
            02 / Photo Verification
          </p>
          <h2 className="font-heading mt-3 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-tight text-ink">
            Every area is scored. Every score is explainable.
          </h2>
          <div className="mt-8 max-w-4xl">
            <VerificationDiagram />
          </div>
          <div className="mt-6">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-[2px] border-ink bg-transparent px-5 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink/5"
            >
              <Link to="/features">See how verification works →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-ink">
            Ready to run cleaner operations?
          </h2>
          <p className="mt-4 text-base leading-7 text-ink/70">
            Set up your workspace, add locations and staff, and start tracking attendance and tasks with verified proof.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-[2px] border border-ink bg-primary px-6 font-mono text-xs uppercase tracking-wider text-surface hover:bg-primary/90"
            >
              <Link to={workspaceTarget}>{ctaLabel}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-[2px] border-ink bg-transparent px-6 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink/5"
            >
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
