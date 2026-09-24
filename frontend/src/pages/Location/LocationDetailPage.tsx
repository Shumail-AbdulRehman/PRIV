import DeleteButton from "@/components/common/DeleteButton";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import React, { useState } from "react";
import LocationScheduleTab from "./components/LocationScheduleTab";
import LocationTemplatesTab from "./components/LocationTemplatesTab";
import type { LocationStaff, ReferenceImage, TaskTemplate } from "./types";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { formatInTimeZone } from "date-fns-tz";
import { useGetLocationById, useDeleteLocation } from "./queries";
import type { LocationStatsFilter } from "./queries";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AreaSubmissionsPanel from "@/pages/Task/components/AreaSubmissionsPanel";
import {
  MapPin,
  Building2,
  Clock,
  Users,
  ClipboardList,
  Navigation,
  Radius,
  XCircle,
  Activity,
  CalendarCheck,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const toDateStr = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
const fmtCoord = (v: string) => parseFloat(v).toFixed(6);
const fmtTime = (d: string | null, timeZone = "UTC") => {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), timeZone, "HH:mm");
};

type FilterKey = "today" | "yesterday" | "7days" | "all";
const FILTERS: {
  key: FilterKey;
  label: string;
  toFilter: () => LocationStatsFilter | undefined;
}[] = [
  {
    key: "today",
    label: "Today",
    toFilter: () => {
      const t = toDateStr(new Date());
      return { type: "range", dateFrom: t, dateTo: t };
    },
  },
  {
    key: "yesterday",
    label: "Yesterday",
    toFilter: () => {
      const y = new Date();
      y.setUTCDate(y.getUTCDate() - 1);
      const s = toDateStr(y);
      return { type: "range", dateFrom: s, dateTo: s };
    },
  },
  {
    key: "7days",
    label: "Last 7 Days",
    toFilter: () => ({ type: "days", days: 7 }),
  },
  { key: "all", label: "All Time", toFilter: () => undefined },
];

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  const colors: Record<string, string> = {
    indigo: "bg-blue-100 text-blue-600",
    cyan: "bg-sky-100 text-sky-600",
    purple: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color] ?? colors.indigo}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

type Tab = "staff" | "templates" | "instances" | "schedule";
const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "staff", label: "Team", icon: Users },
  { key: "templates", label: "Cleaning schedule", icon: ClipboardList },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "instances", label: "Task history", icon: Clock },
];

interface TaskStatEntry {
  status: string;
  _count: { status: number };
}

interface TaskAssignment {
  id: number;
  staffId: number;
  status: string;
  reason?: string | null;
  isCurrent: boolean;
  assignedAt: string;
  staff?: {
    id: number;
    name: string;
    email?: string;
  } | null;
}

interface TaskInstance {
  id: number;
  title: string;
  date: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  status: string;
  isLate?: boolean;
  lateMinutes?: number | null;
  proofImageUrls?: string[];
  referenceImages?: ReferenceImage[];
  assignments?: TaskAssignment[];
  completionAttempts?: CompletionAttempt[];
}

interface CompletionAttempt {
  id: number;
  status: "APPROVED" | "REJECTED_LOCATION" | "REJECTED_CLEANLINESS" | "ERROR";
  areaName: string | null;
  submissionId: string | null;
  locationMatchScore: number | null;
  cleanlinessMatchScore: number | null;
  locationMatchReason: string | null;
  cleanlinessReason: string | null;
  imageUrl: string;
  createdAt: string;
}

interface LocationInfo {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  timezone: string;
  radiusMeters: number;
  isActive: boolean;
  staff: LocationStaff[];
  taskTemplates: TaskTemplate[];
  taskInstances: TaskInstance[];
}

const getTaskAssignee = (taskInstance: TaskInstance) => {
  const assignments = taskInstance.assignments ?? [];
  const currentAssignment = assignments.find(
    (assignment) => assignment.isCurrent,
  );
  return currentAssignment ?? assignments[assignments.length - 1] ?? null;
};

const getLatestAttempts = (taskInstance: TaskInstance) => {
  return taskInstance.completionAttempts ?? [];
};

const AreaAttemptRow = ({ attempt }: { attempt: CompletionAttempt }) => {
  const scoreText =
    attempt.locationMatchScore != null && attempt.cleanlinessMatchScore != null
      ? `Loc ${attempt.locationMatchScore} · Clean ${attempt.cleanlinessMatchScore}`
      : null;

  const name = attempt.areaName ? `${attempt.areaName}: ` : "";

  if (attempt.status === "APPROVED") {
    return (
      <div className="space-y-0.5">
        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          {name}Approved
        </span>
        {scoreText && <p className="text-[10px] text-gray-500">{scoreText}</p>}
      </div>
    );
  }

  if (attempt.status === "REJECTED_LOCATION") {
    return (
      <div className="max-w-xs space-y-0.5">
        <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
          {name}Wrong area
        </span>
        {scoreText && <p className="text-[10px] text-gray-500">{scoreText}</p>}
        {attempt.locationMatchReason && (
          <p
            className="text-[10px] text-gray-500 italic line-clamp-2"
            title={attempt.locationMatchReason}
          >
            {attempt.locationMatchReason}
          </p>
        )}
      </div>
    );
  }

  if (attempt.status === "REJECTED_CLEANLINESS") {
    return (
      <div className="max-w-xs space-y-0.5">
        <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          {name}Not clean enough
        </span>
        {scoreText && <p className="text-[10px] text-gray-500">{scoreText}</p>}
        {attempt.cleanlinessReason && (
          <p
            className="text-[10px] text-gray-500 italic line-clamp-2"
            title={attempt.cleanlinessReason}
          >
            {attempt.cleanlinessReason}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
        {name}Error
      </span>
      <p className="text-[10px] text-gray-500">Verification failed</p>
    </div>
  );
};

const VerificationCell = ({ attempts }: { attempts: CompletionAttempt[] }) => {
  if (!attempts.length) return <span className="text-gray-400">—</span>;

  const grouped = attempts.reduce<Record<string, CompletionAttempt[]>>(
    (acc, attempt) => {
      const key = attempt.submissionId ?? `single-${attempt.id}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(attempt);
      return acc;
    },
    {},
  );

  const latestGroup = Object.values(grouped)[0] ?? [];

  return (
    <div className="space-y-1">
      {latestGroup.map((attempt) => (
        <AreaAttemptRow key={attempt.id} attempt={attempt} />
      ))}
    </div>
  );
};

const LocationDetailPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const deleteLocation = useDeleteLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.find((tab) => tab.key === searchParams.get("tab"))?.key ?? "staff";
  const setActiveTab = (tab: Tab) => setSearchParams((previous) => {
    const next = new URLSearchParams(previous);
    next.set("tab", tab);
    return next;
  });
  const [expandedInstanceId, setExpandedInstanceId] = useState<number | null>(
    null,
  );

  const currentFilter = FILTERS.find((f) => f.key === activeFilter)!;
  const filter = currentFilter.toFilter();

  const { data, isLoading, isFetching } = useGetLocationById(id!, filter);
  const locationInfo = data?.data?.locationInfo as LocationInfo | undefined;
  const taskStats: TaskStatEntry[] = data?.data?.taskStats ?? [];

  const staffCount = locationInfo?.staff?.length ?? 0;
  const templateCount = locationInfo?.taskTemplates?.length ?? 0;
  const instanceCount = locationInfo?.taskInstances?.length ?? 0;
  const completedCount =
    taskStats.find((t) => t.status === "COMPLETED")?._count?.status ?? 0;
  const locationTz = locationInfo?.timezone ?? "UTC";

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!locationInfo) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <XCircle className="h-10 w-10 text-red-600" />
          <p className="text-base font-semibold text-gray-900">
            Location not found
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/locations"
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          Locations
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{locationInfo.name}</span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
              <MapPin className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {locationInfo.name}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                <Building2 className="h-3.5 w-3.5" />
                {locationInfo.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge
              status={locationInfo.isActive ? "ACTIVE" : "INACTIVE"}
            />
            {user?.role === "ADMIN" && (
              <DeleteButton
                name={locationInfo.name}
                description="This location, its schedules, task history, attendance, and evidence records will be removed. Staff accounts will stay, with their location and shift cleared."
                onDelete={async () => {
                  await deleteLocation.mutateAsync(locationInfo.id);
                  navigate("/locations", { replace: true });
                }}
              />
            )}
          </div>
        </div>

        <details className="mt-4 border-t border-border pt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Location settings
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
              <Navigation className="h-3 w-3" /> Lat:{" "}
              {fmtCoord(locationInfo.latitude)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
              <Navigation className="h-3 w-3 rotate-90" /> Lng:{" "}
              {fmtCoord(locationInfo.longitude)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
              <Radius className="h-3 w-3" /> Radius: {locationInfo.radiusMeters}
              m
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
              <Clock className="h-3 w-3" /> {locationInfo.timezone}
            </span>
          </div>
        </details>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-1">
          <Calendar className="ml-2 h-4 w-4 text-gray-400 shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              aria-pressed={activeFilter === f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                f.key === activeFilter
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {f.key === activeFilter && isFetching && (
                <RefreshCw className="h-3 w-3 animate-spin" />
              )}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Staff"
          value={staffCount}
          icon={Users}
          color="indigo"
        />
        <StatCard
          label="Scheduled tasks"
          value={templateCount}
          icon={ClipboardList}
          color="purple"
        />
        <StatCard
          label="Tasks in period"
          value={instanceCount}
          icon={Activity}
          color="cyan"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      {taskStats.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {taskStats.map((entry) => (
            <div key={entry.status} className="flex items-center gap-2">
              <StatusBadge status={entry.status} />
              <span className="text-sm font-semibold text-gray-900">
                {entry._count.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              aria-pressed={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "staff" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Shift
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locationInfo.staff?.length > 0 ? (
                locationInfo.staff.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-gray-100/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                          {s.name
                            .split(" ")
                            .map((w: string) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{s.email}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {fmtTime(s.shiftStart, locationTz)} –{" "}
                      {fmtTime(s.shiftEnd, locationTz)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        status={s.isActive ? "ACTIVE" : "INACTIVE"}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-gray-400"
                  >
                    No staff assigned to this location.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "schedule" && id && <LocationScheduleTab locationId={id} />}

      {activeTab === "templates" && (
        <LocationTemplatesTab
          templates={locationInfo.taskTemplates ?? []}
          staffList={locationInfo.staff ?? []}
          locationId={locationInfo.id}
          timeZone={locationTz}
          locationName={locationInfo.name}
        />
      )}

      {activeTab === "instances" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Title
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Shift
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Assigned To
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Late
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Proof
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Verification
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Areas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locationInfo.taskInstances?.length > 0 ? (
                locationInfo.taskInstances.map((ti) => {
                  const assignee = getTaskAssignee(ti);
                  const reassignmentCount = Math.max(
                    (ti.assignments?.length ?? 0) - 1,
                    0,
                  );

                  return (
                    <>
                      <tr
                        key={ti.id}
                        className="transition-colors hover:bg-gray-100/50"
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900">
                          {ti.title}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {new Date(ti.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {fmtTime(ti.shiftStart, locationTz)} –{" "}
                          {fmtTime(ti.shiftEnd, locationTz)}
                        </td>
                        <td className="px-5 py-3.5">
                          {assignee?.staff ? (
                            <div className="min-w-40">
                              <p className="font-medium text-gray-900">
                                {assignee.staff.name}
                              </p>
                              {assignee.staff.email && (
                                <p className="text-xs text-gray-500">
                                  {assignee.staff.email}
                                </p>
                              )}
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                  {assignee.isCurrent
                                    ? "Current"
                                    : assignee.status}
                                </span>
                                {reassignmentCount > 0 && (
                                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                    {reassignmentCount} reassigned
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={ti.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          {ti.isLate ? (
                            <span className="font-semibold text-amber-400">
                              +{ti.lateMinutes ?? "?"}m
                            </span>
                          ) : (
                            <span className="text-emerald-400">On time</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {ti.proofImageUrls && ti.proofImageUrls.length > 0 ? (
                            <div className="flex gap-1">
                              {ti.proofImageUrls.map(
                                (url: string, i: number) => (
                                  <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={url}
                                      alt={`Proof ${i + 1}`}
                                      className="h-9 w-9 rounded-md object-cover border border-gray-200 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                                    />
                                  </a>
                                ),
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <VerificationCell attempts={getLatestAttempts(ti)} />
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() =>
                              setExpandedInstanceId(
                                expandedInstanceId === ti.id ? null : ti.id,
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          >
                            {expandedInstanceId === ti.id ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                            Areas
                          </button>
                        </td>
                      </tr>
                      {expandedInstanceId === ti.id && (
                        <tr>
                          <td colSpan={9} className="bg-gray-50/50 px-5 py-4">
                            <AreaSubmissionsPanel taskInstanceId={ti.id} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-8 text-center text-sm text-gray-400"
                  >
                    No task instances for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LocationDetailPage;
