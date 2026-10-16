import OperationsState from "../Manager/OperationsState";
import { Link } from "react-router-dom";
import {
  verificationLabel,
  timingLabel,
} from "@/pages/Verification/presentation";
import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Clock,
  Calendar,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useGetStaffDetails } from "./queries";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import SurfaceCard from "@/components/common/SurfaceCard";
import FilterBar from "@/components/common/FilterBar";
import DataTable, { type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAttendanceDisplayStatus } from "@/lib/attendance";
import { formatInTimeZone } from "date-fns-tz";

type Tab = "overview" | "templates" | "instances" | "attendance";

interface StaffTaskInstanceRow {
  id: number;
  title: string;
  location?: { name?: string | null; timezone?: string | null } | null;
  date: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  status: string;
  staffSubmittedAt?: string | null;
  verificationVersion?: number;
  verificationState?: string;
  completionOutcome?: string | null;
  completionTiming?: string | null;
  isLate: boolean;
  startedAt: string | null;
  completedAt: string | null;
  proofImageUrls?: string[];
}

interface StaffAttendanceRow {
  id: number;
  date: string | null;
  location?: { name?: string | null; timezone?: string | null } | null;
  expectedStart: string | null;
  expectedEnd: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  isLateCheckIn: boolean;
  lateMinutes: number | null;
  checkInImage?: string | null;
  checkOutImage?: string | null;
}

interface StaffTaskTemplateRow {
  id: number;
  title: string;
  description?: string | null;
  recurringType?: string | null;
  isActive: boolean;
  location?: { name?: string | null; timezone?: string | null } | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  effectiveDate: string | null;
}

const fmtTime = (d: string | null, timeZone = "UTC") => {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), timeZone, "HH:mm");
};
const fmtTimeWithTz = (d: string | null, timeZone = "UTC") => {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), timeZone, "HH:mm (zzz)");
};
const fmtDate = (d: string | null) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
};
const fmtDateTime = (d: string | null, timeZone = "UTC") => {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), timeZone, "dd MMM HH:mm");
};

const getCurrentMonthValue = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

const toDateInputValue = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

const getYesterdayValue = () => {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return toDateInputValue(yesterday);
};

const getMonthOptions = (count = 12) => {
  const options: { value: string; label: string }[] = [];
  const cursor = new Date();

  for (let index = 0; index < count; index += 1) {
    const value = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = cursor.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    options.push({ value, label });
    cursor.setUTCMonth(cursor.getUTCMonth() - 1);
  }

  return options;
};

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = searchParams.get("month") ?? getCurrentMonthValue();
  const initialDateFrom = searchParams.get("dateFrom") ?? "";
  const initialDateTo = searchParams.get("dateTo") ?? "";
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "overview";
  const focusMode = searchParams.get("focus");
  const todayValue = toDateInputValue(new Date());
  const yesterdayValue = getYesterdayValue();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [month, setMonth] = useState(initialMonth);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<
    "today" | "yesterday" | "this-month" | null
  >(() => {
    if (initialDateFrom && initialDateTo) {
      if (initialDateFrom === todayValue && initialDateTo === todayValue)
        return "today";
      if (
        initialDateFrom === yesterdayValue &&
        initialDateTo === yesterdayValue
      )
        return "yesterday";
      return null;
    }

    return initialMonth === getCurrentMonthValue() ? "this-month" : null;
  });
  const [filters, setFilters] = useState<{
    month?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({
    ...(initialDateFrom && initialDateTo
      ? { dateFrom: initialDateFrom, dateTo: initialDateTo }
      : { month: initialMonth }),
  });
  const monthOptions = useMemo(() => getMonthOptions(), []);

  const staffQuery = useGetStaffDetails(Number(id), filters);
  const { data, isLoading, isFetching } = staffQuery;

  const instanceColumns: Column<StaffTaskInstanceRow>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Task",
        render: (instance) => (
          <span className="font-medium text-foreground">{instance.title}</span>
        ),
      },
      {
        key: "location",
        header: "Location",
        render: (instance) => <span>{instance.location?.name ?? "—"}</span>,
      },
      {
        key: "date",
        header: "Date",
        render: (instance) => <span>{fmtDate(instance.date)}</span>,
      },
      {
        key: "shift",
        header: "Shift",
        render: (instance) => (
          <span>
            {fmtTime(instance.shiftStart, instance.location?.timezone ?? "UTC")}{" "}
            – {fmtTime(instance.shiftEnd, instance.location?.timezone ?? "UTC")}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (instance) => (
          <div className="flex flex-wrap items-center gap-2">
            {instance.verificationVersion === 2 ? (
              <Link
                className="text-primary underline"
                to={`/verification/${instance.id}?returnTo=${encodeURIComponent(`/staff/${id}?${searchParams.toString()}`)}`}
              >
                {verificationLabel(instance)}
              </Link>
            ) : (
              <StatusBadge status={instance.status} />
            )}
            {instance.completionTiming ? (
              <span className="text-xs text-muted-foreground">
                {timingLabel(instance.completionTiming)}
              </span>
            ) : null}
            {instance.isLate ? (
              <span className="text-[10px] font-medium text-amber-600">
                Late start
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: "startedAt",
        header: "Started",
        render: (instance) => (
          <span>
            {fmtDateTime(
              instance.startedAt,
              instance.location?.timezone ?? "UTC",
            )}
          </span>
        ),
      },
      {
        key: "completedAt",
        header: "Completed",
        render: (instance) => (
          <span>
            {fmtDateTime(
              instance.completedAt,
              instance.location?.timezone ?? "UTC",
            )}
          </span>
        ),
      },
      {
        key: "proof",
        header: "Proof",
        render: (instance) =>
          instance.verificationVersion === 2 ? (
            <Link
              className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline"
              to={`/verification/${instance.id}?returnTo=${encodeURIComponent(`/staff/${id}?${searchParams.toString()}`)}`}
            >
              View task photos
            </Link>
          ) : instance.proofImageUrls && instance.proofImageUrls.length > 0 ? (
            <div className="flex gap-1">
              {instance.proofImageUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={`Proof ${i + 1}`}
                    className="h-9 w-9 rounded-md object-cover border border-gray-200 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                  />
                </a>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ],
    [id, searchParams],
  );

  const attendanceColumns: Column<StaffAttendanceRow>[] = useMemo(
    () => [
      {
        key: "date",
        header: "Date",
        render: (attendance) => (
          <span className="font-medium text-foreground">
            {fmtDate(attendance.date)}
          </span>
        ),
      },
      {
        key: "location",
        header: "Location",
        render: (attendance) => <span>{attendance.location?.name ?? "—"}</span>,
      },
      {
        key: "shift",
        header: "Expected Shift",
        render: (attendance) => (
          <span>
            {fmtTime(
              attendance.expectedStart,
              attendance.location?.timezone ?? "UTC",
            )}{" "}
            –{" "}
            {fmtTime(
              attendance.expectedEnd,
              attendance.location?.timezone ?? "UTC",
            )}
          </span>
        ),
      },
      {
        key: "checkIn",
        header: "Check In",
        render: (attendance) => (
          <span>
            {fmtDateTime(
              attendance.checkInTime,
              attendance.location?.timezone ?? "UTC",
            )}
          </span>
        ),
      },
      {
        key: "checkOut",
        header: "Check Out",
        render: (attendance) => (
          <span>
            {fmtDateTime(
              attendance.checkOutTime,
              attendance.location?.timezone ?? "UTC",
            )}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (attendance) => (
          <StatusBadge
            status={getAttendanceDisplayStatus(
              attendance,
              new Date(),
              attendance.location?.timezone ?? "UTC",
            )}
          />
        ),
      },
      {
        key: "late",
        header: "Late",
        render: (attendance) => {
          const displayStatus = getAttendanceDisplayStatus(
            attendance,
            new Date(),
            attendance.location?.timezone ?? "UTC",
          );

          if (attendance.isLateCheckIn) {
            return (
              <span className="text-xs font-medium text-amber-600">
                {attendance.lateMinutes ?? 0} min late
              </span>
            );
          }

          if (
            displayStatus === "CHECKED_IN" ||
            displayStatus === "CHECKED_OUT"
          ) {
            return <span className="text-xs text-emerald-700">On time</span>;
          }

          return <span className="text-xs text-muted-foreground">—</span>;
        },
      },
      {
        key: "checkInImg",
        header: "Check-In Photo",
        render: (attendance) =>
          attendance.checkInImage ? (
            <a
              href={attendance.checkInImage}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={attendance.checkInImage}
                alt="Check-in"
                className="h-9 w-9 rounded-md object-cover border border-gray-200 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
              />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        key: "checkOutImg",
        header: "Check-Out Photo",
        render: (attendance) =>
          attendance.checkOutImage ? (
            <a
              href={attendance.checkOutImage}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={attendance.checkOutImage}
                alt="Check-out"
                className="h-9 w-9 rounded-md object-cover border border-gray-200 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
              />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ],
    [],
  );

  const syncSearchParams = (
    nextFilters: { month?: string; dateFrom?: string; dateTo?: string },
    nextTab = activeTab,
  ) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set("tab", nextTab);
      next.delete("focus");

      if (nextFilters.month) next.set("month", nextFilters.month);
      else next.delete("month");

      if (nextFilters.dateFrom && nextFilters.dateTo) {
        next.set("dateFrom", nextFilters.dateFrom);
        next.set("dateTo", nextFilters.dateTo);
      } else {
        next.delete("dateFrom");
        next.delete("dateTo");
      }

      return next;
    });
  };

  const applyMonthFilter = () => {
    const nextFilters = month ? { month } : {};
    setFilters(nextFilters);
    setDateFrom("");
    setDateTo("");
    setSelectedQuickFilter(
      month === getCurrentMonthValue() ? "this-month" : null,
    );
    syncSearchParams(nextFilters);
  };

  const applyDateRangeFilter = () => {
    const nextFilters = dateFrom && dateTo ? { dateFrom, dateTo } : {};
    setFilters(nextFilters);
    setSelectedQuickFilter(null);
    syncSearchParams(nextFilters);
  };

  const clearFilters = () => {
    const currentMonth = getCurrentMonthValue();
    setMonth(currentMonth);
    setDateFrom("");
    setDateTo("");
    setFilters({ month: currentMonth });
    setSelectedQuickFilter("this-month");
    syncSearchParams({ month: currentMonth });
  };

  const applyQuickRange = (type: "today" | "yesterday" | "this-month") => {
    if (type === "today") {
      const today = toDateInputValue(new Date());
      setDateFrom(today);
      setDateTo(today);
      setFilters({ dateFrom: today, dateTo: today });
      setSelectedQuickFilter("today");
      syncSearchParams({ dateFrom: today, dateTo: today });
      return;
    }

    if (type === "yesterday") {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const value = toDateInputValue(yesterday);
      setDateFrom(value);
      setDateTo(value);
      setFilters({ dateFrom: value, dateTo: value });
      setSelectedQuickFilter("yesterday");
      syncSearchParams({ dateFrom: value, dateTo: value });
      return;
    }

    const currentMonth = getCurrentMonthValue();
    setMonth(currentMonth);
    setDateFrom("");
    setDateTo("");
    setFilters({ month: currentMonth });
    setSelectedQuickFilter("this-month");
    syncSearchParams({ month: currentMonth });
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (staffQuery.isError)
    return (
      <div className="ops-page">
        <PageHeader title="Team member" />
        <OperationsState
          error={staffQuery.error}
          retry={() => void staffQuery.refetch()}
        />
      </div>
    );

  const staff = data?.data;
  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">Staff member not found.</p>
        <button
          onClick={() => navigate("/staff")}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          ← Back to team
        </button>
      </div>
    );
  }

  const { taskStats, attendanceStats, periodLabel } = staff;
  const staffTz: string = staff.location?.timezone ?? "UTC";

  const taskChartData = [
    { name: "Work submitted", value: taskStats.completed, fill: "#3d8f7b" },
    { name: "Pending", value: taskStats.pending, fill: "#91a5ab" },
    { name: "In Progress", value: taskStats.inProgress, fill: "#ba8d34" },
    { name: "Missed", value: taskStats.missed, fill: "#c75a52" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/staff")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to team
      </button>

      <PageHeader
        title={staff.name}
        subtitle={`${periodLabel} · Attendance and task history${focusMode === "today" ? " for today" : ""}.`}
        action={<StatusBadge status={staff.isActive ? "ACTIVE" : "INACTIVE"} />}
      />

      <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Mail size={16} />
          {staff.email}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={16} />
          {staff.location?.name ?? "Unassigned"}
        </span>
        <span className="flex items-center gap-2">
          <Clock size={16} />
          {fmtTimeWithTz(staff.shiftStart, staffTz)} –{" "}
          {fmtTimeWithTz(staff.shiftEnd, staffTz)}
        </span>
      </div>

      <FilterBar className="xl:grid-cols-[auto_auto_auto_auto_auto]">
        <div className="xl:col-span-5">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Quick filters
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-lg"
              aria-pressed={selectedQuickFilter === "today"}
              onClick={() => applyQuickRange("today")}
            >
              Today
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
              aria-pressed={selectedQuickFilter === "yesterday"}
              onClick={() => applyQuickRange("yesterday")}
            >
              Yesterday
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
              aria-pressed={selectedQuickFilter === "this-month"}
              onClick={() => applyQuickRange("this-month")}
            >
              This Month
            </Button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Month
          </label>
          <select
            aria-label="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-11 w-full rounded-lg border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button className="h-11 rounded-lg" onClick={applyMonthFilter}>
            <Calendar className="h-4 w-4" />
            Apply month
          </Button>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            From
          </label>
          <Input
            type="date"
            aria-label="From date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            To
          </label>
          <Input
            type="date"
            aria-label="To date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            className="h-11 rounded-lg"
            onClick={clearFilters}
          >
            Reset
          </Button>
          <Button className="h-11 rounded-lg" onClick={applyDateRangeFilter}>
            <Filter className="h-4 w-4" />
            Apply range
          </Button>
        </div>
      </FilterBar>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard
          label="Scheduled tasks"
          value={taskStats.totalTemplates}
          icon={ClipboardList}
        />
        <StatCard
          label="Work submitted"
          value={taskStats.completed}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Pending"
          value={taskStats.pending}
          icon={Activity}
          tone="sky"
        />
        <StatCard
          label="Missed"
          value={taskStats.missed}
          icon={XCircle}
          tone="amber"
        />
        <StatCard
          label="Late Check-ins"
          value={attendanceStats.late}
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-border/70 bg-muted/50 p-1">
        {[
          { key: "overview", label: "Overview" },
          { key: "templates", label: "Cleaning schedule" },
          { key: "instances", label: "Task history" },
          { key: "attendance", label: "Attendance" },
        ].map((tab) => (
          <button
            key={tab.key}
            aria-pressed={activeTab === tab.key}
            onClick={() => {
              const nextTab = tab.key as Tab;
              setActiveTab(nextTab);
              setSearchParams((params) => {
                const next = new URLSearchParams(params);
                next.set("tab", nextTab);
                return next;
              });
            }}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SurfaceCard
            title="Profile"
            description="Core staff identity and assignment details."
          >
            <dl className="space-y-3 text-sm">
              {(
                [
                  ["Name", staff.name],
                  ["Email", staff.email],
                  ["Role", staff.role],
                  ["Location", staff.location?.name ?? "Unassigned"],
                  ["Address", staff.location?.address ?? "—"],
                  [
                    "Shift",
                    `${fmtTimeWithTz(staff.shiftStart, staffTz)} – ${fmtTimeWithTz(staff.shiftEnd, staffTz)}`,
                  ],
                  ["Joined", fmtDate(staff.createdAt)],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-6 border-b border-border/50 pb-3 last:border-b-0 last:pb-0"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </SurfaceCard>

          <SurfaceCard
            title="Task performance"
            description={
              isFetching
                ? "Refreshing filtered period..."
                : `Task outcomes for ${periodLabel}.`
            }
          >
            {taskChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={taskChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ea" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#91a5ab" }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#91a5ab" }}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: 13,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 3, 3, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No task data in this period.
              </div>
            )}
          </SurfaceCard>

          <SurfaceCard
            title="Attendance summary"
            description={`Attendance reliability for ${periodLabel}.`}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-muted/60 p-4 text-center">
                <p className="text-2xl font-semibold text-foreground">
                  {attendanceStats.totalRecords}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Records
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4 text-center">
                <p className="text-2xl font-semibold text-emerald-700">
                  {attendanceStats.present}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-700">
                  Present
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-2xl font-semibold text-red-700">
                  {attendanceStats.absent}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-red-700/80">
                  Absent
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4 text-center">
                <p className="text-2xl font-semibold text-amber-700">
                  {attendanceStats.late}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-amber-700">
                  Late
                </p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      )}

      {activeTab === "templates" && (
        <DataTable<StaffTaskTemplateRow>
          data={staff.taskTemplates}
          pageSize={20}
          rowKey={(row) => row.id}
          emptyMessage="No active cleaning schedules assigned."
          columns={[
            {
              key: "title",
              header: "Cleaning schedule",
              sortValue: (row) => row.title,
              render: (row) => (
                <div>
                  <strong>{row.title}</strong>
                  {row.description ? <p>{row.description}</p> : null}
                </div>
              ),
            },
            {
              key: "location",
              header: "Location",
              sortValue: (row) => row.location?.name ?? "",
              render: (row) => row.location?.name ?? "—",
            },
            {
              key: "shift",
              header: "Shift",
              render: (row) =>
                fmtTime(row.shiftStart, row.location?.timezone ?? "UTC") +
                " – " +
                fmtTime(row.shiftEnd, row.location?.timezone ?? "UTC"),
            },
            {
              key: "recurrence",
              header: "Recurrence",
              render: (row) => (
                <StatusBadge status={row.recurringType ?? "ONCE"} />
              ),
            },
            {
              key: "effective",
              header: "Effective",
              sortValue: (row) => row.effectiveDate ?? "",
              render: (row) => fmtDate(row.effectiveDate),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />
              ),
            },
          ]}
        />
      )}

      {activeTab === "instances" && (
        <SurfaceCard
          title="Task instances"
          description={`Recent filtered task execution for ${periodLabel}.`}
          contentClassName="p-0"
        >
          <DataTable
            pageSize={20}
            columns={instanceColumns}
            data={staff.taskInstances}
            rowKey={(i) => i.id}
            emptyIcon={<Activity className="h-12 w-12" />}
            emptyMessage="No task instances found for this period."
            className="border-none shadow-none"
          />
        </SurfaceCard>
      )}

      {activeTab === "attendance" && (
        <SurfaceCard
          title="Attendance records"
          description={`Attendance records for ${periodLabel}.`}
          contentClassName="p-0"
        >
          <DataTable
            pageSize={20}
            columns={attendanceColumns}
            data={staff.attendances}
            rowKey={(a) => a.id}
            emptyIcon={<Calendar className="h-12 w-12" />}
            emptyMessage="No attendance records found for this period."
            className="border-none shadow-none"
          />
        </SurfaceCard>
      )}
    </div>
  );
};

export default StaffDetailPage;
