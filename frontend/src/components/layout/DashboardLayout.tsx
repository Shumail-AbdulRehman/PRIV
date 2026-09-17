import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, ArrowUpRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";
import "@/workspace.css";

const TITLES: Record<string, string> = {
  dashboard: "Overview",
  "today-status": "Today",
  locations: "Locations",
  staff: "Team",
  attendance: "Attendance",
  managers: "Managers",
  subscription: "Plan & billing",
};
export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const [section, detail] = pathname.split("/").filter(Boolean);
  useEffect(() => {
    document.title = `${TITLES[section] || "Workspace"} · CleanOps`;
    window.scrollTo(0, 0);
  }, [pathname, section]);
  return (
    <div className="workspace min-h-screen">
      <a href="#workspace-content" className="workspace-skip">
        Skip to content
      </a>
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="lg:pl-60">
        <header className="workspace-topbar">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              id="workspace-menu-trigger"
              aria-label="Open navigation"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm"
            >
              <Link
                to={`/${section}`}
                className="text-muted-foreground hover:text-primary"
              >
                {TITLES[section] || "Workspace"}
              </Link>
              {detail && (
                <>
                  <ChevronRight size={14} />
                  <span>Details</span>
                </>
              )}
            </nav>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            View website
            <ArrowUpRight size={14} />
          </Link>
        </header>
        <main
          id="workspace-content"
          tabIndex={-1}
          className="workspace-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
