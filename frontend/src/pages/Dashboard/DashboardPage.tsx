import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { ArrowRight, Building2, CalendarDays, RefreshCw } from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import ScopeFilters from "@/components/common/ScopeFilters";
import DataTable from "@/components/common/DataTable";
import OperationalSummary from "@/components/common/OperationalSummary";
import WorkProgress from "@/components/common/WorkProgress";
import AttentionList from "@/components/common/AttentionList";
import OperationStatus from "@/components/common/OperationStatus";
import TaskWorker from "@/components/common/TaskWorker";
import {
  useOperations,
  scopeParams,
  dailyLink,
  locationTaskLink,
  workLabel,
  localTime,
  type OperationOverview,
} from "../Manager/operations";
import OwnerTrends from "../Manager/OwnerTrends";
import OperationsState from "../Manager/OperationsState";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const owner = useSelector((s: RootState) => s.auth.user?.role === "ADMIN");
  const [params] = useSearchParams();
  const query = useOperations<OperationOverview>(
    "overview",
    scopeParams(params),
  );
  const data = query.data;
  const historical = !!params.get("date") && params.get("date") !== "today";
  const comparison = data ? (
    <section className="ops-panel overview-comparison">
      <div className="ops-panel-heading">
        <div>
          <h2>
            {t(historical ? "Locations for this day" : "Locations today")}
          </h2>
          <p>{t("Attendance and submitted work at each site")}</p>
        </div>
        <Link className="ops-text-link" to="/locations">
          {t("View all locations")}
          <ArrowRight size={15} />
        </Link>
      </div>
      <DataTable
        data={data.comparison.slice(0, 4)}
        rowKey={(r) => r.location.id}
        emptyMessage="No locations assigned to this workspace."
        columns={[
          {
            key: "location",
            header: "Location",
            render: (r) => (
              <div className="table-identity">
                <Building2 size={18} />
                <strong>{r.location.name}</strong>
              </div>
            ),
          },
          {
            key: "staff",
            header: "Staff present",
            render: (r) => (
              <div className="table-progress">
                <small>
                  {r.present} {t("of")} {r.scheduled}
                </small>
                {r.scheduled > 0 ? (
                  <progress
                    aria-label={t("Staff present")}
                    max={r.scheduled}
                    value={r.present}
                  />
                ) : null}
              </div>
            ),
          },
          {
            key: "tasks",
            header: "Work submitted",
            render: (r) => (
              <div className="table-progress is-blue">
                <small>
                  {r.submitted} {t("of")} {r.tasks}
                </small>
                {r.tasks > 0 ? (
                  <progress
                    aria-label={t("Work submitted")}
                    max={r.tasks}
                    value={r.submitted}
                  />
                ) : null}
              </div>
            ),
          },
          {
            key: "review",
            header: "Reviews",
            render: (r) => (
              <OperationStatus
                state={r.reviews ? "REVIEW_REQUIRED" : "PASSED"}
                label={
                  r.reviews
                    ? String(r.reviews) + " " + t("reviews")
                    : "No open reviews"
                }
              />
            ),
          },
          {
            key: "action",
            header: "Action",
            render: (r) => (
              <Button asChild variant="outline">
                <Link
                  to={dailyLink(params, { locationId: String(r.location.id) })}
                >
                  {t("View")}
                  <ArrowRight size={14} />
                </Link>
              </Button>
            ),
          },
        ]}
      />
      {data.comparison.length > 4 ? (
        <div className="panel-footer">
          <span>{t("Showing {count} locations", { count: 4 })}</span>
          <Link to="/locations">
            {t("View all locations")}
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : null}
    </section>
  ) : null;
  const recent = data ? (
    <section className="ops-panel overview-recent overview-wide-tasks">
      <div className="ops-panel-heading">
        <div>
          <h2>{t(historical ? "Tasks for this day" : "Today’s tasks")}</h2>
          <p>{t("Scheduled work and its next action")}</p>
        </div>
        <Link
          className="ops-text-link"
          to={dailyLink(params, { tab: "tasks" })}
        >
          {t("View all tasks")}
          <ArrowRight size={15} />
        </Link>
      </div>
      {data.tasks.length ? (
        data.tasks.slice(0, 4).map((task) => (
          <Link
            className="ops-task-preview"
            key={task.id}
            to={locationTaskLink(task)}
          >
            <div>
              <strong>{task.areaNameSnapshot ?? task.title}</strong>
              <TaskWorker task={task} />
            </div>
            <p className="overview-task-location">{task.location.name}</p>
            <span>
              <OperationStatus
                state={task.staffSubmittedAt ? "PASSED" : task.rawStatus}
                label={workLabel(task)}
              />
              <ArrowRight size={14} />
            </span>
          </Link>
        ))
      ) : (
        <p className="ops-empty">{t("No scheduled work for this day.")}</p>
      )}
    </section>
  ) : null;
  return (
    <div className="ops-page">
      <header className="ops-header">
        <div>
          <span className="ops-eyebrow">
            <CalendarDays size={13} />
            {t(owner ? "Across your company" : "Your assigned locations")}
          </span>
          <h1>
            {t(
              owner
                ? "Company overview"
                : historical
                  ? "Operations overview"
                  : "Today’s work",
            )}
          </h1>
          <p>
            {t(
              owner
                ? "A clear view of work across your locations."
                : "Your team, cleaning progress, and what needs a decision.",
            )}
          </p>
        </div>
        <ScopeFilters locations={data?.locations ?? []} />
      </header>
      <OperationsState
        loading={query.isPending}
        layout={owner ? "owner-overview" : "manager-overview"}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {data && !query.isError ? (
        <>
          <OperationalSummary data={data} params={params} />
          <div className="overview-flow">
            <div className="overview-primary">
              {owner ? (
                <>
                  <WorkProgress data={data} params={params} />
                  <AttentionList data={data} params={params} />
                </>
              ) : (
                <>
                  <AttentionList data={data} params={params} />
                  <WorkProgress data={data} params={params} />
                </>
              )}
            </div>
            {comparison}
            {owner ? (
              <OwnerTrends
                locations={data.selected}
                asOf={data.asOf}
                date={params.get("date") ?? "today"}
              />
            ) : null}
            {recent}
          </div>
          <footer className="dashboard-updated">
            <span>
              {t("Updated {time}", {
                time: localTime(
                  data.asOf,
                  data.selected[0]?.timezone ?? "Asia/Karachi",
                  language,
                  true,
                ),
              })}
            </span>
            <Button
              variant="ghost"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              <RefreshCw
                size={14}
                className={query.isFetching ? "animate-spin" : ""}
              />
              {t("Refresh")}
            </Button>
          </footer>
        </>
      ) : null}
    </div>
  );
}
