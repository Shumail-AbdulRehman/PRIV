import type { ReactNode } from "react";

import { ShieldCheck, Sparkles } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef6f6_55%,#f9fbfb_100%)] px-4 py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_20%,rgba(15,118,110,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.14),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden rounded-[2rem] border border-white/70 bg-slate-950 px-8 py-10 text-slate-50 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.55)] lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-6">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="size-7 text-teal-300" />
              </div>
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-300">CleanOps</p>
                <h1 className="max-w-md text-4xl font-semibold tracking-tight">
                  Operational visibility for distributed cleaning teams.
                </h1>
                <p className="max-w-lg text-sm leading-6 text-slate-300">
                  Manage locations, track attendance, and keep recurring tasks visible from one calm control center.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-3xl font-semibold">24/7</p>
                <p className="mt-1 text-sm text-slate-300">Automated task and attendance monitoring</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-teal-300">
                  <Sparkles className="size-4" />
                  <p className="text-sm font-medium">Manager workflow</p>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Built around locations, staff assignment, and daily execution data.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)] backdrop-blur xl:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                CO
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  CleanOps
                </p>
                <p className="text-sm text-muted-foreground">Manager portal</p>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
            </div>
            <div className="mt-8 space-y-6">{children}</div>
            <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
