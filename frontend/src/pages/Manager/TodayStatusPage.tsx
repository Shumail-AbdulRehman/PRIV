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
import OperationStatus from "@/components/common/OperationStatus";
import TaskWorker from "@/components/common/TaskWorker";
import { Search, RefreshCw, Sun, ShieldCheck, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import TodayPulse, { TodayAside } from "./TodayPulse";
import "./today.css";
import {
  useOperations,
  scopeParams,
  dailyLink,
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
  return (
    <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="today-task-drawer" showCloseButton={false} onCloseAutoFocus={(event) => { const opener=Array.from(document.querySelectorAll<HTMLAnchorElement>(`a[data-task-opener="${id}"]`)).find(el=>el.getClientRects().length>0); if (opener) { event.preventDefault(); opener.focus(); } }}>
        <div className="today-drawer-heading">
          <DialogTitle>{t("Task details")}</DialogTitle>
          <DialogClose asChild><Button variant="ghost">{t("Close details")}</Button></DialogClose>
        </div>
        <DialogDescription className="sr-only">{t("Task submission and verified completion are recorded separately.")}</DialogDescription>
      <div className="ops-panel-body">
        <OperationsState
          loading={query.isPending}
          layout="task-summary"
          error={query.error}
          retry={() => void query.refetch()}
        />
        {task ? (
          <>
            <h2>{task.areaNameSnapshot ?? task.title}</h2>
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
      </DialogContent>
    </Dialog>
  );
}
export default function TodayStatusPage() {
  const { t, language } = useLanguage();
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
    params.get("tab") !== "staff"
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
      if (key !== "page" && key !== "taskId") next.delete("page");
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
  function renderWorkStatus(task: OperationTask) {
    const submitted = !!task.staffSubmittedAt || task.status === 'COMPLETED';
    const overdue = !submitted && Date.parse(task.shiftEnd) < Date.parse(data?.asOf ?? '');
    return <OperationStatus
      state={submitted ? 'SUBMITTED' : overdue ? 'NOT_COMPLETED_INTIME' : task.rawStatus}
      label={overdue ? 'Overdue' : workLabel(task)}
    />;
  }
  function taskDestination(id: number) {
    return dailyLink(params, { ...Object.fromEntries(params), tab:'tasks', taskId:String(id) });
  }
  const days = overview.data?.days ?? [];
  const sharedLocalDate = days.length && new Set(days.map(day => day.localDate)).size === 1
    ? days[0].localDate : undefined;
  const dateLabel = sharedLocalDate
    ? new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-PK', {
        weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC',
      }).format(new Date(sharedLocalDate + 'T12:00:00Z'))
    : t('Today in each location');
  return (
    <div className="ops-page daily-work-page">
      <header className="ops-header today-heading">
        <div>
          <div className="today-date"><Sun size={17} aria-hidden="true" /><bdi>{dateLabel}</bdi></div>
          <h1>{t(params.get("date") && params.get("date") !== "today" ? "Daily records" : "Today, at a glance")}</h1>
          <p>{t("Your team, the work in motion, and what needs attention.")}</p>
        </div>
        <ScopeFilters localDate={sharedLocalDate} locations={data?.locations ?? overview.data?.locations ?? []} />
      </header>
      <OperationsState loading={overview.isPending} error={overview.error} retry={() => void overview.refetch()} layout="today-summary" />
      {overview.data && !overview.isError ? <TodayPulse data={overview.data} params={params} /> : null}
      <div className="today-layout">
      <section className="ops-panel today-register">
        <div className="ops-panel-heading">
          <div><h2>{t(tab === 'tasks' ? "Today’s tasks" : "Staff")} {data ? <span className="today-count">{data.total}</span> : null}</h2>
          <p>{t("Scheduled work across your assigned locations")}</p></div>
          <Button variant="ghost" disabled={query.isFetching} onClick={() => { void query.refetch(); void overview.refetch(); }}><RefreshCw size={16} aria-hidden="true" />{t("Refresh")}</Button>
        </div>
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
      <div className="ops-toolbar today-toolbar">
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
        {tab === 'tasks' ? <div className="today-status-tabs" role="group" aria-label={t("Task status")}>
          {[["all","All tasks"],["in-progress","In progress"],["submitted","Work submitted"],["overdue","Overdue"]].map(([value,label]) => <button key={value} type="button" aria-pressed={(params.get('status') ?? 'all') === value} onClick={() => update('status',value)}>{t(label)}</button>)}
        </div> : null}
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
              mobileRender={(r) => <div className="today-task-row">
                <div className="today-task-title"><strong><bdi>{r.areaNameSnapshot ?? r.title}</bdi></strong><p><bdi>{r.location.name}</bdi></p></div>
                <div><span className="today-field-label">{t('Assigned to')}</span><TaskWorker task={r}/></div>
                <div><span className="today-field-label">{t('Work status')}</span>{renderWorkStatus(r)}</div>
                <div className="today-task-time"><span className="today-field-label">{t('Scheduled')}</span><bdi>{localTime(r.shiftStart,r.location.timezone,language)} – {localTime(r.shiftEnd,r.location.timezone,language)}</bdi></div>
                {r.carryOver ? <small className="today-overnight">{t('Started yesterday · overnight shift')}</small> : null}
                <Button asChild variant="ghost" className="today-task-open"><Link data-task-opener={r.id} to={taskDestination(r.id)} preventScrollReset><ChevronRight size={18} aria-hidden="true"/><span className="sr-only">{t('Open task')}: {r.areaNameSnapshot ?? r.title}</span></Link></Button>
              </div>}
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
                  header: "Assigned to",
                  render: (r) => (
                    <div>
                      <TaskWorker task={r} />

                    </div>
                  ),
                },
                { key: "time", header: "Scheduled", render: (r) => <bdi>{localTime(r.shiftStart,r.location.timezone,language)} – {localTime(r.shiftEnd,r.location.timezone,language)}</bdi> },
                {
                  key: "status",
                  header: "Work status",
                  render: renderWorkStatus,
                },
                {
                  key: "action",
                  header: "Next action",
                  render: (r) => (
                    <Button asChild variant="outline">
                      <Link data-task-opener={r.id} to={taskDestination(r.id)} preventScrollReset><ChevronRight size={18} aria-hidden="true" /><span className="sr-only">{t("Open task")}: {r.areaNameSnapshot ?? r.title}</span></Link>
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
      </section>
      {overview.data && !overview.isError ? <TodayAside data={overview.data} params={params} /> : null}
      </div>
      <p className="today-footnote"><ShieldCheck size={16} aria-hidden="true" />{t("Task submission and verified completion are recorded separately.")}</p>
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
