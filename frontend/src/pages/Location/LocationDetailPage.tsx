import OperationStatus from "@/components/common/OperationStatus";
import { verificationLabel } from "../Verification/presentation";
import LocationOverview from "./LocationOverview";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import OperationsState from "../Manager/OperationsState";
import DataTable from "@/components/common/DataTable";
import TaskWorker from "@/components/common/TaskWorker";
import { taskAssignee } from "../Task/taskAssignee";
import { useLanguage } from "@/i18n/context";
import LocationAreasTab from "../Area/LocationAreasTab";
import DeleteButton from "@/components/common/DeleteButton";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import React, { useEffect, useRef, useState } from "react";
import LocationScheduleTab from "./components/LocationScheduleTab";
import LocationTemplatesTab from "./components/LocationTemplatesTab";
import type { LocationStaff, ReferenceImage, TaskTemplate } from "./types";
import {
  useParams,
  useNavigate,
  useSearchParams,
  Link,
} from "react-router-dom";
import { formatInTimeZone } from "date-fns-tz";
import { useGetLocationById, useDeleteLocation } from "./queries";
import type { LocationStatsFilter } from "./queries";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AreaSubmissionsPanel from "@/pages/Task/components/AreaSubmissionsPanel";
import {
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
  Plus,
  Settings2,
  LayoutDashboard,
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

type Tab =
  "overview" | "areas" | "staff" | "templates" | "instances" | "schedule";
const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "areas", label: "Areas and inventory", icon: ClipboardList },
  { key: "staff", label: "Staff and shifts", icon: Users },
  { key: "templates", label: "Cleaning schedule", icon: ClipboardList },
  { key: "schedule", label: "Weekly schedule", icon: Calendar },
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
  staffId: number | null;
  title: string;
  date: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  status: string;
  verificationVersion?: number;
  verificationState?: string;
  completionOutcome?: string | null;
  staffSubmittedAt?: string | null;
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
  const { t } = useLanguage();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const deleteLocation = useDeleteLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const taskParam = searchParams.get("taskId") ?? "";
  const selectedTaskId = /^[1-9]\d*$/.test(taskParam)
    ? Number(taskParam)
    : null;
  const taskHistoryRef = useRef<HTMLElement>(null);
  const activeTab =
    TABS.find((tab) => tab.key === searchParams.get("tab"))?.key ?? "overview";
  const setActiveTab = (tab: Tab) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("tab", tab);
      return next;
    });
  const [expandedInstanceId, setExpandedInstanceId] = useState<number | null>(
    null,
  );

  const currentFilter = FILTERS.find((f) => f.key === activeFilter)!;
  const filter = currentFilter.toFilter();

  const detailQuery = useGetLocationById(id!, filter);
  const { data, isLoading, isFetching } = detailQuery;
  const locationInfo = data?.data?.locationInfo as LocationInfo | undefined;
  const taskStats: TaskStatEntry[] = data?.data?.taskStats ?? [];
  useEffect(() => {
    if (
      activeTab !== "instances" ||
      !selectedTaskId ||
      isLoading ||
      detailQuery.isError
    )
      return;
    const frame = requestAnimationFrame(() => {
      taskHistoryRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
      taskHistoryRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeTab, selectedTaskId, isLoading, detailQuery.isError]);

  const staffCount = locationInfo?.staff?.length ?? 0;
  const templateCount = locationInfo?.taskTemplates?.length ?? 0;
  const instanceCount = locationInfo?.taskInstances?.length ?? 0;
  const completedCount =
    taskStats.find((t) => t.status === "COMPLETED")?._count?.status ?? 0;
  const locationTz = locationInfo?.timezone ?? "UTC";

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (detailQuery.isError)
    return (
      <div className="ops-page">
        <PageHeader title="Location" />
        <OperationsState
          error={detailQuery.error}
          retry={() => void detailQuery.refetch()}
        />
      </div>
    );
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

      <PageHeader
        title={locationInfo.name}
        subtitle={locationInfo.address}
        action={
          <>
            <StatusBadge
              status={locationInfo.isActive ? "ACTIVE" : "INACTIVE"}
            />
            {locationInfo.isActive ? (
              <Button asChild>
                <Link to={"/locations/" + locationInfo.id + "/areas/new"}>
                  <Plus size={16} />
                  {t("Add area")}
                </Link>
              </Button>
            ) : null}
            <Button
              variant="outline"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <Settings2 size={16} />
              {t("Location settings")}
            </Button>
          </>
        }
      />
      {settingsOpen ? (
        <section className="detail-settings space-y-4">
          <h2>{t("Location settings")}</h2>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>
              <Navigation size={14} className="inline" />{" "}
              {fmtCoord(locationInfo.latitude)},{" "}
              {fmtCoord(locationInfo.longitude)}
            </span>
            <span>
              <Radius size={14} className="inline" />{" "}
              {locationInfo.radiusMeters} m
            </span>
            <span>
              <Clock size={14} className="inline" /> {locationInfo.timezone}
            </span>
          </div>
          {user?.role === "ADMIN" ? (
            <DeleteButton
              name={locationInfo.name}
              description="This location, its schedules, task history, attendance, and evidence records will be removed. Staff accounts will stay, with their location and shift cleared."
              onDelete={async () => {
                await deleteLocation.mutateAsync(locationInfo.id);
                navigate("/locations", { replace: true });
              }}
            />
          ) : null}
        </section>
      ) : null}
      {activeTab !== "overview" ? (
        <>
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
              label="Work submitted"
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
        </>
      ) : null}
      <div className="ops-tabs" aria-label={t("Location sections")}>
        <div className="detail-tab-list">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              aria-pressed={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={activeTab === key ? "is-active" : ""}
            >
              <Icon className="h-4 w-4" />
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <LocationOverview locationId={locationInfo.id} onTab={setActiveTab} />
      )}
      {activeTab === "staff" && (
        <DataTable
          data={locationInfo.staff ?? []}
          pageSize={20}
          rowKey={(s) => s.id}
          emptyMessage="No staff assigned to this location."
          columns={[
            {
              key: "name",
              header: "Name",
              sortValue: (s) => s.name,
              render: (s) => (
                <div className="table-identity">
                  <span className="workspace-avatar">
                    {s.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <strong>{s.name}</strong>
                </div>
              ),
            },
            {
              key: "email",
              header: "Email",
              sortValue: (s) => s.email,
              render: (s) => s.email,
            },
            {
              key: "shift",
              header: "Shift",
              render: (s) =>
                fmtTime(s.shiftStart, locationTz) +
                " – " +
                fmtTime(s.shiftEnd, locationTz),
            },
            {
              key: "status",
              header: "Status",
              sortValue: (s) => (s.isActive ? 1 : 0),
              render: (s) => (
                <StatusBadge status={s.isActive ? "ACTIVE" : "INACTIVE"} />
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (s) => (
                <Button asChild variant="outline">
                  <Link to={"/staff/" + s.id}>{t("View worker")}</Link>
                </Button>
              ),
            },
          ]}
        />
      )}

      {activeTab === "areas" && id && (
        <LocationAreasTab locationId={Number(id)} />
      )}

      {activeTab === "schedule" && id && (
        <LocationScheduleTab locationId={id} />
      )}

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
        <section
          ref={taskHistoryRef}
          id="location-task-history"
          tabIndex={-1}
          aria-label={t("Task history")}
          data-task-id={selectedTaskId ?? undefined}
          className={selectedTaskId ? "task-history-selection" : undefined}
        >
          {selectedTaskId ? (
            <div className="ops-panel-heading">
              <h2>{t("Selected task")}</h2>
              <Button
                variant="outline"
                onClick={() =>
                  setSearchParams((previous) => {
                    const next = new URLSearchParams(previous);
                    next.delete("taskId");
                    return next;
                  })
                }
              >
                {t("Show all tasks")}
              </Button>
            </div>
          ) : null}
          <DataTable
            key={selectedTaskId ?? "all"}
            data={(locationInfo.taskInstances ?? []).filter(
              (task) => !selectedTaskId || task.id === selectedTaskId,
            )}
            pageSize={20}
            rowKey={(ti) => ti.id}
            emptyMessage={
              selectedTaskId
                ? "This task is not available for this location and period."
                : "No task instances for this period."
            }
            expandedRow={(ti) =>
              expandedInstanceId === ti.id ? (
                <AreaSubmissionsPanel taskInstanceId={ti.id} />
              ) : null
            }
            columns={[
              {
                key: "title",
                header: "Task",
                sortValue: (ti) => ti.title,
                render: (ti) => <strong>{ti.title}</strong>,
              },
              {
                key: "date",
                header: "Date",
                sortValue: (ti) => ti.date,
                render: (ti) =>
                  new Date(ti.date).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  }),
              },
              {
                key: "shift",
                header: "Shift",
                render: (ti) =>
                  fmtTime(ti.shiftStart, locationTz) +
                  " – " +
                  fmtTime(ti.shiftEnd, locationTz),
              },
              {
                key: "staff",
                header: "Assigned to",
                sortValue: (ti) => taskAssignee(ti).worker?.name ?? "",
                render: (ti) => {
                  const reassigned = Math.max(
                    (ti.assignments?.length ?? 0) - 1,
                    0,
                  );
                  return (
                    <div>
                      <TaskWorker
                        task={{
                          ...ti,
                          staff: locationInfo.staff.find(
                            (s) => s.id === ti.staffId,
                          ),
                        }}
                        details
                      />
                      {reassigned > 0 ? (
                        <small>
                          {reassigned} {t("reassigned")}
                        </small>
                      ) : null}
                    </div>
                  );
                },
              },
              {
                key: "status",
                header: "Work status",
                render: (ti) => (
                  <OperationStatus
                    state={
                      ti.staffSubmittedAt || ti.status === "COMPLETED"
                        ? "PASSED"
                        : ti.status
                    }
                    label={
                      ti.staffSubmittedAt || ti.status === "COMPLETED"
                        ? "Work submitted"
                        : ti.status === "IN_PROGRESS"
                          ? "In progress"
                          : ti.status === "MISSED" ||
                              ti.status === "NOT_COMPLETED_INTIME"
                            ? "Overdue"
                            : ti.status === "CANCELLED"
                              ? "Cancelled"
                              : "Not started"
                    }
                  />
                ),
              },
              {
                key: "late",
                header: "Late start",
                render: (ti) =>
                  ti.isLate ? (
                    <span className="text-amber-700">
                      +{ti.lateMinutes ?? "?"}m
                    </span>
                  ) : (
                    t("No late start recorded")
                  ),
              },
              {
                key: "review",
                header: "Verification",
                render: (ti) =>
                  ti.verificationVersion === 2 ? (
                    <OperationStatus
                      state={ti.verificationState}
                      label={verificationLabel(ti)}
                    />
                  ) : (
                    <VerificationCell attempts={getLatestAttempts(ti)} />
                  ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (ti) => (
                  <div className="flex flex-wrap gap-2">
                    {ti.verificationVersion === 2 ? (
                      <Button asChild variant="outline">
                        <Link
                          to={
                            "/verification/" +
                            ti.id +
                            "?returnTo=" +
                            encodeURIComponent(
                              "/locations/" +
                                id +
                                "?" +
                                searchParams.toString(),
                            )
                          }
                        >
                          {t("View task photos")}
                        </Link>
                      </Button>
                    ) : (
                      ti.proofImageUrls?.map((url, i) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={url}
                            alt={"Proof " + (i + 1)}
                            className="h-9 w-9 rounded-md object-cover"
                          />
                        </a>
                      ))
                    )}
                    <Button
                      variant="ghost"
                      aria-expanded={expandedInstanceId === ti.id}
                      onClick={() =>
                        setExpandedInstanceId(
                          expandedInstanceId === ti.id ? null : ti.id,
                        )
                      }
                    >
                      {expandedInstanceId === ti.id ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}{" "}
                      {t("Areas")}
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </section>
      )}
    </div>
  );
};

export default LocationDetailPage;
