import LoadingSpinner from "@/components/common/LoadingSpinner";
import LanguageChoice from "@/components/common/LanguageChoice";
import { WorkspaceTheme } from "@/components/common/WorkspaceTheme";
import { useLanguage } from "@/i18n/context";
import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";
import { useSubscription } from "@/pages/Subscription/queries";
import "@/workspace.css";
import "@/workspace-refresh.css";

const TITLES: Record<string, string> = {
  dashboard: "Overview",
  setup: "Setup",
  "today-status": "Today",
  locations: "Locations",
  staff: "Team",
  attendance: "Attendance",
  managers: "Managers",
  subscription: "Plan & billing",
  exceptions: "Photo Reviews",
  verification: "Task photos",
  areas: "Room",
  settings: "Settings",
};
export default function DashboardLayout() {
  const { t } = useLanguage();
  const subscription = useSubscription();
  const companyName = subscription.data?.company?.name;
  const user = useSelector((s: RootState) => s.auth.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const [section, detail] = pathname.split("/").filter(Boolean);
  useEffect(() => {
    document.title = t(TITLES[section] || "Workspace") + " · Hygene Ops";
    window.scrollTo(0, 0);
  }, [pathname, section, t]);
  return (
    <WorkspaceTheme.Provider value={true}>
      <div className="workspace min-h-screen">
        <a href="#workspace-content" className="workspace-skip">
          {t("Skip to content")}
        </a>
        <Sidebar companyName={companyName} open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="workspace-main">
          <header className="workspace-topbar">
            <div className="workspace-topbar-leading">
              <Button
                variant="ghost"
                size="icon"
                className="workspace-menu-trigger"
                id="workspace-menu-trigger"
                aria-label={t("Open navigation")}
                aria-expanded={isSidebarOpen}
                aria-controls="workspace-mobile-menu"
                aria-haspopup="dialog"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={20} aria-hidden="true" />
              </Button>
              <nav
                aria-label={t("Breadcrumb")}
                className="workspace-breadcrumb"
              >
                <span className="workspace-company-crumb">{companyName || t("Company workspace")}<span aria-hidden="true"> / </span></span>
                <Link
                  to={
                    section === "areas"
                      ? "/locations"
                      : section === "verification"
                        ? "/today-status?tab=tasks"
                        : "/" + section
                  }
                >
                  {t(
                    section === "areas"
                      ? "Locations"
                      : TITLES[section] || "Workspace",
                  )}
                </Link>
                {detail && (
                  <>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span>{t(section === "areas" ? "Room" : "Details")}</span>
                  </>
                )}
              </nav>
            </div>
            <div className="workspace-topbar-tools">
              <LanguageChoice />
              <div className="workspace-topbar-account">
                <span className="workspace-avatar" aria-hidden="true">
                  {user?.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "?"}
                </span>
                <div>
                  <strong>{user?.name}</strong>
                  <small>
                    {t(
                      user?.role === "ADMIN"
                        ? "Company owner"
                        : "Location manager",
                    )}
                  </small>
                </div>
              </div>
            </div>
          </header>
          <main
            id="workspace-content"
            tabIndex={-1}
            className="workspace-content"
          >
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </WorkspaceTheme.Provider>
  );
}
