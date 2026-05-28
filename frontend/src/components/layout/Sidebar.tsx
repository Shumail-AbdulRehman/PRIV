import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Users,
  CalendarCheck,
  LogOut,
  X,
  ClipboardCheck,
} from "lucide-react";
import { useLogout } from "@/queries/auth";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/today-status", icon: ClipboardCheck, label: "Today Status" },
  { to: "/locations", icon: MapPin, label: "Locations" },
  { to: "/staff", icon: Users, label: "Staff" },
  { to: "/attendance", icon: CalendarCheck, label: "Attendance" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const user = useSelector((s: RootState) => s.auth.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(240,249,255,0.96))] px-4 py-5 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
              CO
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">CleanOps</p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Ops console</p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-5 rounded-3xl border border-border/70 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Workspace</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{user?.role === "MANAGER" ? "Manager panel" : "Staff panel"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Track locations, staff assignments, attendance, and task completion.
          </p>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-foreground",
                )
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 rounded-3xl border border-border/70 bg-white/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name ?? "Manager"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout.mutate(undefined, {
                onSuccess: () => navigate("/login"),
              });
            }}
            disabled={logout.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/70 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            {logout.isPending ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>
    </>
  );
}
