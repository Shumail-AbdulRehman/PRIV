import { useGetLocations } from "./queries";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import OperationStatus from "@/components/common/OperationStatus";
import OperationsState from "../Manager/OperationsState";
import { useOperations, type OperationOverview } from "../Manager/operations";
import { useLanguage } from "@/i18n/context";
import { Link, useSearchParams } from "react-router-dom";
import type { LocationWithCounts } from "./types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import {
  MapPin,
  Plus,
  Search,
  Building2,
  Users,
  ClipboardList,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/common/StatCard";
import { useState } from "react";
import LocationFormDialog from "./LocationFormDialog";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export default function LocationsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [success, setSuccess] = useState("");
  const operations = useOperations<OperationOverview>("overview", {
    date: "today",
  });
  const getLocations = useGetLocations();
  const user = useSelector((s: RootState) => s.auth.user);
  const isAdmin = user?.role === "ADMIN";
  const [params,setParams]=useSearchParams();
  const dialogOpen=params.get('create')==='1';
  const setDialogOpen=(open:boolean)=>setParams(previous=>{const result=new URLSearchParams(previous);if(open)result.set('create','1');else result.delete('create');return result;},{replace:true});
  if (getLocations.isPending) return <LoadingSpinner fullScreen />;

  if (getLocations.isError)
    return (
      <div className="ops-page">
        <PageHeader
          title="Locations"
          subtitle="Your sites and cleaning operations"
        />
        <OperationsState
          error={getLocations.error}
          retry={() => void getLocations.refetch()}
        />
      </div>
    );
  const locations: LocationWithCounts[] = getLocations.data?.data ?? [];
  const visible = locations.filter(
    (loc) =>
      (statusFilter === "all" ||
        loc.isActive === (statusFilter === "active")) &&
      (loc.name + " " + loc.address)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const daily = new Map(
    (operations.isError ? [] : (operations.data?.comparison ?? [])).map(
      (row) => [row.location.id, row],
    ),
  );
  const totalStaff = locations.reduce(
    (sum: number, loc: LocationWithCounts) => sum + loc._count.staff,
    0,
  );
  const totalTemplates = locations.reduce(
    (sum: number, loc: LocationWithCounts) => sum + loc._count.taskTemplates,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        subtitle="See your sites, teams, and today’s cleaning work."
        action={
          isAdmin ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus size={16} />
              {t("Add location")}
            </Button>
          ) : undefined
        }
      />

      {isAdmin ? (
        <LocationFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSaved={() => {
            setDialogOpen(false);
            setSuccess(
              "Location created. Add areas and assign your team to get started.",
            );
          }}
        />
      ) : null}
      {success ? (
        <p className="ops-save-result" role="status">
          {t(success)}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active locations"
          value={locations.filter((loc) => loc.isActive).length}
          icon={MapPin}
        />
        <StatCard
          label="Assigned staff"
          value={totalStaff}
          icon={Users}
          tone="sky"
        />
        <StatCard
          label="Cleaning schedules"
          value={totalTemplates}
          icon={ClipboardList}
          tone="emerald"
        />
      </div>
      <div className="ops-toolbar">
        <label className="ops-search">
          <span className="flex items-center gap-2">
            <Search size={14} />
            {t("Search locations")}
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search by name or address")}
          />
        </label>
        <label>
          {t("Location status")}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="active">{t("Active locations")}</option>
            <option value="inactive">{t("Inactive locations")}</option>
            <option value="all">{t("All locations")}</option>
          </select>
        </label>
      </div>
      {operations.isError ? (
        <p className="workspace-footnote">
          {t("Today’s attendance and task totals are unavailable.")}{" "}
          <button
            className="text-primary underline"
            onClick={() => void operations.refetch()}
          >
            {t("Retry")}
          </button>
        </p>
      ) : null}
      {locations.length ? (
        <DataTable
          data={visible}
          pageSize={20}
          rowKey={(loc) => loc.id}
          emptyMessage="No locations match these filters."
          columns={[
            {
              key: "location",
              header: "Location",
              sortValue: (loc) => loc.name,
              render: (loc) => (
                <div className="table-identity">
                  <Building2 size={18} />
                  <div>
                    <strong>{loc.name}</strong>
                    <p>{loc.address}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "staff",
              header: "Staff present",
              sortValue: (loc) => daily.get(loc.id)?.present ?? -1,
              render: (loc) => {
                const row = daily.get(loc.id);
                return row ? (
                  <div className="table-progress">
                    <small>
                      {row.present} {t("of")} {row.scheduled}
                    </small>
                    {row.scheduled > 0 ? (
                      <progress
                        aria-label={t("Staff present")}
                        max={row.scheduled}
                        value={row.present}
                      />
                    ) : null}
                  </div>
                ) : (
                  <span aria-label={t("Information unavailable")}>—</span>
                );
              },
            },
            {
              key: "tasks",
              header: "Submitted / due",
              sortValue: (loc) => daily.get(loc.id)?.submitted ?? -1,
              render: (loc) => {
                const row = daily.get(loc.id);
                return row ? (
                  <div className="table-progress is-blue">
                    <small>
                      {row.submitted} {t("of")} {row.tasks}
                    </small>
                    {row.tasks > 0 ? (
                      <progress
                        aria-label={t("Work submitted")}
                        max={row.tasks}
                        value={row.submitted}
                      />
                    ) : null}
                  </div>
                ) : (
                  <span aria-label={t("Information unavailable")}>—</span>
                );
              },
            },
            {
              key: "review",
              header: "Waiting for review",
              sortValue: (loc) => daily.get(loc.id)?.reviews ?? -1,
              render: (loc) => {
                const row = daily.get(loc.id);
                return row ? (
                  <OperationStatus
                    state={row.reviews ? "REVIEW_REQUIRED" : "PASSED"}
                    label={
                      row.reviews
                        ? String(row.reviews) + " " + t("reviews")
                        : "No open reviews"
                    }
                  />
                ) : (
                  "—"
                );
              },
            },
            {
              key: "status",
              header: "Status",
              sortValue: (loc) => (loc.isActive ? 1 : 0),
              render: (loc) => (
                <StatusBadge status={loc.isActive ? "ACTIVE" : "INACTIVE"} />
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (loc) => (
                <Button asChild>
                  <Link to={"/locations/" + loc.id}>
                    {t("Open")}
                    <ArrowRight size={14} />
                  </Link>
                </Button>
              ),
            },
          ]}
        />
      ) : (
        <EmptyState
          icon={<MapPin />}
          message={
            isAdmin
              ? "No locations yet. Add your first location to get started."
              : "No locations assigned to you yet. Contact your admin."
          }
          action={
            isAdmin ? (
              <Button onClick={() => setDialogOpen(true)}>
                {t("Add location")}
              </Button>
            ) : undefined
          }
        />
      )}
      <div className="directory-guide">
        <Layers size={23} />
        <div>
          <strong>{t("Inside a location")}</strong>
          <p>
            {t(
              "Open a site to manage its areas and fixtures, staff and shifts, cleaning schedules, and photo reviews.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
