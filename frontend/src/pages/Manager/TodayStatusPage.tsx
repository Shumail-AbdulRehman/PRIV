import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Clock3, Filter, MapPin, Search, Users, ArrowRight, Siren, CircleAlert, UserX } from "lucide-react";

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

type AttendanceFilter = "all" | "present" | "absent" | "late" | "shift-not-started";
type TaskFilter = "all" | "pending" | "in-progress" | "completed" | "attention";

interface StaffStatusEntry {
  staff: {
    id: number;
    name: string;
    email: string;
    locationId: number | null;
    shiftStart: string | null;
    shiftEnd: string | null;
    location: { id: number; name: string } | null;
  };
  attendance: {
    status: string;
    expectedStart: string;
    expectedEnd: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    lateMinutes: number | null;
  } | null;
  attendanceDisplayStatus: string;
  attentionCount: number;
  tasks: Array<{
    id: number;
    title: string;
    status: string;
    shiftStart: string;
    shiftEnd: string;
    isLate: boolean;
    isCurrentlyLate?: boolean;
    lateMinutes: number | null;
    displayLateMinutes?: number | null;
  }>;
  taskCounts: {
    pending: number;
    inProgress: number;
    completed: number;
    missed: number;
    notCompletedInTime: number;
    cancelled: number;
    late: number;
    total: number;
  };
  flags: {
    isAbsent: boolean;
    isPresent: boolean;
    isLateAttendance: boolean;
    isShiftNotStarted: boolean;
    hasPendingTasks: boolean;
    hasInProgressTasks: boolean;
    hasAttentionTasks: boolean;
  };
}

const fmtTime = (value: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const toLocalDateValue = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

export default function TodayStatusPage() {
  const navigate = useNavigate();
  const [locationId, setLocationId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>("all");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");

  const filters = useMemo(
    () => ({
      locationId: locationId === "all" ? undefined : Number(locationId),
    }),
    [locationId],
  );

  const { data, isLoading, isFetching } = useGetTodayStatus(filters);

  if (isLoading) return <LoadingSpinner fullScreen />;

  const payload = data?.data;
  const summary = payload?.summary;
  const locations = payload?.locations ?? [];
  const staffStatus: StaffStatusEntry[] = payload?.staffStatus ?? [];
  const todayDate = payload?.date ? toLocalDateValue(new Date(payload.date)) : toLocalDateValue(new Date());

  const filteredStaff = staffStatus.filter((entry) => {
    const matchesSearch =
      entry.staff.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.staff.email.toLowerCase().includes(search.toLowerCase());

    const matchesAttendance =
      attendanceFilter === "all" ||
      (attendanceFilter === "present" && entry.flags.isPresent) ||
      (attendanceFilter === "absent" && entry.flags.isAbsent) ||
      (attendanceFilter === "late" && entry.flags.isLateAttendance) ||
      (attendanceFilter === "shift-not-started" && entry.flags.isShiftNotStarted);

    const matchesTask =
      taskFilter === "all" ||
      (taskFilter === "pending" && entry.taskCounts.pending > 0) ||
      (taskFilter === "in-progress" && entry.taskCounts.inProgress > 0) ||
      (taskFilter === "completed" && entry.taskCounts.completed > 0) ||
      (taskFilter === "attention" && entry.flags.hasAttentionTasks);

    return matchesSearch && matchesAttendance && matchesTask;
  });
  const absentStaff = filteredStaff.filter((entry) => entry.flags.isAbsent).slice(0, 5);
  const attentionStaff = filteredStaff.filter((entry) => entry.flags.hasAttentionTasks).slice(0, 5);
  const pendingStaff = filteredStaff.filter((entry) => entry.taskCounts.pending > 0).slice(0, 5);

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
        <span className="text-foreground">{entry.staff.location?.name ?? "Unassigned"}</span>
      ),
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (entry) => (
        <div className="space-y-1">
          <div>
            <StatusBadge status={entry.attendanceDisplayStatus ?? entry.attendance?.status ?? "NO_RECORD_TODAY"} />
          </div>
          <p className="text-xs text-muted-foreground">
            {entry.attendance
              ? `In ${fmtTime(entry.attendance.checkInTime ?? null)} / Out ${fmtTime(entry.attendance.checkOutTime ?? null)}`
              : "No attendance row for today"}
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
            Pending {entry.taskCounts.pending} | In progress {entry.taskCounts.inProgress} | Completed {entry.taskCounts.completed}
          </p>
          <p className="text-muted-foreground">
            Attention {entry.attentionCount}
          </p>
        </div>
      ),
    },
    {
      key: "flags",
      header: "Flags",
      render: (entry) => (
        <div className="flex flex-wrap gap-2">
          {entry.flags.isAbsent ? <StatusBadge status="ABSENT" /> : null}
          {entry.flags.isLateAttendance ? <StatusBadge status="LATE" /> : null}
          {entry.flags.isShiftNotStarted ? <StatusBadge status="SHIFT_NOT_STARTED" /> : null}
          {entry.taskCounts.pending > 0 ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Pending Tasks</span> : null}
          {entry.flags.hasAttentionTasks ? <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Needs Attention</span> : null}
        </div>
      ),
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
            navigate(
              `/staff/${entry.staff.id}?dateFrom=${todayDate}&dateTo=${todayDate}&tab=overview&focus=today`,
            );
          }}
        >
          View Today
        </Button>
      ),
    },
  ];

  const getPendingLateSummary = (entry: StaffStatusEntry) => {
    const pendingLateTasks = entry.tasks.filter(
      (task) => task.status === "PENDING" && (task.isCurrentlyLate || task.isLate),
    );

    if (pendingLateTasks.length === 0) {
      return `${entry.taskCounts.pending} pending tasks`;
    }

    const maxLateMinutes = Math.max(
      ...pendingLateTasks.map((task) => task.displayLateMinutes ?? task.lateMinutes ?? 0),
    );

    return `${entry.taskCounts.pending} pending tasks • ${pendingLateTasks.length} late • up to ${maxLateMinutes} min`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today Status"
        subtitle="A live triage view for today’s attendance, task progress, absences, pending work, and exceptions across your active team."
      />

      <SurfaceCard className="border-none bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,118,110,0.92))] text-white shadow-[0_35px_90px_-45px_rgba(15,23,42,0.6)]">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/75">
              Daily triage
            </div>
            <div className="space-y-3">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight">
                Start here when you need to know who needs attention today.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-white/75">
                This page is intentionally tuned for exceptions first: absences, pending task load, and staff that need manager review before the day closes.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-white/70">Active staff</p>
              <p className="mt-2 text-3xl font-semibold">{summary?.totalStaff ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-white/70">Needs review</p>
              <p className="mt-2 text-3xl font-semibold">{summary?.staffNeedingReview ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-white/70">Absent</p>
              <p className="mt-2 text-3xl font-semibold">{summary?.absent ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-white/70">Shift not started</p>
              <p className="mt-2 text-3xl font-semibold">{summary?.shiftNotStarted ?? 0}</p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <FilterBar className="xl:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or email"
            className="pl-10"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="h-11 rounded-2xl border border-border/80 bg-background/90 px-10 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
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
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value as AttendanceFilter)}
            className="h-11 rounded-2xl border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
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
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value as TaskFilter)}
            className="h-11 rounded-2xl border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          >
            <option value="all">All task states</option>
            <option value="pending">Pending tasks</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="attention">Needs attention</option>
          </select>
        </div>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-3">
        <SurfaceCard title="Absences" description="Staff marked absent after their shift window should have started.">
          {absentStaff.length > 0 ? (
            <div className="space-y-3">
              {absentStaff.map((entry) => (
                <button
                  key={entry.staff.id}
                  onClick={() => navigate(`/staff/${entry.staff.id}?dateFrom=${todayDate}&dateTo=${todayDate}&tab=attendance&focus=today`)}
                  className="flex w-full items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-left transition hover:bg-red-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                      <UserX className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{entry.staff.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.staff.location?.name ?? "Unassigned"}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No active absences in the current filter.</div>
          )}
        </SurfaceCard>

        <SurfaceCard title="Pending work" description="Staff with pending tasks still open today.">
          {pendingStaff.length > 0 ? (
            <div className="space-y-3">
              {pendingStaff.map((entry) => (
                <button
                  key={entry.staff.id}
                  onClick={() => navigate(`/staff/${entry.staff.id}?dateFrom=${todayDate}&dateTo=${todayDate}&tab=instances&focus=today`)}
                  className="flex w-full items-center justify-between rounded-2xl bg-sky-50 px-4 py-3 text-left transition hover:bg-sky-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <Clock3 className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{entry.staff.name}</p>
                      <p className="text-xs text-muted-foreground">{getPendingLateSummary(entry)}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No pending-task backlog in the current filter.</div>
          )}
        </SurfaceCard>

        <SurfaceCard title="Needs review" description="Late tasks, missed work, not-in-time completions, or missed checkout records.">
          {attentionStaff.length > 0 ? (
            <div className="space-y-3">
              {attentionStaff.map((entry) => (
                <button
                  key={entry.staff.id}
                  onClick={() => navigate(`/staff/${entry.staff.id}?dateFrom=${todayDate}&dateTo=${todayDate}&tab=instances&focus=today`)}
                  className="flex w-full items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-left transition hover:bg-amber-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Siren className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{entry.staff.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.attentionCount} review item{entry.attentionCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No high-attention task exceptions right now.</div>
          )}
        </SurfaceCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present" value={summary?.present ?? 0} icon={CalendarCheck} tone="emerald" />
        <StatCard label="Pending tasks" value={summary?.pendingTasks ?? 0} icon={Clock3} tone="sky" />
        <StatCard label="In progress" value={summary?.inProgressTasks ?? 0} icon={Filter} tone="sky" />
        <StatCard label="Late attendance" value={summary?.lateAttendance ?? 0} icon={CircleAlert} tone="amber" />
      </div>

      <SurfaceCard title="Today by staff" description={isFetching ? "Refreshing current status..." : `${filteredStaff.length} staff records shown`}>
        <DataTable
          columns={columns}
          data={filteredStaff}
          rowKey={(entry) => entry.staff.id}
          emptyIcon={<Users className="h-12 w-12" />}
          emptyMessage="No staff records match the current filters."
          className="border-none shadow-none"
          onRowClick={(entry) =>
            navigate(`/staff/${entry.staff.id}?dateFrom=${todayDate}&dateTo=${todayDate}&tab=overview&focus=today`)
          }
        />
      </SurfaceCard>
    </div>
  );
}
