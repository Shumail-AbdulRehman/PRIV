import TaskQr from '../Task/components/TaskQr';
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/common/DataTable";
import ScopeFilters from "@/components/common/ScopeFilters";
import Pagination from "@/components/common/Pagination";
import OperationalSummary from "@/components/common/OperationalSummary";
import AttentionList from "@/components/common/AttentionList";
import WorkProgress from "@/components/common/WorkProgress";
import OperationStatus from "@/components/common/OperationStatus";
import TaskWorker from "@/components/common/TaskWorker";
import { Search } from "lucide-react";
import {
  useOperations,
  scopeParams,
  dailyLink,
  locationTaskLink,
  workLabel,
  localTime,
  type OperationsPage,
  type OperationTask,
  type OperationStaff,
  type OperationOverview,
} from "./operations";
import OperationsState from "./OperationsState";
import { verificationLabel } from "../Verification/presentation";
import { client } from "@/api/client";
import type { VerificationSummary } from "../Verification/presentation";
function TaskPanel({ id, close }: { id: number; close: () => void }) {
  const { t, language } = useLanguage();
  const actorScope = useSelector(
    (s: RootState) =>
      `${s.auth.user?.companyId}:${s.auth.user?.role}:${s.auth.user?.id}`,
  );
  const query = useQuery({
    queryKey: ["verification-task", actorScope, id],
    queryFn: async ({ signal }) =>
      (
        await client.get<{ data: OperationTask & VerificationSummary }>(
          `/task-instance/${id}`,
          { signal },
        )
      ).data.data,
  });
  const task = query.data;
  useEffect(() => {
    if (!task) return;
    requestAnimationFrame(() => {
      const panel = document.getElementById("ops-task-detail");
      panel?.scrollIntoView({ block: "start", behavior: "instant" });
      panel?.focus({ preventScroll: true });
    });
  }, [task]);
  return (
    <section
      className="ops-panel ops-task-panel"
      aria-label={t("Task details")}
      id="ops-task-detail"
      tabIndex={-1}
    >
      <div className="ops-panel-heading">
        <h2>{task?.areaNameSnapshot ?? task?.title ?? t("Task details")}</h2>
        <Button variant="outline" onClick={close}>
          {t("Close details")}
        </Button>
      </div>
      <div className="ops-panel-body">
        <OperationsState
          loading={query.isPending}
          layout="task-summary"
          error={query.error}
          retry={() => void query.refetch()}
        />
        {task ? (
          <>
            <p>
              <strong>{t("Task")}:</strong> {task.title}
            </p>
            <p>{task.location?.name}</p>
            <TaskWorker task={task} />
            <p>
              {task.location
                ? localTime(
                    task.shiftStart,
                    task.location.timezone,
                    language,
                    true,
                  )
                : task.shiftStart}{" "}
              –{" "}
              {task.location
                ? localTime(task.shiftEnd, task.location.timezone, language)
                : task.shiftEnd}
            </p>
            <p>
              {t("Task status")}: {t(workLabel(task))}
            </p>
            <p>
              {t("Review status")}: {t(verificationLabel(task))}
            </p>
            {task.verificationVersion === 2 && !task.staffSubmittedAt && !['COMPLETED','CANCELLED'].includes(task.status) && <TaskQr taskId={task.id} />}
            {task.verificationException ? (
              <Button asChild>
                <Link to={`/exceptions/${task.verificationException.id}`}>
                  {t("Review")}
                </Link>
              </Button>
            ) : null}
            {!task.staffId && task.templateId ? (
              <Button asChild variant="outline">
                <Link
                  to={`/locations/${task.locationId}?tab=templates#schedule-${task.templateId}`}
                >
                  {t("Open cleaning schedule")}
                </Link>
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
export default function TodayStatusPage() {
  const { t, language } = useLanguage();
  const isManager = useSelector(
    (s: RootState) => s.auth.user?.role === "MANAGER",
  );
  const [params, setParams] = useSearchParams();
  const { hash, key: navigationKey } = useLocation();
  useEffect(() => {
    if (hash !== "#daily-records") return;
    const frame = requestAnimationFrame(() => {
      const records = document.getElementById("daily-records");
      records?.scrollIntoView({ block: "start", behavior: "instant" });
      records?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, navigationKey]);
  const tab =
    params.get("tab") === "tasks" || (!params.get("tab") && isManager)
      ? "tasks"
      : "staff";
  const overview = useOperations<OperationOverview>(
    "overview",
    scopeParams(params),
  );
  const filters = {
    ...scopeParams(params),
    ...Object.fromEntries(
      ["q", "attendance", "status", "workerId", "page", "pageSize"]
        .map((k) => [k, params.get(k) ?? ""])
        .filter(([, v]) => v),
    ),
  };
  const search = useDebouncedValue(params.get("q") ?? "");
  const appliedFilters = { ...filters, q: search };
  const staff = useOperations<OperationsPage<OperationStaff>>(
    "staff",
    appliedFilters,
    tab === "staff",
  );
  const tasks = useOperations<OperationsPage<OperationTask>>(
    "tasks",
    appliedFilters,
    tab === "tasks",
  );
  const query = tab === "staff" ? staff : tasks;
  const data = query.data;
  function update(key: string, value: string) {
    setParams((old) => {
      const next = new URLSearchParams(old);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    });
  }
  useEffect(() => {
    if (data && params.get("page") && Number(params.get("page")) !== data.page)
      setParams(
        (old) => {
          const next = new URLSearchParams(old);
          next.set("page", String(data.page));
          return next;
        },
        { replace: true },
      );
  }, [data, params, setParams]);
  return (
    <div className="ops-page daily-work-page">
      <header className="ops-header">
        <div>
          <h1>
            {t(
              params.get("date") && params.get("date") !== "today"
                ? "Daily records"
                : "Today",
            )}
          </h1>
          <p>{t("Your team and cleaning work. Times follow each location.")}</p>
          <p>{t('Daily schedules include every day, including weekends. Dates and times follow each location’s timezone.')}</p>
          <Link to="/setup">{t('Review location setup')}</Link>
        </div>
        <ScopeFilters locations={data?.locations ?? []} />
      </header>
      <OperationsState loading={overview.isPending} layout="today-summary" />
      {overview.data && !overview.isError ? (
        <>
          <OperationalSummary data={overview.data} params={params} />
          <div className="ops-overview-columns">
            <AttentionList data={overview.data} params={params} limit={3} />
            <WorkProgress data={overview.data} params={params} />
          </div>
        </>
      ) : null}
      <div
        className="ops-tabs"
        role="tablist"
        aria-label={t("Daily records")}
        id="daily-records"
        tabIndex={-1}
      >
        {["staff", "tasks"].map((v) => (
          <Link
            role="tab"
            aria-selected={tab === v}
            className={tab === v ? "is-active" : ""}
            key={v}
            to={dailyLink(params, { tab: v })}
          >
            {t(v === "staff" ? "Staff" : "Tasks")}
          </Link>
        ))}
      </div>
      <div className="ops-toolbar">
        <label className="ops-search">
          <span className="flex items-center gap-2">
            <Search size={14} />
            {t(tab === "staff" ? "Search staff" : "Find a task")}
          </span>
          <Input
            value={params.get("q") ?? ""}
            onChange={(e) => update("q", e.target.value)}
            placeholder={t("Search name, room or task")}
          />
        </label>
        <label>
          {t(tab === "staff" ? "Attendance" : "Work status")}
          <select
            value={
              params.get(tab === "staff" ? "attendance" : "status") ?? "all"
            }
            onChange={(e) =>
              update(tab === "staff" ? "attendance" : "status", e.target.value)
            }
          >
            {(tab === "staff"
              ? [
                  ["all", "All staff"],
                  ["present", "Present"],
                  ["absent", "Not checked in"],
                  ["upcoming", "Shift not started"],
                  ["missing", "No attendance record"],
                ]
              : [
                  ["all", "All tasks"],
                  ["not-started", "Not started"],
                  ["in-progress", "In progress"],
                  ["overdue", "Overdue"],
                  ["submitted", "Work submitted"],
                  ["unassigned", "Unassigned work"],
                ]
            ).map(([v, l]) => (
              <option value={v} key={v}>
                {t(l)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <OperationsState
        loading={query.isPending}
        layout="today-table"
        error={query.error}
        retry={() => void query.refetch()}
      />
      {data && !query.isError ? (
        <section className="ops-records">
          {tab === "staff" ? (
            <DataTable
              data={staff.data?.rows ?? []}
              rowKey={(r) => r.id}
              emptyMessage="No workers match these filters."
              columns={[
                {
                  key: "staff",
                  header: "Worker",
                  render: (r) => (
                    <div>
                      <strong>{r.name}</strong>
                      <p>{r.location.name}</p>
                      {r.carryOver ? (
                        <small>
                          {t("Started yesterday · overnight shift")}
                        </small>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: "shift",
                  header: "Shift",
                  render: (r) =>
                    r.attendance ? (
                      <>
                        {localTime(
                          r.attendance.expectedStart,
                          r.location.timezone,
                          language,
                        )}{" "}
                        –{" "}
                        {localTime(
                          r.attendance.expectedEnd,
                          r.location.timezone,
                          language,
                        )}
                      </>
                    ) : (
                      t("No attendance record")
                    ),
                },
                {
                  key: "attendance",
                  header: "Attendance",
                  render: (r) => (
                    <OperationStatus
                      state={
                        r.attendance?.checkOutTime
                          ? "CHECKED_OUT"
                          : r.attendance?.checkInTime
                            ? r.attendance.status
                            : r.attendance?.status === "ABSENT" &&
                                Date.parse(r.attendance.expectedStart) <=
                                  Date.parse(data.asOf)
                              ? "ABSENT"
                              : "PENDING"
                      }
                      label={
                        r.attendance?.checkInTime
                          ? r.attendance.checkOutTime
                            ? "Checked out"
                            : r.attendance.status === "LATE"
                              ? "Late check-in"
                              : r.attendance.status === "MISSED_CHECKOUT"
                                ? "Missed checkout"
                                : "Present"
                          : r.attendance?.status === "ABSENT"
                            ? Date.parse(r.attendance.expectedStart) >
                              Date.parse(data.asOf)
                              ? "Shift not started"
                              : "Not checked in"
                            : "No attendance record"
                      }
                    />
                  ),
                },
                {
                  key: "progress",
                  header: "Work submitted",
                  render: (r) => `${r.submittedCount} / ${r.taskCount}`,
                },
                {
                  key: "action",
                  header: "Next action",
                  render: (r) => (
                    <Button asChild variant="outline">
                      <Link
                        to={`/staff/${r.id}?dateFrom=${r.localDate}&dateTo=${r.localDate}&tab=overview&focus=today`}
                      >
                        {t("View worker")}
                      </Link>
                    </Button>
                  ),
                },
              ]}
            />
          ) : (
            <DataTable
              data={tasks.data?.rows ?? []}
              rowKey={(r) => r.id}
              emptyMessage="No tasks match these filters."
              columns={[
                {
                  key: "task",
                  header: "Area / task",
                  render: (r) => (
                    <div>
                      <strong>{r.areaNameSnapshot ?? r.title}</strong>
                      <p>
                        {r.title} · {r.location.name}
                      </p>
                      {r.carryOver ? (
                        <small>
                          {t("Started yesterday · overnight shift")}
                        </small>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: "worker",
                  header: "Worker / schedule",
                  render: (r) => (
                    <div>
                      <TaskWorker task={r} />
                      <p>
                        {localTime(r.shiftStart, r.location.timezone, language)}{" "}
                        – {localTime(r.shiftEnd, r.location.timezone, language)}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Work status",
                  render: (r) => (
                    <OperationStatus
                      state={
                        r.staffSubmittedAt || r.status === "COMPLETED"
                          ? "PASSED"
                          : Date.parse(r.shiftEnd) < Date.parse(data.asOf)
                            ? "NOT_COMPLETED_INTIME"
                            : r.rawStatus
                      }
                      label={
                        !r.staffSubmittedAt &&
                        r.status !== "COMPLETED" &&
                        Date.parse(r.shiftEnd) < Date.parse(data.asOf)
                          ? "Overdue"
                          : workLabel(r)
                      }
                    />
                  ),
                },
                {
                  key: "review",
                  header: "Review status",
                  render: (r) => (
                    <OperationStatus
                      state={r.verificationState}
                      label={verificationLabel(r)}
                    />
                  ),
                },
                {
                  key: "action",
                  header: "Next action",
                  render: (r) => (
                    <Button asChild variant="outline">
                      <Link to={locationTaskLink(r)}>{t("Open task")}</Link>
                    </Button>
                  ),
                },
              ]}
            />
          )}
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            pageSize={data.pageSize}
            total={data.total}
            onPage={(p) => update("page", String(p))}
            onSize={(p) => update("pageSize", String(p))}
          />
        </section>
      ) : null}
      {params.get("taskId") && Number(params.get("taskId")) > 0 ? (
        <TaskPanel
          key={params.get("taskId")}
          id={Number(params.get("taskId"))}
          close={() => update("taskId", "")}
        />
      ) : null}
    </div>
  );
}
