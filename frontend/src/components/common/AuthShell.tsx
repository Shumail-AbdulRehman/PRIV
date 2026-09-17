import type { ReactNode } from "react";
import {
  CheckCheck,
  MapPin,
  CalendarCheck,
  ClipboardCheck,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="mx-auto grid min-h-[calc(100vh-82px)] max-w-6xl items-start gap-16 lg:items-center px-6 py-12 lg:grid-cols-2 lg:py-16">
        <section className="hidden self-stretch rounded-2xl bg-[#edf1fb] p-12 lg:flex lg:flex-col lg:justify-center">
          <div className="mb-8 flex size-12 items-center justify-center rounded-xl bg-primary text-white">
            <CheckCheck size={28} />
          </div>
          <h2 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight">
            A clearer day
            <br />
            for your whole team.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-muted-foreground">
            Your locations, people, and daily cleaning work. All together in
            CleanOps.
          </p>
          <div className="mt-10 space-y-5">
            {[
              { icon: MapPin, text: "Keep every location organized" },
              { icon: CalendarCheck, text: "Know who’s on site" },
              {
                icon: ClipboardCheck,
                text: "See what’s done and what needs you",
              },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <Icon size={18} className="text-primary" />
                {text}
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto w-full max-w-md py-2">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
          <div className="mt-7 border-t border-border pt-6 text-sm text-muted-foreground">
            {footer}
          </div>
        </section>
      </main>
    </div>
  );
}
