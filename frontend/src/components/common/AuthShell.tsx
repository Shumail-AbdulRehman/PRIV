import { useEffect, type ReactNode } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import AuthWorkspacePreview from "./AuthWorkspacePreview";

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
  useEffect(() => { document.title = `${title} | Hygene Ops`; }, [title]);
  return (
    <div className="min-h-screen bg-white text-[#21334b]">
      <PublicNavbar />
      <main className="mx-auto grid min-h-[calc(100vh-82px)] w-full max-w-[1180px] items-start gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-12 xl:gap-24">
        <AuthWorkspacePreview />
        <section className="mx-auto w-full max-w-md py-2">
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em]">{title}</h1>
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
