import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MapPin,
  QrCode,
  Smartphone,
  Users,
} from "lucide-react";

import cleaningOperations from "@/assets/cleaning-operations.jpg";
import type { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";

const productCapabilities = [
  {
    title: "Location and staff management",
    copy: "Create sites, assign teams, set shift windows, and keep each worker connected to the right cleaning location.",
  },
  {
    title: "Attendance that proves presence",
    copy: "Staff check in and out from the mobile app with location data and photos, so managers can trust the record.",
  },
  {
    title: "Recurring work without spreadsheets",
    copy: "Turn daily or one-time cleaning templates into trackable tasks with status, timing, and proof images.",
  },
  {
    title: "Manager review in one console",
    copy: "See late arrivals, missed checkouts, unfinished work, and completed evidence without chasing messages.",
  },
];

const serviceItems = [
  "Manager dashboard for locations, staff, task templates, attendance, and today status.",
  "Staff mobile app for check-in, checkout, QR task starts, and proof uploads.",
  "Geofencing, late status, missed checkout status, and task completion evidence.",
  "Deployment-ready backend, database schema, Docker setup, and frontend apps.",
];

const workflow = [
  ["Plan", "Add sites, shifts, staff, and recurring cleaning templates."],
  ["Start", "Staff check in from the mobile app when they arrive at the assigned location."],
  ["Verify", "QR scans and photo proof confirm that task work happened on site."],
  ["Review", "Managers use today status and reports to handle exceptions quickly."],
];

export default function LandingPage() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const workspaceTarget = isAuthenticated ? "/dashboard" : "/signup";

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.006_235)] font-sans text-[oklch(0.22_0.032_245)]">
      <header className="sticky top-0 z-30 border-b border-[oklch(0.88_0.018_235)] bg-[oklch(0.99_0.004_235)]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.52_0.16_245)] text-sm font-semibold text-[oklch(0.99_0.004_235)] shadow-[0_14px_32px_-22px_oklch(0.52_0.16_245)]">
              CO
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight text-[oklch(0.22_0.032_245)]">CleanOps</span>
              <span className="block text-xs text-[oklch(0.48_0.035_245)]">Cleaning operations software</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[oklch(0.42_0.04_245)] md:flex">
            <a href="#product" className="transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[oklch(0.48_0.18_245)]">
              Product
            </a>
            <a href="#services" className="transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[oklch(0.48_0.18_245)]">
              Services
            </a>
            <a href="#workflow" className="transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[oklch(0.48_0.18_245)]">
              Workflow
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden h-10 rounded-full px-4 text-[oklch(0.35_0.05_245)] sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="group h-10 rounded-full bg-[oklch(0.52_0.16_245)] px-4 text-[oklch(0.99_0.004_235)] hover:bg-[oklch(0.46_0.18_245)]">
              <Link to={workspaceTarget}>
                {isAuthenticated ? "Open dashboard" : "Start now"}
                <span className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.99_0.004_235)]/15 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid min-h-[calc(100dvh-81px)] max-w-7xl gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <div className="max-w-2xl">
              <h1 className="max-w-3xl text-[clamp(2.75rem,4.8vw,5.35rem)] font-semibold leading-[0.98] tracking-tight text-[oklch(0.2_0.04_245)]">
                Cleaning work, controlled from one clear system.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[oklch(0.44_0.035_245)] sm:text-lg">
                CleanOps helps cleaning companies manage sites, staff attendance, recurring work, QR task starts,
                and proof photos without spreadsheet follow-ups or scattered WhatsApp messages.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="group h-11 rounded-full bg-[oklch(0.52_0.16_245)] px-5 text-base font-semibold text-[oklch(0.99_0.004_235)] hover:bg-[oklch(0.46_0.18_245)]">
                  <Link to={workspaceTarget}>
                    {isAuthenticated ? "Go to dashboard" : "Create workspace"}
                    <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.99_0.004_235)]/16 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full border-[oklch(0.82_0.035_245)] bg-[oklch(0.99_0.004_235)] px-5 text-base font-semibold text-[oklch(0.3_0.06_245)] hover:bg-[oklch(0.95_0.02_240)]">
                  <Link to="/login">Manager login</Link>
                </Button>
              </div>

              <div className="mt-7 grid max-w-2xl gap-4 border-y border-[oklch(0.86_0.02_235)] py-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-[oklch(0.24_0.05_245)]">Geofenced attendance</p>
                  <p className="mt-1 text-sm leading-5 text-[oklch(0.48_0.035_245)]">Staff records stay tied to the assigned site.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[oklch(0.24_0.05_245)]">Photo evidence</p>
                  <p className="mt-1 text-sm leading-5 text-[oklch(0.48_0.035_245)]">Check-in, checkout, and task proof are visible later.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[oklch(0.24_0.05_245)]">Daily review</p>
                  <p className="mt-1 text-sm leading-5 text-[oklch(0.48_0.035_245)]">Managers see exceptions while the day is still active.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-5 top-10 hidden h-24 w-24 rounded-full bg-[oklch(0.83_0.09_235)]/45 lg:block" />
              <figure className="relative overflow-hidden rounded-[2rem] bg-[oklch(0.93_0.016_235)] p-2 shadow-[0_28px_90px_-58px_oklch(0.32_0.08_245)]">
                <img
                  src={cleaningOperations}
                  alt="Cleaning staff using floor equipment at a managed location"
                  className="aspect-[16/11] max-h-[calc(100dvh-145px)] w-full rounded-[1.5rem] object-cover object-center"
                />
              </figure>
            </div>
          </div>
        </section>

        <section id="product" className="bg-[oklch(0.99_0.004_235)] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
              <div>
                <p className="text-sm font-semibold text-[oklch(0.48_0.15_245)]">Product</p>
                <h2 className="mt-4 max-w-xl text-[clamp(2.25rem,4vw,4.5rem)] font-semibold leading-[1.02] tracking-tight text-[oklch(0.2_0.04_245)]">
                  The operating layer for cleaning teams.
                </h2>
              </div>

              <div className="divide-y divide-[oklch(0.88_0.018_235)] border-y border-[oklch(0.88_0.018_235)]">
                {productCapabilities.map((item, index) => (
                  <article key={item.title} className="grid gap-5 py-7 sm:grid-cols-[4rem_1fr]">
                    <span className="text-sm font-semibold text-[oklch(0.55_0.14_245)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-[oklch(0.22_0.04_245)]">{item.title}</h3>
                      <p className="mt-2 max-w-2xl text-base leading-7 text-[oklch(0.46_0.035_245)]">{item.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div className="rounded-[2rem] bg-[oklch(0.94_0.018_235)] p-2">
              <div className="rounded-[1.45rem] bg-[oklch(0.99_0.004_235)] p-5 shadow-[inset_0_1px_0_oklch(1_0_0/0.75)]">
                <div className="flex items-center justify-between gap-4 border-b border-[oklch(0.88_0.018_235)] pb-5">
                  <div>
                    <p className="text-sm font-medium text-[oklch(0.5_0.04_245)]">Today status</p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[oklch(0.22_0.04_245)]">Manager view</h3>
                  </div>
                  <span className="rounded-full bg-[oklch(0.93_0.04_150)] px-3 py-1 text-sm font-medium text-[oklch(0.42_0.11_150)]">
                    Live shift
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["Attendance window", "38 checked in, 4 not started", Users],
                    ["Site task queue", "17 pending, 22 completed", ClipboardCheck],
                    ["Proof review", "12 new image submissions", Camera],
                    ["Exceptions", "3 late starts need review", Clock3],
                  ].map(([title, status, Icon]) => (
                    <div key={title as string} className="flex items-center justify-between gap-5 rounded-2xl bg-[oklch(0.97_0.01_235)] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.91_0.04_240)] text-[oklch(0.48_0.15_245)]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-[oklch(0.25_0.04_245)]">{title as string}</span>
                      </div>
                      <span className="text-right text-sm text-[oklch(0.48_0.035_245)]">{status as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[oklch(0.48_0.15_245)]">Manager dashboard plus staff app</p>
              <h2 className="mt-4 max-w-2xl text-[clamp(2.25rem,4vw,4.4rem)] font-semibold leading-[1.02] tracking-tight text-[oklch(0.2_0.04_245)]">
                Built around the handoff between office and field.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[oklch(0.45_0.035_245)]">
                Office teams define the plan. Field staff execute from mobile. CleanOps keeps both sides aligned
                through the same attendance, task, and evidence records.
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {[
                  [Smartphone, "Mobile check-in/out"],
                  [QrCode, "QR task start"],
                  [MapPin, "Location radius"],
                  [BarChart3, "Status reporting"],
                ].map(([Icon, label]) => (
                  <div key={label as string} className="flex items-center gap-3 text-base font-medium text-[oklch(0.28_0.05_245)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(0.91_0.04_240)] text-[oklch(0.48_0.15_245)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label as string}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-[oklch(0.23_0.055_245)] px-4 py-24 text-[oklch(0.98_0.006_235)] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-sm font-medium text-[oklch(0.78_0.09_235)]">What the solution provides</p>
                <h2 className="mt-4 max-w-xl text-[clamp(2.25rem,4vw,4.4rem)] font-semibold leading-[1.02] tracking-tight">
                  Practical software for cleaning companies, not a generic admin panel.
                </h2>
              </div>

              <div className="divide-y divide-[oklch(0.98_0.006_235/0.16)] border-y border-[oklch(0.98_0.006_235/0.16)]">
                {serviceItems.map((item) => (
                  <div key={item} className="flex gap-4 py-5">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[oklch(0.78_0.12_235)]" />
                    <p className="max-w-2xl text-base leading-7 text-[oklch(0.9_0.015_235)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-[oklch(0.99_0.004_235)] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[oklch(0.48_0.15_245)]">Workflow</p>
              <h2 className="mt-4 text-[clamp(2.25rem,4vw,4.4rem)] font-semibold leading-[1.02] tracking-tight text-[oklch(0.2_0.04_245)]">
                From scheduled work to verified completion.
              </h2>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-4">
              {workflow.map(([title, copy], index) => (
                <article key={title} className="relative border-t border-[oklch(0.84_0.03_240)] pt-6">
                  <span className="absolute -top-3 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.52_0.16_245)] text-xs font-semibold text-[oklch(0.99_0.004_235)]">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight text-[oklch(0.22_0.04_245)]">{title}</h3>
                  <p className="mt-3 text-base leading-7 text-[oklch(0.46_0.035_245)]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-[oklch(0.94_0.018_235)] p-2">
            <div className="rounded-[1.45rem] bg-[oklch(0.52_0.16_245)] px-6 py-10 text-[oklch(0.99_0.004_235)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[oklch(0.99_0.004_235)]/14 px-3 py-1.5 text-sm font-medium">
                  <Check className="h-4 w-4" />
                  Ready to run real cleaning operations
                </div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Give managers visibility and give staff a simple mobile workflow.
                </h2>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0">
                <Button asChild className="group h-12 rounded-full bg-[oklch(0.99_0.004_235)] px-6 text-base font-semibold text-[oklch(0.34_0.1_245)] hover:bg-[oklch(0.95_0.02_240)]">
                  <Link to={workspaceTarget}>
                    Get started
                    <span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(0.52_0.16_245)]/12 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full border-[oklch(0.99_0.004_235)]/32 bg-transparent px-6 text-base font-semibold text-[oklch(0.99_0.004_235)] hover:bg-[oklch(0.99_0.004_235)]/12">
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[oklch(0.88_0.018_235)] bg-[oklch(0.99_0.004_235)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[oklch(0.48_0.035_245)] sm:flex-row">
          <p className="font-semibold text-[oklch(0.22_0.04_245)]">CleanOps</p>
          <p>Cleaning operations software for managers and field teams.</p>
        </div>
      </footer>
    </div>
  );
}
