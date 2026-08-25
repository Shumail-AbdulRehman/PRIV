import { Link, Outlet } from "react-router-dom";
import { PublicNavbar } from "./PublicNavbar";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans text-ink antialiased">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-surface px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-baseline gap-0">
                <span className="font-heading text-lg font-bold tracking-tight text-ink">CleanOps</span>
                <span className="ml-1.5 h-1.5 w-1.5 rounded-none bg-primary" aria-hidden="true" />
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/70">
                Operational software for cleaning companies: locations, staff shifts, geofenced attendance, and photo-verified tasks.
              </p>
              <p className="mt-3 font-mono text-xs text-ink/60">
                24.8607°N 67.0011°E
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink">Home</p>
              <ul className="mt-4 space-y-2.5">
                <li><Link to="/" className="text-sm text-ink/70 hover:text-ink">Home</Link></li>
                <li><Link to="/features" className="text-sm text-ink/70 hover:text-ink">Features</Link></li>
                <li><Link to="/features#verification" className="text-sm text-ink/70 hover:text-ink">Verification</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink">Account</p>
              <ul className="mt-4 space-y-2.5">
                <li><Link to="/login" className="text-sm text-ink/70 hover:text-ink">Log in</Link></li>
                <li><Link to="/signup" className="text-sm text-ink/70 hover:text-ink">Create workspace</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink">System</p>
              <ul className="mt-4 space-y-2.5">
                <li className="font-mono text-sm text-status-complete">Status: Operational</li>
                <li className="font-mono text-sm text-ink/70">Region: PKT</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-line pt-6 font-mono text-xs text-ink/60 sm:flex-row">
            <p>© {new Date().getFullYear()} CleanOps</p>
            <p>Built for cleaning operations</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
