import { useLanguage } from '@/i18n/context';
import StaffEditDialog from './StaffEditDialog';
import './workforce-v5.css';
import WorkforceActions from "./WorkforceActions";
import { useGetLocations } from "../Location/queries";
import AttendanceContext from "@/pages/Attendance/AttendanceContext";
import ProtectedAttendancePhoto, { type AttendancePhoto } from "@/components/common/ProtectedAttendancePhoto";
import StaffPerformanceIssues from './StaffPerformanceIssues';
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
  checkInPhoto?: AttendancePhoto;
  checkOutPhoto?: AttendancePhoto;
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

const getMonthOptions = (locale: string, count = 12) => {
  const options: { value: string; label: string }[] = [];
  const cursor = new Date();

  for (let index = 0; index < count; index += 1) {
    const value = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = cursor.toLocaleDateString(locale, {
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
  const {t,language}=useLanguage();
  const locale=language==='ur'?'ur-PK':'en-PK';
  const fmtDate=(date:string|null)=>date?new Date(date).toLocaleDateString(locale,{timeZone:'UTC'}):'—';
  const fmtDateTime=(date:string|null,timezone='UTC')=>date?new Date(date).toLocaleString(locale,{timeZone:timezone,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}):'—';
  const [editing,setEditing]=useState(false);
  const [saved,setSaved]=useState(false);
  const [filterError,setFilterError]=useState('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = searchParams.get("month") ?? getCurrentMonthValue();
  const initialDateFrom = searchParams.get("dateFrom") ?? "";
  const initialDateTo = searchParams.get("dateTo") ?? "";
  const requestedTab=searchParams.get("tab");
  const initialTab:Tab=["overview","templates","instances","attendance"].includes(requestedTab??"")?requestedTab as Tab:"overview";
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
  const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);

  const workforceSites = useGetLocations();
  const staffQuery = useGetStaffDetails(Number(id), filters);
  const { data, isLoading, isFetching } = staffQuery;

  const instanceColumns: Column<StaffTaskInstanceRow>[] = [
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
                {t(verificationLabel(instance))}
              </Link>
            ) : (
              <StatusBadge status={instance.status} />
            )}
            {instance.completionTiming ? (
              <span className="text-xs text-muted-foreground">
                {t(timingLabel(instance.completionTiming))}
              </span>
            ) : null}
            {instance.isLate ? (
              <span className="text-sm workforce-warning">
                {t('Late start')}
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
              {t('View task photos')}
            </Link>
          ) : instance.proofImageUrls && instance.proofImageUrls.length > 0 ? (
            <div className="flex gap-1">
              {instance.proofImageUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={t('Proof {count}',{count:i+1})}
                    className="h-12 w-12 rounded-md object-cover border border-border hover:ring-2 hover:ring-primary cursor-pointer"
                  />
                </a>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ];

  const attendanceColumns: Column<StaffAttendanceRow>[] = [
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
              <span className="text-sm workforce-warning">
                {t('{count} min late',{count:attendance.lateMinutes??0})}
              </span>
            );
          }

          if (
            displayStatus === "CHECKED_IN" ||
            displayStatus === "CHECKED_OUT"
          ) {
            return <span className="text-sm workforce-success">{t('On time')}</span>;
          }

          return <span className="text-xs text-muted-foreground">—</span>;
        },
      },
      {
        key: "actions",
        header: "Attendance context",
        render: (attendance) => <AttendanceContext attendance={attendance} />,
      },
      {
        key: "checkInImg",
        header: "Check-In Photo",
        render: (attendance) => <ProtectedAttendancePhoto attendanceId={attendance.id} kind="check-in" photo={attendance.checkInPhoto} />,
      },
      {
        key: "checkOutImg",
        header: "Check-Out Photo",
        render: (attendance) => <ProtectedAttendancePhoto attendanceId={attendance.id} kind="check-out" photo={attendance.checkOutPhoto} />,
      },
    ];

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
    setFilterError('');
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
    if(!dateFrom||!dateTo||dateFrom>dateTo){setFilterError('Choose both dates. The end date must be on or after the start date.');return;}
    setFilterError('');
    const nextFilters = dateFrom && dateTo ? { dateFrom, dateTo } : {};
    setFilters(nextFilters);
    setSelectedQuickFilter(null);
    syncSearchParams(nextFilters);
  };

  const clearFilters = () => {
    setFilterError('');
    const currentMonth = getCurrentMonthValue();
    setMonth(currentMonth);
    setDateFrom("");
    setDateTo("");
    setFilters({ month: currentMonth });
    setSelectedQuickFilter("this-month");
    syncSearchParams({ month: currentMonth });
  };

  const applyQuickRange = (type: "today" | "yesterday" | "this-month") => {
    setFilterError('');
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

  if(isLoading)return <div className="workforce-page"><PageHeader title="Team member"/><OperationsState loading skeleton="detail"/></div>;
  if (staffQuery.isError&&!staffQuery.data) {
    const status=(staffQuery.error as {response?:{status?:number}})?.response?.status;
    return <div className="workforce-page"><PageHeader title="Team member"/>
      {status===404||status===403?<div className="operations-notice" role="alert"><p>{t('This team member is unavailable to your account. Open the team directory to choose an accessible record.')}</p><Link className="workforce-back" to="/staff">{t('Back to team')}</Link></div>:<OperationsState error={staffQuery.error} retry={()=>void staffQuery.refetch()}/>}
    </div>;
  }

  const staff = data?.data;
  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t('Staff member not found.')}</p>
        <button
          onClick={() => navigate("/staff")}
          className="workforce-back"
        >
          {t('Back to team')}
        </button>
      </div>
    );
  }

  const {taskStats,attendanceStats,periodLabel}=staff;
  const displayPeriod=filters.month?new Date(`${filters.month}-15T12:00:00Z`).toLocaleDateString(locale,{month:'long',year:'numeric',timeZone:'UTC'}):t(periodLabel);
  const staffTz: string = staff.location?.timezone ?? "UTC";

  const taskChartData = [
    { name:t("Work submitted"), value: taskStats.completed, fill: "var(--success-ink)" },
    { name:t("Pending"), value: taskStats.pending, fill: "var(--muted-foreground)" },
    { name:t("In Progress"), value: taskStats.inProgress, fill: "var(--primary)" },
    { name:t("Missed"), value: taskStats.missed, fill: "var(--danger-ink)" },
  ].filter((d) => d.value > 0);

  return (
    <div className="workforce-page">
      <button
        onClick={() => navigate("/staff")}
        className="workforce-back"
      >
        <ArrowLeft className="h-4 w-4" /> {t('Back to team')}
      </button>

      <PageHeader
        title={staff.name}
        subtitle={t(focusMode==='today'?'{period} · Attendance and task history for today.':'{period} · Attendance and task history.',{period:displayPeriod})}
        action={<div className="flex flex-wrap items-center gap-3"><Button variant="outline" disabled={!staff.isActive} onClick={()=>setEditing(true)}>{t('Edit')}</Button><StatusBadge status={staff.isActive ? "ACTIVE" : "INACTIVE"} /><WorkforceActions person={{id:staff.id,name:staff.name,isActive:staff.isActive,locationId:staff.locationId ?? staff.location?.id}} locations={workforceSites.data?.data ?? []} /></div>}
      />

      {saved?<p role="status" className="ops-save-result">{t('Team member changes saved.')}</p>:null}
      <OperationsState error={staffQuery.isError?staffQuery.error:undefined} retry={()=>void staffQuery.refetch()}/>
      <div className="workforce-profile-strip">
        <span className="flex items-center gap-2">
          <Mail size={16} />
          <bdi dir="ltr">{staff.email}</bdi>
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={16} />
          {staff.location?.name??t("Unassigned")}
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
            {t('Quick filters')}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-lg"
              aria-pressed={selectedQuickFilter === "today"}
              onClick={() => applyQuickRange("today")}
            >
              {t('Today')}
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
              aria-pressed={selectedQuickFilter === "yesterday"}
              onClick={() => applyQuickRange("yesterday")}
            >
              {t('Yesterday')}
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
              aria-pressed={selectedQuickFilter === "this-month"}
              onClick={() => applyQuickRange("this-month")}
            >
              {t('This Month')}
            </Button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t('Month')}
          </label>
          <select
            aria-label={t("Month")}
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
            {t('Apply month')}
          </Button>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t('From')}
          </label>
          <Input
            type="date"
            aria-label={t("From date")}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t('To')}
          </label>
          <Input
            type="date"
            aria-label={t("To date")}
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
            {t('Reset')}
          </Button>
          <Button className="h-11 rounded-lg" onClick={applyDateRangeFilter}>
            <Filter className="h-4 w-4" />
            {t('Apply range')}
          </Button>
        </div>
      </FilterBar>
      {filterError?<p role="alert" className="workforce-error">{t(filterError)}</p>:null}

      <div className="workforce-detail-summary">
        <StatCard
          label="Scheduled tasks"
          value={taskStats.totalInstances}
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

      <div className="workforce-detail-tabs" role="group" aria-label={t("Team member sections")}>
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
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SurfaceCard
            title="Profile"
            description="Core staff identity and assignment details."
          >
            <dl className="workforce-profile-facts text-sm">
              {(
                [
                  ["Name", staff.name],
                  ["Email", staff.email],
                  ["Role", staff.role],
                  ["Location", staff.location?.name ?? t("Unassigned")],
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

                >
                  <dt className="text-muted-foreground">{t(label)}</dt>
                  <dd className="font-medium text-foreground">
                    {label==="Email"?<bdi dir="ltr">{value}</bdi>:label==="Role"?t(value):value}
                  </dd>
                </div>
              ))}
            </dl>
          </SurfaceCard>

          <SurfaceCard
            title="Task performance"
            description={t(isFetching?'Refreshing filtered period...':'Task outcomes for {period}.',{period:displayPeriod})}
          >
            {taskChartData.length > 0 ? (
              <div dir="ltr"><ResponsiveContainer width="100%" height={240}>
                <BarChart data={taskChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    width={language==='ur'?110:100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border:"1px solid var(--border)",
                      borderRadius:"7px",
                      fontSize: 13,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 3, 3, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer></div>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                {t('No task data in this period.')}
              </div>
            )}
          <div className="workforce-chart-values" aria-label={t('Task totals')}>{taskChartData.map(item=><span key={item.name}>{item.name}: <strong>{item.value}</strong></span>)}</div>
          </SurfaceCard>

          <StaffPerformanceIssues data={staff.performanceIssues} periodLabel={displayPeriod} staffId={staff.id} />

          <SurfaceCard
            title="Attendance summary"
            description={t('Attendance reliability for {period}.',{period:displayPeriod})}
            className="lg:col-span-2"
          >
            <div className="workforce-attendance-metrics">{([
              ['Records',attendanceStats.totalRecords,''],['Present',attendanceStats.present,'workforce-success'],['Absent',attendanceStats.absent,'workforce-danger'],['Late',attendanceStats.late,'workforce-warning']
            ] as const).map(([label,value,tone])=><div key={label}><strong className={tone}>{value}</strong><p>{t(label)}</p></div>)}</div>
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
          description={t('Recent filtered task execution for {period}.',{period:displayPeriod})}
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
          description={t('Attendance records for {period}.',{period:displayPeriod})}
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
      {editing?<StaffEditDialog person={staff} timezone={staffTz} onClose={()=>setEditing(false)} onSaved={()=>setSaved(true)}/>:null}
    </div>
  );
};

export default StaffDetailPage;
