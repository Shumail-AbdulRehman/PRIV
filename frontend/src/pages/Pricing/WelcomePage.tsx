import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/store/store";

export default function WelcomePage() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl border border-line bg-surface p-7 sm:p-12">
        <CheckCircle2 className="h-10 w-10 text-status-complete" aria-hidden="true" />
        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">Checkout complete</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Welcome to CleanOps.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-ink/65">
          Your payment was accepted and your subscription is being prepared. Continue to your workspace to run your cleaning operation.
        </p>
        <Button asChild className="mt-8 h-12 rounded-[2px] border border-ink bg-primary px-6 font-mono text-xs uppercase tracking-wider text-surface">
          <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
            {isAuthenticated ? "Open dashboard" : "Create your workspace"}
          </Link>
        </Button>
      </div>
    </section>
  );
}
