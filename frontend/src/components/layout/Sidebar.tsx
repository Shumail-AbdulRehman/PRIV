import BrandLogo from "@/components/common/BrandLogo";
import { useLanguage } from "@/i18n/context";
import { Link, NavLink } from "react-router-dom";
import { useExceptionCount } from "@/pages/Exceptions/queries";
import {
  LifeBuoy,
  ListChecks,
  LayoutDashboard,
  MapPin,
  Users,
  UserCog,
  Settings,
  CalendarCheck,
  LogOut,
  ClipboardCheck,
  CreditCard,
  Building2,
  X,
} from "lucide-react";
import { useLogout } from "@/queries/auth";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const WORK = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/today-status", icon: CalendarCheck, label: "Today" },
  { to: "/exceptions", icon: ClipboardCheck, label: "Photo Reviews" },
];
const ORGANIZATION = [
  { to: "/locations", icon: MapPin, label: "Locations" },
  { to: "/staff", icon: Users, label: "Team" },
  { to: "/attendance", icon: CalendarCheck, label: "Attendance" },
];
export default function Sidebar({
  open = false,
  onClose,
  companyName,
}: {
  companyName?: string;
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
    { label: "Daily operations", items: [...WORK, ...ORGANIZATION] },
    { label: "Your organization", items: user?.role === "ADMIN" ? [{to:"/setup",icon:ListChecks,label:"Company setup"}, {to: "/managers", icon: UserCog, label: "Managers"}] : [] },
    {
      label: "Administration",
      items: [
        {to: user?.role === "ADMIN" ? "/settings" : "/account/security", icon: Settings, label: "Settings"},
        ...(user?.role === "ADMIN" ? [{ to: "/subscription", icon: CreditCard, label: "Plan & billing" }] : []),
        {to: "/help", icon: LifeBuoy, label: "Help & account"},
      ],
    },
  ].filter(group => group.items.length);
  const content = (
    <>
      <Link to="/dashboard" onClick={onClose} className="workspace-brand">
        <BrandLogo />
      </Link>
      <div className="workspace-role">
        <span className="workspace-company-monogram" aria-hidden="true">{companyName ? companyName.split(' ').map(word=>word[0]).join('').slice(0,2).toUpperCase() : <Building2 size={18} />}</span>
        <div><strong><bdi>{companyName || t("Company workspace")}</bdi></strong><small>{t(user?.role === "ADMIN" ? "Company workspace" : "Manager workspace")}</small></div>
      </div>
      <nav
        aria-label={t("Workspace navigation")}
        className="workspace-navigation"
      >
        {groups.map((group) => (
          <div className="workspace-nav-group" key={group.label} role="group" aria-label={t(group.label)}>
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn("workspace-nav-link", isActive && "is-active")
                }
              >
                <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
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
        {logout.isError && <p role="alert" className="workspace-signout-error">{t("Sign out failed. Try again.")}</p>}
      </div>
    </>
  );
  return (
    <>
      <aside className="workspace-sidebar workspace-desktop-sidebar">{content}</aside>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) onClose?.();
        }}
      >
        <DialogContent
          id="workspace-mobile-menu"
          className="workspace-mobile-sidebar"
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("workspace-menu-trigger")?.focus();
          }}
        >
          <DialogTitle className="sr-only">{t("Workspace menu")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("Navigate your Hygene Ops workspace.")}
          </DialogDescription>
          <DialogClose asChild><button className="workspace-menu-close" aria-label={t("Close navigation")}><X size={20} aria-hidden="true" /></button></DialogClose>
          {content}
        </DialogContent>
      </Dialog>
    </>
  );
}
