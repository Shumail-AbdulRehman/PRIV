import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Product", href: "/#product" },
  { label: "Features", href: "/features" },
];

export function PublicNavbar() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.slice(1);
    return location.pathname === href;
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-baseline gap-0">
          <span className="font-heading text-xl font-bold tracking-tight text-ink">CleanOps</span>
          <span className="ml-1.5 h-1.5 w-1.5 rounded-none bg-primary" aria-hidden="true" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                isActive(link.href)
                  ? "font-semibold text-ink"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-[1px] left-0 h-[2px] w-full bg-ink" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button
              asChild
              className="h-10 rounded-[2px] border border-ink bg-primary px-5 text-sm font-semibold text-surface hover:bg-primary/90"
            >
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-10 rounded-[2px] px-3 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink/5"
              >
                <Link to="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="h-10 rounded-[2px] border border-ink bg-primary px-5 font-mono text-xs uppercase tracking-wider text-surface hover:bg-primary/90"
              >
                <Link to="/signup">Start now</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-[2px] border border-line bg-surface text-ink md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 font-mono text-xs uppercase tracking-wider ${
                  isActive(link.href)
                    ? "bg-ink text-surface"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-line" />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-[2px] bg-primary px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-surface"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-[2px] px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-ink/70 hover:bg-ink/5 hover:text-ink"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-[2px] bg-primary px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-surface"
                >
                  Start now
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
