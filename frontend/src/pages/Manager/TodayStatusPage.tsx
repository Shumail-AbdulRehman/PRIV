import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarCheck,
  Clock3,
  MapPin,
  Search,
  Users,
  CircleAlert,
  RefreshCw,
} from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import SurfaceCard from "@/components/common/SurfaceCard";
import FilterBar from "@/components/common/FilterBar";
import DataTable, { type Column } from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetTodayStatus } from "./queries";
import { formatInTimeZone } from "date-fns-tz";

import type { StaffStatusEntry } from "./types";
import { attentionReasons, needsAttention, sortedStaff, staffTodayLink } from "./todayPresentation";

type AttendanceFilter =
  "all" | "present" | "absent" | "late" | "shift-not-started";
type TaskFilter = "all" | "pending" | "in-progress" | "completed" | "attention";

const fmtTime = (value: string | null, timeZone = "UTC") => {
  if (!value) return "—";
  return formatInTimeZone(new Date(value), timeZone, "HH:mm");
};

export default function TodayStatusPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const attentionOnly = searchParams.get("view") === "attention";
  const [locationId, setLocationId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] =
    useState<AttendanceFilter>("all");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");

  const filters = useMemo(
    () => ({
      locationId: locationId === "all" ? undefined : Number(locationId),
    }),
    [locationId],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetTodayStatus(filters);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (isError)
    return (
      <div role="alert" className="space-y-4">
        <PageHeader
          title="Today"
          subtitle="Today’s activity could not be loaded."
        />
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );

  const payload = data?.data;
  const summary = payload?.summary;
  const locations = payload?.locations ?? [];
  const staffStatus: StaffStatusEntry[] = payload?.staffStatus ?? [];
  const asOf: string = payload?.asOf ?? payload?.date ?? "";
  const attentionCount = staffStatus.filter(needsAttention).length;
  const hasFilters = Boolean(search || locationId !== "all" || attendanceFilter !== "all" || taskFilter !== "all");

  const filteredStaff = sortedStaff(staffStatus, attentionOnly, asOf).filter((entry) => {
    const query = search.trim().toLocaleLowerCase();
    const matchesSearch =
      entry.staff.name.toLocaleLowerCase().includes(query) ||
      entry.staff.email.toLocaleLowerCase().includes(query);

    const matchesAttendance =
      attendanceFilter === "all" ||
      (attendanceFilter === "present" && entry.flags.isPresent) ||
      (attendanceFilter === "absent" && entry.flags.isAbsent) ||
      (attendanceFilter === "late" && entry.flags.isLateAttendance) ||
      (attendanceFilter === "shift-not-started" &&
        entry.flags.isShiftNotStarted);

    const matchesTask =
      taskFilter === "all" ||
      (taskFilter === "pending" && entry.taskCounts.pending > 0) ||
      (taskFilter === "in-progress" && entry.taskCounts.inProgress > 0) ||
      (taskFilter === "completed" && entry.taskCounts.completed > 0) ||
      (taskFilter === "attention" && entry.flags.hasAttentionTasks);

    return (
      matchesSearch &&
      matchesAttendance &&
      matchesTask
    );
  });
  const columns: Column<StaffStatusEntry>[] = [
    {
      key: "staff",
      header: "Staff",
      render: (entry) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {entry.staff.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-foreground">{entry.staff.name}</p>
            <p className="text-xs text-muted-foreground">{entry.staff.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (entry) => (
        <span className="text-foreground">
          {entry.staff.location?.name ?? "Unassigned"}
        </span>
      ),
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (entry) => (
        <div className="space-y-1">
          <div>
            <StatusBadge
              status={
                entry.attendanceDisplayStatus ??
                entry.attendance?.status ??
                "NO_RECORD_TODAY"
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {entry.flags.isAbsent
              ? "Missing check-in"
              : entry.flags.isShiftNotStarted
                ? "Scheduled shift has not started"
                : entry.attendance?.status === "MISSED_CHECKOUT"
                  ? "Missing check-out"
                  : !entry.attendance
                    ? "No check-in record"
                    : entry.attendance
              ? `In ${fmtTime(entry.attendance.checkInTime ?? null, entry.staff.location?.timezone ?? "UTC")} / Out ${fmtTime(entry.attendance.checkOutTime ?? null, entry.staff.location?.timezone ?? "UTC")}`
              : null}
          </p>
        </div>
      ),
    },
    {
      key: "tasks",
      header: "Task Progress",
      render: (entry) => (
        <div className="space-y-1 text-xs">
          <p className="text-foreground">
            {entry.taskCounts.completed} of {entry.taskCounts.total} completed
          </p>
          <p className="text-muted-foreground">
            {entry.taskCounts.pending} pending · {entry.taskCounts.inProgress}{" "}
            in progress
          </p>
        </div>
      ),
    },
    {
      key: "attention",
      header: "Attention",
      render: (entry) => {
        const reasons = attentionReasons(entry, asOf);
        return reasons.length ? (
          <div className="max-w-56 text-xs text-amber-800">
            <p>{reasons.slice(0, 2).join(" · ")}</p>
            {reasons.length > 2 && (
              <details className="mt-1" onClick={(event) => event.stopPropagation()}>
                <summary className="cursor-pointer font-medium">{reasons.length - 2} more reasons</summary>
                <p className="mt-1">{reasons.slice(2).join(" · ")}</p>
              </details>
            )}
          </div>
        ) : <span className="text-xs text-muted-foreground">—</span>;
      },
    },
    {
      key: "details",
      header: "Details",
      render: (entry) => (
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={(event) => {
            event.stopPropagation();
            navigate(staffTodayLink(entry));
          }}
        >
          View Today
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today"
        subtitle="Check attendance, follow task progress, and resolve today’s exceptions."
        action={
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={isFetching ? "size-4 animate-spin" : "size-4"}
            />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Present"
          value={summary?.present ?? 0}
          icon={CalendarCheck}
          tone="emerald"
        />
        <StatCard
          label="Absent"
          value={summary?.absent ?? 0}
          icon={Users}
          tone="amber"
        />
        <StatCard
          label="Pending tasks"
          value={summary?.pendingTasks ?? 0}
          icon={Clock3}
        />
        <StatCard
          label="Review items"
          value={summary?.attentionTasks ?? 0}
          icon={CircleAlert}
          tone="amber"
        />
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Staff view">
        <Button
          variant="outline"
          aria-pressed={!attentionOnly}
          onClick={() => setSearchParams({})}
        >
          All staff
        </Button>
        <Button
          variant="outline"
          aria-pressed={attentionOnly}
          onClick={() => setSearchParams({ view: "attention" })}
        >
          Needs attention ({attentionCount})
        </Button>
      </div>
      <FilterBar className="xl:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search staff"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or email"
            className="pl-10"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            aria-label="Filter by location"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="h-11 w-full rounded-lg border border-border/80 bg-background/90 px-10 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          >
            <option value="all">All locations</option>
            {locations.map((location: { id: number; name: string }) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            aria-label="Filter by attendance"
            value={attendanceFilter}
            onChange={(e) =>
              setAttendanceFilter(e.target.value as AttendanceFilter)
            }
            className="h-11 w-full rounded-lg border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          >
            <option value="all">All attendance</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="shift-not-started">Shift not started</option>
          </select>
        </div>
        <div>
          <select
            aria-label="Filter by task status"
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value as TaskFilter)}
            className="h-11 w-full rounded-lg border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          >
            <option value="all">All task states</option>
            <option value="pending">Pending tasks</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="attention">Needs attention</option>
          </select>
        </div>
      </FilterBar>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => {
          setSearch("");
          setLocationId("all");
          setAttendanceFilter("all");
          setTaskFilter("all");
        }}>Clear filters</Button>
      )}

      <SurfaceCard
        title="Today by staff"
        description={
          isFetching
            ? "Refreshing current status..."
            : `${filteredStaff.length} staff ${filteredStaff.length === 1 ? "member" : "members"} shown`
        }
      >
        <DataTable
          columns={columns}
          data={filteredStaff}
          rowKey={(entry) => entry.staff.id}
          emptyIcon={<Users className="h-12 w-12" />}
          emptyMessage={
            staffStatus.length
              ? "No matches. Try another search or clear your filters."
              : "No staff assigned yet. Add team members to a location to see their daily activity."
          }
          className="border-none shadow-none"
          onRowClick={(entry) => navigate(staffTodayLink(entry))}
        />
      </SurfaceCard>
    </div>
  );
}
