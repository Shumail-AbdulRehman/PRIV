import { useState } from "react";
import { nonRetiredFixtureCount } from "./types";
import MigrationSetup from "./MigrationSetup";
import { Link } from "react-router-dom";
import { Layers, Plus, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/common/StatusBadge";
import DataTable from "@/components/common/DataTable";
import { useLanguage } from "@/i18n/context";
import OperationsState from "../Manager/OperationsState";
import { useAreas } from "./queries";

export default function LocationAreasTab({
  locationId,
}: {
  locationId: number;
}) {
  const { t } = useLanguage();
  const query = useAreas(locationId);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("current");
  const areas = (query.data ?? []).filter(
    (a) =>
      (status === "all" ||
        (status === "current" && a.status !== "ARCHIVED") ||
        a.status === status) &&
      (a.name + " " + a.roomType).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="space-y-5">
      <div className="ops-section-heading flex items-start justify-between gap-3">
        <div>
          <h2>{t("Areas and inventory")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("Reusable rooms, fixtures and area QR codes.")}
          </p>
        </div>
        <Button asChild>
          <Link to={"/locations/" + locationId + "/areas/new"}>
            <Plus size={16} />
            {t("Add area")}
          </Link>
        </Button>
      </div>
      <div className="ops-toolbar">
        <label className="ops-search">
          <span className="flex items-center gap-2">
            <Search size={14} />
            {t("Search areas")}
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search by area name")}
          />
        </label>
        <label>
          {t("Area status")}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="current">{t("Current areas")}</option>
            <option value="ACTIVE">{t("Active")}</option>
            <option value="DRAFT">{t("Draft")}</option>
            <option value="ARCHIVED">{t("Archived")}</option>
            <option value="all">{t("All areas")}</option>
          </select>
        </label>
      </div>
      <OperationsState
        loading={query.isPending}
        layout="area-table"
        error={query.error}
        retry={() => void query.refetch()}
      />
      {query.data && !query.isError ? (
        <DataTable
          data={areas}
          pageSize={20}
          rowKey={(a) => a.id}
          emptyMessage="No areas match these filters. Add a room and its fixtures to get started."
          columns={[
            {
              key: "area",
              header: "Area",
              sortValue: (a) => a.name,
              render: (a) => (
                <div className="table-identity">
                  <Layers size={18} />
                  <div>
                    <strong>{a.name}</strong>
                    <p>{t(a.roomType.replaceAll("_", " ").toLowerCase())}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "fixtures",
              header: "Fixtures",
              sortValue: nonRetiredFixtureCount,
              render: nonRetiredFixtureCount,
            },
            {
              key: "schedules",
              header: "Active schedules",
              sortValue: (a) => a.activeScheduleCount ?? 0,
              render: (a) => a.activeScheduleCount ?? "—",
            },
            {
              key: "reviews",
              header: "Open issues",
              sortValue: (a) => a.exceptionCount ?? a._count?.exceptions ?? 0,
              render: (a) => a.exceptionCount ?? a._count?.exceptions ?? "—",
            },
            {
              key: "status",
              header: "Status",
              sortValue: (a) => a.status,
              render: (a) => <StatusBadge status={a.status} />,
            },
            {
              key: "action",
              header: "Action",
              render: (a) => (
                <Button asChild variant="outline">
                  <Link to={"/areas/" + a.id}>
                    {t("Open area")}
                    <ArrowRight size={14} />
                  </Link>
                </Button>
              ),
            },
          ]}
        />
      ) : null}
      <MigrationSetup locationId={locationId} />
    </section>
  );
}
