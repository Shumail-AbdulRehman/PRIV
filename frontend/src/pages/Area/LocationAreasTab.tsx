import { useState } from "react";
import { nonRetiredFixtureCount } from "./types";
import MigrationSetup from "./MigrationSetup";
import { useSearchParams } from "react-router-dom";
import AreaTemplateForm from "./AreaTemplateForm";
import { Layers, Plus, Search, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/common/StatusBadge";
import DataTable from "@/components/common/DataTable";
import { useSetupFormText } from "./areaFormText";
import OperationsState from "../Manager/OperationsState";
import { useAreas } from "./queries";

export default function LocationAreasTab({
  locationId,
}: {
  locationId: number;
}) {
  const t = useSetupFormText();
  const query = useAreas(locationId);
  const [params, setParams] = useSearchParams();
  const selectedId = Number(params.get('area'));
  const creating = params.get('newArea') === '1';
  const editing = Number.isSafeInteger(selectedId) && selectedId > 0;
  const edit = (id?: number) => setParams(old => {
    const next = new URLSearchParams(old); next.set('tab', 'areas');
    next.delete('area'); next.delete('newArea');
    if (id) next.set('area', String(id)); else next.set('newArea', '1');
    return next;
  });
  const close = () => setParams(old => { const next = new URLSearchParams(old); next.delete('area'); next.delete('newArea'); return next; });
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
          <h2>{t("Area template")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("Add an area once, then reuse it in cleaning schedules.")}
          </p>
        </div>
        <Button type="button" onClick={() => edit()}><Plus size={16} />{t("Add area template")}</Button>
      </div>
      {(creating || editing) && <AreaTemplateForm key={creating ? 'new' : selectedId} locationId={locationId} areaId={creating ? undefined : selectedId} close={close} created={edit} />}
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
                    <p>{t(a.roomType === "WASHROOM" ? "Washroom" : a.roomType === "GENERAL" ? "General room" : a.roomType.replaceAll("_", " ").toLowerCase())}</p>
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
              key: "status",
              header: "Status",
              sortValue: (a) => a.status,
              render: (a) => <StatusBadge status={a.status} />,
            },
            {
              key: "action",
              header: "Action",
              render: (a) => (
                <Button type="button" variant="outline" onClick={() => edit(a.id)} aria-label={t('Edit {name}', {name: a.name})}><Pencil size={14} />{t("Edit area")}</Button>
              ),
            },
          ]}
        />
      ) : null}
      <MigrationSetup locationId={locationId} />
    </section>
  );
}
