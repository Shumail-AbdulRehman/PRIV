import WorkspaceBrand from "@/components/common/WorkspaceBrand";
import { useLanguage } from "@/i18n/context";
import { Link, NavLink } from "react-router-dom";
import { useExceptionCount } from "@/pages/Exceptions/queries";
import {
  LayoutDashboard,
  MapPin,
  Users,
  UserCog,
  CalendarCheck,
  LogOut,
  ClipboardCheck,
  CreditCard,
  Leaf,
} from "lucide-react";
import { useLogout } from "@/queries/auth";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const WORK = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/today-status", icon: CalendarCheck, label: "Today" },
  { to: "/exceptions", icon: ClipboardCheck, label: "Reviews" },
];
const ORGANIZATION = [
  { to: "/locations", icon: MapPin, label: "Locations" },
  { to: "/staff", icon: Users, label: "Team" },
  { to: "/attendance", icon: CalendarCheck, label: "Attendance" },
];
export default function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const { t } = useLanguage();
  const user = useSelector((s: RootState) => s.auth.user);
  const logout = useLogout();
  const exceptions = useExceptionCount(
    user?.role === "ADMIN" || user?.role === "MANAGER",
  );
  const groups = [
    { label: "Daily operations", items: WORK },
    { label: "Your organization", items: ORGANIZATION },
    {
      label: "Administration",
      items: [
        ...(user?.role === "ADMIN"
          ? [{ to: "/managers", icon: UserCog, label: "Managers" }]
          : []),
        { to: "/subscription", icon: CreditCard, label: "Plan & billing" },
      ],
    },
  ];
  const content = (
    <>
      <Link to="/dashboard" onClick={onClose} className="workspace-brand">
        <WorkspaceBrand />
      </Link>
      <p className="workspace-brand-caption">{t("Cleaning operations")}</p>
      <div className="workspace-role">
        <Leaf size={15} />
        <span>
          {t(
            user?.role === "ADMIN" ? "Company workspace" : "Manager workspace",
          )}
        </span>
      </div>
      <nav
        aria-label={t("Workspace navigation")}
        className="workspace-navigation"
      >
        {groups.map((group) => (
          <div className="workspace-nav-group" key={group.label}>
            <p className="workspace-nav-label">{t(group.label)}</p>
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn("workspace-nav-link", isActive && "is-active")
                }
              >
                <Icon size={19} strokeWidth={1.75} />
                <span>{t(label)}</span>
                {to === "/exceptions" && !!exceptions.data?.total ? (
                  <span
                    className="workspace-nav-count"
                    aria-label={
                      exceptions.data.total + " " + t("Waiting for review")
                    }
                  >
                    {exceptions.data.total > 99 ? "99+" : exceptions.data.total}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="workspace-sidebar-footer">
        <div className="workspace-sidebar-note">
          <span className="workspace-note-mark">
            <Leaf size={20} />
          </span>
          <p>
            {t("Cleaner spaces.")}
            <br />
            <strong>{t("A clearer working day.")}</strong>
          </p>
        </div>
        <div className="workspace-sidebar-account">
          <span className="workspace-avatar">
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
              {t(user?.role === "ADMIN" ? "Company owner" : "Location manager")}
            </small>
          </div>
        </div>
        <button
          className="workspace-nav-link workspace-signout"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOut size={17} />
          {t(logout.isPending ? "Signing out…" : "Sign out")}
        </button>
      </div>
    </>
  );
  return (
    <>
      <aside className="workspace-sidebar hidden lg:flex">{content}</aside>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) onClose?.();
        }}
      >
        <DialogContent
          className="workspace-mobile-sidebar"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("workspace-menu-trigger")?.focus();
          }}
        >
          <DialogTitle className="sr-only">{t("Workspace menu")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("Navigate your Hygene Ops workspace.")}
          </DialogDescription>
          {content}
        </DialogContent>
      </Dialog>
    </>
  );
}
