import { Link } from "react-router-dom";
import { ArrowRight, Layers, Plus } from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { useAreas } from "../Area/queries";
import { nonRetiredFixtureCount } from "../Area/types";
import {
  useOperations,
  type OperationOverview,
  type OperationsPage,
  type OperationStaff,
} from "../Manager/operations";
import OperationsState from "../Manager/OperationsState";
import OperationalSummary from "@/components/common/OperationalSummary";
import AttentionList from "@/components/common/AttentionList";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import OperationStatus from "@/components/common/OperationStatus";
import { Button } from "@/components/ui/button";

export default function LocationOverview({
  locationId,
  onTab,
}: {
  locationId: number;
  onTab: (tab: "areas" | "staff") => void;
}) {
  const { t } = useLanguage();
  const params = new URLSearchParams({
    locationId: String(locationId),
    date: "today",
  });
  const overview = useOperations<OperationOverview>("overview", {
    locationId: String(locationId),
    date: "today",
  });
  const staff = useOperations<OperationsPage<OperationStaff>>("staff", {
    locationId: String(locationId),
    date: "today",
    pageSize: "4",
  });
  const areas = useAreas(locationId);
  return (
    <div className="detail-overview">
      <OperationsState
        loading={overview.isPending}
        error={overview.error}
        retry={() => void overview.refetch()}
      />
      {overview.data && !overview.isError ? (
        <OperationalSummary data={overview.data} params={params} />
      ) : null}
      <div className="location-overview-columns">
        <section className="ops-panel">
          <div className="ops-panel-heading">
            <div>
              <h2>{t("Areas in this location")}</h2>
              <p>{t("Rooms, fixtures, and active cleaning schedules")}</p>
            </div>
            <Button variant="ghost" onClick={() => onTab("areas")}>
              {t("View all")}
              <ArrowRight size={14} />
            </Button>
          </div>
          <OperationsState
            loading={areas.isPending}
            error={areas.error}
            retry={() => void areas.refetch()}
          />
          {areas.data && !areas.isError ? (
            <DataTable
              data={areas.data
                .filter((a) => a.status !== "ARCHIVED")
                .slice(0, 4)}
              rowKey={(a) => a.id}
              emptyMessage="Add an area and its fixtures to set up cleaning work."
              columns={[
                {
                  key: "area",
                  header: "Area",
                  render: (a) => (
                    <div className="table-identity">
                      <Layers size={18} />
                      <strong>{a.name}</strong>
                    </div>
                  ),
                },
                {
                  key: "fixtures",
                  header: "Fixtures",
                  render: (a) => nonRetiredFixtureCount(a),
                },
                {
                  key: "schedules",
                  header: "Schedules",
                  render: (a) => a.activeScheduleCount ?? "—",
                },
                {
                  key: "status",
                  header: "Status",
                  render: (a) => <StatusBadge status={a.status} />,
                },
                {
                  key: "action",
                  header: "Action",
                  render: (a) => (
                    <Button asChild variant="outline">
                      <Link to={"/areas/" + a.id}>
                        {t("Open")}
                        <ArrowRight size={14} />
                      </Link>
                    </Button>
                  ),
                },
              ]}
            />
          ) : null}
          <div className="panel-footer">
            <Button asChild variant="ghost">
              <Link to={"/locations/" + locationId + "/areas/new"}>
                <Plus size={14} />
                {t("Add area")}
              </Link>
            </Button>
            <button onClick={() => onTab("areas")}>
              {t("View all areas")}
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
        {overview.data && !overview.isError ? (
          <AttentionList data={overview.data} params={params} limit={3} />
        ) : null}
      </div>
      <section className="ops-panel">
        <div className="ops-panel-heading">
          <div>
            <h2>{t("Team today")}</h2>
            <p>{t("Attendance for this location’s scheduled shifts")}</p>
          </div>
          <Button variant="ghost" onClick={() => onTab("staff")}>
            {t("View all staff")}
            <ArrowRight size={14} />
          </Button>
        </div>
        <OperationsState
          loading={staff.isPending}
          error={staff.error}
          retry={() => void staff.refetch()}
        />
        {staff.data && !staff.isError ? (
          <div className="staff-preview-grid">
            {staff.data.rows.length ? (
              staff.data.rows.map((s) => (
                <Link
                  className="staff-preview"
                  key={s.id}
                  to={
                    "/staff/" +
                    s.id +
                    "?dateFrom=" +
                    s.localDate +
                    "&dateTo=" +
                    s.localDate +
                    "&focus=today"
                  }
                >
                  <span className="workspace-avatar">
                    {s.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div>
                    <strong>{s.name}</strong>
                    <OperationStatus
                      state={
                        s.attendance?.checkInTime
                          ? s.attendance.status
                          : s.attendance?.status === "ABSENT" &&
                              Date.parse(s.attendance.expectedStart) <=
                                Date.parse(staff.data!.asOf)
                            ? "ABSENT"
                            : "PENDING"
                      }
                      label={
                        s.attendance?.checkOutTime
                          ? "Checked out"
                          : s.attendance?.checkInTime
                            ? s.attendance.status === "LATE"
                              ? "Late check-in"
                              : s.attendance.status === "MISSED_CHECKOUT"
                                ? "Missed checkout"
                                : "Present"
                            : s.attendance &&
                                Date.parse(s.attendance.expectedStart) >
                                  Date.parse(staff.data!.asOf)
                              ? "Shift not started"
                              : s.attendance
                                ? "Not checked in"
                                : "No attendance record"
                      }
                    />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("No staff assigned to this location.")}
              </p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
