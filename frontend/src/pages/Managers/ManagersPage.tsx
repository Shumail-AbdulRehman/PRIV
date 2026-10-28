import '../Staff/workforce-v5.css';
import ManagerAccessActions from "./ManagerAccessActions";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import OperationsState from "../Manager/OperationsState";
import { useLanguage } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetLocations } from "../Location/queries";
import { useGetManagers } from "./queries";
import ManagerFormDialog from "./ManagerFormDialog";
import type { LocationWithCounts } from "../Location/types";
import type { Manager } from "./types";

export default function ManagersPage() {
  const { t } = useLanguage();
  const getManagers = useGetManagers(),
    getLocations = useGetLocations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [success, setSuccess] = useState("");
  if (getManagers.isPending || getLocations.isPending)
    return <div className="workforce-page"><PageHeader title="Managers"/><OperationsState loading skeleton="table"/></div>;
  if (getManagers.isError || getLocations.isError)
    return (
      <div className="ops-page">
        <PageHeader title="Managers" />
        <OperationsState
          error={getManagers.error ?? getLocations.error}
          retry={() => {
            void getManagers.refetch();
            void getLocations.refetch();
          }}
        />
      </div>
    );
  const managers: Manager[] = getManagers.data?.data ?? [];
  const locations: LocationWithCounts[] = (
    getLocations.data?.data ?? []
  ).filter((loc: LocationWithCounts) => loc.isActive);
  const covered = new Set(
    managers.filter(m=>m.isActive).flatMap((m) => m.locations.map((l) => l.id)),
  );
  const taken = new Map<number, string>();
  for (const m of managers) {
    if (!m.isActive || m.id === editingManager?.id) continue;
    for (const l of m.locations) taken.set(l.id, m.name);
  }
  const openCreate = () => {
    setEditingManager(null);
    setDialogOpen(true);
  };
  const filtered = managers.filter(
    (m) =>
      (status === "all" || m.isActive === (status === "active")) &&
      (m.name + " " + m.email + " " + m.locations.map((l) => l.name).join(" "))
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="workforce-page">
      <PageHeader
        title="Managers"
        subtitle="Give each manager access to the locations they look after."
        action={
          locations.length ? (
            <Button onClick={openCreate}>
              <Plus size={16} />
              {t("Add manager")}
            </Button>
          ) : undefined
        }
      />
      {success ? (
        <p className="ops-save-result" role="status">
          {t(success)}
        </p>
      ) : null}
      <OperationsState/>
      <dl className="workforce-summary workforce-manager-summary" aria-label={t('Manager summary')}>
        <div><dt>{t('Total managers')}</dt><dd>{managers.length}</dd><p>{t('Company manager accounts')}</p></div>
        <div><dt>{t('Active managers')}</dt><dd>{managers.filter(m=>m.isActive).length}</dd><p>{t('Assigned-site access')}</p></div>
        <div><dt>{t('Locations covered')}</dt><dd>{covered.size}</dd><p>{t('One active manager per location')}</p></div>
      </dl>
      {locations.length||managers.length ? (
        <section className="workforce-panel workforce-directory">
          <div className="workforce-panel-heading"><h2>{t('Manager assignments')}</h2><p>{t('Review access and the sites assigned to each manager.')}</p></div>
          <div className="workforce-toolbar">
            <label className="">
              <span className="flex items-center gap-2">
                {t("Search managers")}
              </span>
              <Input
                aria-label={t("Search managers")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search by name, email or location")}
              />
            </label>
            <label>
              {t("Account status")}
              <select
                aria-label={t("Account status")}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">{t("All accounts")}</option>
                <option value="active">{t("Active")}</option>
                <option value="inactive">{t("Inactive")}</option>
              </select>
            </label>
          </div>
          <DataTable
            data={filtered}
            pageSize={20}
            rowKey={(m) => m.id}
            emptyMessage="No managers match these filters."
            columns={[
              {
                key: "name",
                header: "Manager",
                sortValue: (m) => m.name,
                render: (m) => (
                  <div className="table-identity">
                    <span className="workspace-avatar">
                      {m.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <div>
                      <strong>{m.name}</strong>
                      <p><bdi dir="ltr">{m.email}</bdi></p>
                    </div>
                  </div>
                ),
              },
              {
                key: "locations",
                header: "Assigned locations",
                sortValue: (m) => m.locations.length,
                render: (m) => (
                  <div className="manager-location-links">
                    {m.locations.map((l) => (
                      <Link key={l.id} to={"/locations/" + l.id}>
                        <MapPin size={13} />
                        {l.name}
                      </Link>
                    ))}
                    {!m.locations.length ? t("No locations assigned") : null}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Account status",
                sortValue: (m) => (m.isActive ? 1 : 0),
                render: (m) => (
                  <StatusBadge status={m.isActive ? "ACTIVE" : "INACTIVE"} />
                ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (m) => (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={!m.isActive}
                      onClick={() => {
                        setEditingManager(m);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil size={14} />
                      {t("Edit")}
                    </Button>
                    <ManagerAccessActions manager={m} />

                  </div>
                ),
              },
            ]}
          />
          <div className="workforce-panel-footer"><span>{t('{shown} of {total} managers',{shown:filtered.length,total:managers.length})}</span><Link to="/staff">{t('Back to team')}</Link></div>
        </section>
      ) : (
        <EmptyState
          icon={<MapPin />}
          message="You need at least one location before you can create a manager."
          action={
            <Button asChild>
              <Link to="/locations">{t("Go to locations")}</Link>
            </Button>
          }
        />
      )}
      <div className="workforce-access-context flex items-start gap-3">
        <ShieldCheck size={23} />
        <div>
          <strong>{t("Access follows assigned locations")}</strong>
          <p>
            {t(
              "Managers see their assigned sites. Company owners retain access across the workspace.",
            )}
          </p>
        </div>
      </div>
      {dialogOpen ? (
        <ManagerFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          manager={editingManager}
          locations={locations.map((l) => ({ id: l.id, name: l.name }))}
          takenLocations={taken}
          onSaved={() =>
            setSuccess(
              editingManager ? "Manager changes saved." : "Manager added.",
            )
          }
        />
      ) : null}
    </div>
  );
}
