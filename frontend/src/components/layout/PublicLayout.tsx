import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { PublicNavbar } from "./PublicNavbar";
import { BrandMark } from "@/components/marketing/ProductVisuals";

export function PublicLayout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    } else window.scrollTo({ top: 0, behavior: "instant" });
    const titles: Record<string, string> = {
      "/": "CleanOps | A clearer day for your cleaning business",
      "/features": "Features | CleanOps",
      "/pricing": "Simple plans for cleaning teams | CleanOps",
    };
    document.title = titles[pathname] ?? "CleanOps";
  }, [pathname, hash]);
  return (
    <div className="marketing-site">
      <a href="#main-content" className="marketing-skip">
        Skip to content
      </a>
      <PublicNavbar />
      <main id="main-content">
        <Outlet />
      </main>
      <footer className="marketing-footer">
        <div className="marketing-container">
          <div className="footer-main">
            <div className="footer-intro">
              <Link to="/" className="marketing-brand">
                <BrandMark />
                CleanOps
              </Link>
              <p>
                Great work starts with a clear plan.
                <br />
                The home for your cleaning operation.
              </p>
              <span className="footer-made">
                Built around your working day.
              </span>
            </div>
            <div>
              <h3>Product</h3>
              <Link to="/features">Explore features</Link>
              <Link to="/pricing">Plans & pricing</Link>
              <Link to="/features#attendance">Staff attendance</Link>
              <Link to="/features#verification">Photo verification</Link>
            </div>
            <div>
              <h3>Your workspace</h3>
              <Link to="/signup">
                Create an account <ArrowUpRight size={13} />
              </Link>
              <Link to="/login">Log in</Link>
              <Link to="/features#how-it-works">How it works</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} CleanOps. All rights reserved.
            </span>
            <span>Less admin. More peace of mind.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
