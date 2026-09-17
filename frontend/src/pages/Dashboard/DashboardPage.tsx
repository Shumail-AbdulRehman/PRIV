import {
  MapPin,
  Users,
  ClipboardCheck,
  ArrowRight,
  CircleAlert,
  CalendarCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useGetDashboardLocations } from "./queries";
import { useGetTodayStatus } from "@/pages/Manager/queries";
import type { StaffStatusEntry } from "@/pages/Manager/types";
import { attentionReasons, sortedStaff, staffTodayLink } from "@/pages/Manager/todayPresentation";
import PageHeader from "@/components/common/PageHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import StatCard from "@/components/common/StatCard";
import SurfaceCard from "@/components/common/SurfaceCard";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";

interface DashboardLocation {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  _count?: { staff?: number; taskTemplates?: number };
}
export default function DashboardPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const sites = useGetDashboardLocations();
  const today = useGetTodayStatus();
  const locations: DashboardLocation[] = sites.data?.data ?? [];
  const entries: StaffStatusEntry[] = today.data?.data?.staffStatus ?? [];
  const attention = sortedStaff(entries, true, today.data?.data?.asOf ?? "");
  const summary = today.data?.data?.summary;
  if (sites.isLoading || today.isLoading) return <LoadingSpinner fullScreen />;
  return (
    <div className="space-y-7">
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] || "there"}`}
        subtitle="Here’s how your cleaning operation is looking today."
        action={
          <Button asChild>
            <Link to="/today-status">
              View today
              <ArrowRight size={16} />
            </Link>
          </Button>
        }
      />
      {today.isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5"
        >
          <p className="text-sm">Today’s activity couldn’t be loaded.</p>
          <Button variant="outline" onClick={() => today.refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            label="Staff present"
            value={summary?.present ?? 0}
            hint={`of ${summary?.totalStaff ?? 0} active team members`}
            icon={Users}
          />
          <StatCard
            label="Tasks completed"
            value={summary?.completedTasks ?? 0}
            hint="Today’s completed work"
            icon={ClipboardCheck}
            tone="emerald"
          />
          <StatCard
            label="Tasks in progress"
            value={summary?.inProgressTasks ?? 0}
            hint={`${summary?.pendingTasks ?? 0} still pending`}
            icon={CalendarCheck}
          />
          <StatCard
            label="People to review"
            value={attention.length}
            hint="Attendance or task exceptions"
            icon={CircleAlert}
            tone="amber"
          />
        </div>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[1.35fr_1fr]">
        <SurfaceCard
          title="Your locations"
          description="Open a site to manage its team and cleaning schedule."
        >
          {sites.isError ? (
            <div role="alert">
              <p className="mb-3 text-sm">Locations couldn’t be loaded.</p>
              <Button variant="outline" onClick={() => sites.refetch()}>
                Try again
              </Button>
            </div>
          ) : locations.length ? (
            <>
              {locations.slice(0, 6).map((site) => (
                <Link
                  to={`/locations/${site.id}`}
                  key={site.id}
                  className="workspace-list-link"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#edf1ff] text-primary">
                    <MapPin size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{site.name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {site._count?.staff ?? 0} staff · {site.address}
                    </p>
                  </div>
                  <StatusBadge status={site.isActive ? "ACTIVE" : "INACTIVE"} />
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-muted-foreground"
                  />
                </Link>
              ))}
              <Link
                to="/locations"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                All locations ({locations.length})<ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <div className="py-6">
              <MapPin className="mb-4 text-primary" />
              <h3 className="font-semibold">Set up your first location</h3>
              <p className="mb-5 mt-2 text-sm leading-6 text-muted-foreground">
                Add a site, assign your team, then create their cleaning
                schedule.
              </p>
              <Button asChild>
                <Link to="/locations">Add a location</Link>
              </Button>
            </div>
          )}
        </SurfaceCard>
        <SurfaceCard
          title="Needs your attention"
          description="People with attendance or task exceptions today."
        >
          {today.isError ? (
            <p className="text-sm text-muted-foreground">
              Retry today’s activity above to see exceptions.
            </p>
          ) : attention.length ? (
            <>
              {attention.slice(0, 5).map((entry) => (
                <Link
                  key={entry.staff.id}
                  to={staffTodayLink(entry)}
                  className="workspace-list-link"
                >
                  <span className="workspace-avatar">
                    {entry.staff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{entry.staff.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {attentionReasons(entry, today.data?.data?.asOf ?? "").slice(0, 2).join(" · ") || "Task exception"}{" "}
                      · {entry.staff.location?.name ?? "Unassigned"}
                    </p>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
              <Link
                to="/today-status?view=attention"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                Review all ({attention.length})<ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <div className="py-6">
              <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <ClipboardCheck size={20} />
              </span>
              <p className="font-medium">
                {entries.length
                  ? "Nothing needs your attention"
                  : "Your daily overview starts here"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {entries.length
                  ? "No attendance or task exceptions are recorded right now."
                  : "Once your team is assigned, attendance and task updates will appear here."}
              </p>
            </div>
          )}
        </SurfaceCard>
      </div>
      <div className="flex flex-wrap gap-x-7 gap-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
        <span>Manage your workspace</span>
        <Link className="hover:text-primary" to="/staff">
          Team & shifts →
        </Link>
        <Link className="hover:text-primary" to="/attendance">
          Attendance history →
        </Link>
      </div>
    </div>
  );
}
