import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export function WorkspaceLink({
  className = "marketing-button primary-button",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  return (
    <Link className={className} to={isAuthenticated ? "/dashboard" : "/signup"}>
      {children ?? (isAuthenticated ? "Open your workspace" : "Get started")}
      <ArrowRight size={17} />
    </Link>
  );
}

export function MarketingCTA() {
  return (
    <section className="marketing-container cta-section">
      <div className="marketing-cta">
        <div>
          <span className="section-kicker">
            A little more clarity. A lot less chasing.
          </span>
          <h2>
            Your next shift,
            <br />
            already looking better.
          </h2>
          <p>Give your team a clear plan and yourself a clearer picture.</p>
        </div>
        <div className="cta-actions">
          <WorkspaceLink className="marketing-button white-button" />
          <span>
            <Check size={15} /> Create your account, then choose your plan.
          </span>
        </div>
        <span className="cta-orbit" aria-hidden="true" />
      </div>
    </section>
  );
}
