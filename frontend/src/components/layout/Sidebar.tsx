import BrandLogo from "@/components/common/BrandLogo";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Users,
  UserCog,
  CalendarCheck,
  LogOut,
  ClipboardCheck,
  CreditCard,
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

const GROUPS = [
  {
    label: "Workspace",
    items: [
      {
        to: "/dashboard",
        icon: LayoutDashboard,
        label: "Overview",
        adminOnly: false,
      },
      {
        to: "/today-status",
        icon: ClipboardCheck,
        label: "Today",
        adminOnly: false,
      },
      { to: "/locations", icon: MapPin, label: "Locations", adminOnly: false },
      { to: "/staff", icon: Users, label: "Team", adminOnly: false },
      {
        to: "/attendance",
        icon: CalendarCheck,
        label: "Attendance",
        adminOnly: false,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/managers", icon: UserCog, label: "Managers", adminOnly: true },
      {
        to: "/subscription",
        icon: CreditCard,
        label: "Plan & billing",
        adminOnly: false,
      },
    ],
  },
];

export default function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const user = useSelector((s: RootState) => s.auth.user);
  const logout = useLogout();
  const content = (
    <>
      <Link to="/dashboard" onClick={onClose} className="workspace-brand">
        <BrandLogo /><span className="sr-only"> overview</span>
      </Link>
      <nav aria-label="Workspace navigation" className="flex-1 space-y-7 py-8">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items
                .filter((item) => !item.adminOnly || user?.role === "ADMIN")
                .map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn("workspace-nav-link", isActive && "is-active")
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-3 px-2 pb-3">
          <span className="workspace-avatar">
            {user?.name
              ?.split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {user?.role === "ADMIN" ? "Administrator" : "Manager"}
            </p>
          </div>
        </div>
        <button
          className="workspace-nav-link w-full"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOut size={17} />
          {logout.isPending ? "Signing out…" : "Sign out"}
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
          <DialogTitle className="sr-only">Workspace menu</DialogTitle>
          <DialogDescription className="sr-only">
            Navigate your Hygene Ops workspace.
          </DialogDescription>
          {content}
        </DialogContent>
      </Dialog>
    </>
  );
}
