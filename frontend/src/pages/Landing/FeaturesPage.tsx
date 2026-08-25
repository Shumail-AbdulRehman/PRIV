import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import type { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/landing/DashboardPanel";
import { VerificationDiagram } from "@/components/landing/VerificationDiagram";

const capabilities = [
  {
    index: "01",
    label: "WORKSPACE & ROLES",
    headline: "One workspace, scoped by role.",
    body: "Admin owns the company tenant. Managers see only assigned locations. Staff see only their shifts and tasks.",
    sample: "roles admin · manager · staff",
  },
  {
    index: "02",
    label: "GEOFENCED ATTENDANCE",
    headline: "Staff check in where the work actually is.",
    body: "GPS capture and geofence radius validation mean you know attendance happened at the location, not five blocks away.",
    sample: "radius 150m · accuracy ±4m",
  },
  {
    index: "03",
    label: "QR TASK STARTS",
    headline: "Tasks begin with a scanned token.",
    body: "Staff scan a QR code at the site to start a task. No manual logging, no disputed start times.",
    sample: "token tkn_8f2a1d3c · started 09:12",
  },
  {
    index: "04",
    label: "PER-AREA VERIFICATION",
    headline: "Photos are scored against reference shots.",
    body: "Each area gets a location match and cleanliness score. If something doesn't match, the reason is shown in plain text.",
    sample: "LOC 94 · CLEAN 91",
  },
  {
    index: "05",
    label: "MOBILE STAFF APP",
    headline: "A focused app for the people doing the work.",
    body: "Staff check in, scan QR codes, capture proof, and see today's tasks from one mobile screen.",
    sample: "platform ios · android",
  },
];

const dashboardRows = [
  { location: "DOWNTOWN TOWER", status: "complete" as const, label: "ON TRACK", detail: "38/42 checked" },
  { location: "METRO MALL", status: "progress" as const, label: "IN PROGRESS", detail: "22/39 done" },
  { location: "RIVERSIDE CLINIC", status: "missed" as const, label: "LATE START", detail: "3 late" },
  { location: "AIRPORT LOUNGE", status: "pending" as const, label: "PENDING", detail: "starts 14:00" },
];

function FeatureHeroDiagram() {
  return (
    <figure className="relative w-full" style={{ aspectRatio: "16/10" }} aria-label="Operational capability diagram">
      <svg viewBox="0 0 320 200" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
        {/* Dashed geofence arc */}
        <path
          d="M 40 160 A 90 90 0 0 1 220 80"
          stroke="var(--line)"
          strokeWidth="1"
          strokeDasharray="6 4"
          fill="none"
        />
        {/* QR token box */}
        <rect x="40" y="40" width="90" height="52" rx="2" stroke="var(--ink)" strokeWidth="1" fill="var(--surface)" />
        <text x="50" y="60" fill="var(--ink)" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.04em">
          QR TOKEN
        </text>
        <rect x="50" y="68" width="50" height="6" rx="1" fill="var(--ink)" opacity="0.2" />
        <rect x="50" y="77" width="70" height="6" rx="1" fill="var(--ink)" opacity="0.2" />

        {/* Location pin */}
        <circle cx="230" cy="110" r="20" stroke="var(--ink)" strokeWidth="1.5" />
        <circle cx="230" cy="110" r="5" fill="var(--primary)" />
        <line x1="230" y1="86" x2="230" y2="92" stroke="var(--ink)" strokeWidth="1" />
        <line x1="230" y1="128" x2="230" y2="134" stroke="var(--ink)" strokeWidth="1" />
        <line x1="206" y1="110" x2="212" y2="110" stroke="var(--ink)" strokeWidth="1" />
        <line x1="248" y1="110" x2="254" y2="110" stroke="var(--ink)" strokeWidth="1" />

        {/* Status tags */}
        <rect x="50" y="130" width="62" height="18" rx="2" stroke="var(--status-pending)" strokeWidth="1" fill="var(--surface)" />
        <text x="59" y="142" fill="var(--status-pending)" fontFamily="var(--font-mono)" fontSize="7" fontWeight="500" letterSpacing="0.04em">
          PENDING
        </text>

        <rect x="125" y="130" width="72" height="18" rx="2" stroke="var(--status-progress)" strokeWidth="1" fill="var(--surface)" />
        <text x="134" y="142" fill="var(--status-progress)" fontFamily="var(--font-mono)" fontSize="7" fontWeight="500" letterSpacing="0.04em">
          IN PROGRESS
        </text>

        <rect x="210" y="150" width="62" height="18" rx="2" stroke="var(--status-complete)" strokeWidth="1" fill="var(--surface)" />
        <text x="219" y="162" fill="var(--status-complete)" fontFamily="var(--font-mono)" fontSize="7" fontWeight="500" letterSpacing="0.04em">
          VERIFIED
        </text>
      </svg>
    </figure>
  );
}

export default function FeaturesPage() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const workspaceTarget = isAuthenticated ? "/dashboard" : "/signup";

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="features-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="var(--ink)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#features-grid)" />
        </svg>

        <div className="relative mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="max-w-xl pt-4">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink/70">
              Features / Operational Capabilities
            </p>
            <h1 className="font-heading mt-5 text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight text-ink">
              GPS, QR tokens, and photo proof. Built for cleaning operations.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-ink/70">
              Track where staff check in, what tasks they start, and whether every area was cleaned, with scores you can explain to a client.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-[2px] border border-ink bg-primary px-6 font-mono text-xs uppercase tracking-wider text-surface hover:bg-primary/90"
              >
                <Link to={workspaceTarget}>
                  Create workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-[2px] border-ink bg-transparent px-6 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink/5"
              >
                <a href="#verification">View verification</a>
              </Button>
            </div>
          </div>

          <div className="relative lg:pt-6">
            <div className="border border-line rounded-[2px] bg-surface p-4">
              <FeatureHeroDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Capability blocks */}
      <section className="border-b border-line px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="divide-y divide-line border-t border-line">
            {capabilities.map((cap) => (
              <div key={cap.index} className="grid gap-4 py-8 sm:grid-cols-12 sm:gap-6">
                <div className="sm:col-span-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                    Capability {cap.index}
                  </p>
                </div>
                <div className="sm:col-span-6">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink">
                    {cap.headline}
                  </h2>
                  <p className="mt-2 max-w-lg text-base leading-7 text-ink/70">{cap.body}</p>
                </div>
                <div className="sm:col-span-4 sm:text-right">
                  <span className="font-mono text-xs text-primary">{cap.sample}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full verification section */}
      <section id="verification" className="border-b border-line px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink/70">
            Photo Verification
          </p>
          <h2 className="font-heading mt-3 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-tight text-ink">
            Two verification modes. Scored per area. Reasoning logged.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/70">
            CleanOps doesn't just store photos. It compares staff proof against reference images and returns a location-match score, a cleanliness-match score, and a short reasoning line for each area.
          </p>
          <div className="mt-8">
            <VerificationDiagram />
          </div>
        </div>
      </section>

      {/* Instrument panel preview */}
      <section className="border-b border-line px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink/70">
                Live Panel
              </p>
              <h2 className="font-heading mt-3 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-tight text-ink">
                Updated as staff work.
              </h2>
              <p className="mt-4 text-lg leading-8 text-ink/70">
                Every check-in, QR scan, and completed task feeds into the same dashboard. Managers see the current state without waiting for end-of-day reports.
              </p>
              <div className="mt-6 grid gap-2 font-mono text-xs text-ink/70">
                <p>data_source mobile_app_events</p>
                <p>refresh_interval real_time</p>
                <p>exception_alert late_start missed_checkout</p>
              </div>
            </div>
            <DashboardPanel rows={dashboardRows} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-ink">
            Start running verified operations.
          </h2>
          <p className="mt-4 text-base leading-7 text-ink/70">
            Create a workspace, add your first location, and invite your staff.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-[2px] border border-ink bg-primary px-6 font-mono text-xs uppercase tracking-wider text-surface hover:bg-primary/90"
            >
              <Link to={workspaceTarget}>Create workspace</Link>
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
