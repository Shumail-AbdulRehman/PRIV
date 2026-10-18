import {
  Bath,
  Trash2,
  RectangleHorizontal,
  Grid2X2,
  Droplets,
  Plus,
  QrCode,
  Pencil,
  Info,
  ArrowRight,
  MapPin,
} from "lucide-react";
import DataTable from "@/components/common/DataTable";
import AreaDailyWork, { AreaReviewPreview } from "./AreaDailyWork";
import OperationsState from "../Manager/OperationsState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useLanguage } from "@/i18n/context";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { invalidateWorkspace } from "@/lib/invalidateWorkspace";
import StandardPhotoPreview from "./StandardPhotoPreview";
import { useArea } from "./queries";
import {
  addItems,
  apiMessage,
  archiveArea,
  editArea,
  editItem,
  getAreaQr,
  getFixtureLabels,
  getStandards,
  rotateAreaQr,
  uploadStandard,
} from "./api";
import {
  fixtureNames,
  setupFixtureTypes,
  itemEditPayload,
  type AreaItem,
  type FixtureType,
} from "./types";
export default function AreaDetailPage() {
  const { id } = useParams();
  const areaId = Number(id);
  const query = useArea(areaId);
  const qc = useQueryClient();
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const tab = [
    "inventory",
    "tasks",
    "schedules",
    "qr",
    "standards",
    "history",
  ].includes(params.get("tab") ?? "")
    ? params.get("tab")!
    : "inventory";
  const setTab = (value: string) =>
    setParams((old) => {
      const next = new URLSearchParams(old);
      next.set("tab", value);
      return next;
    });
  const [showAll, setShowAll] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AreaItem | null>(null);
  const [confirm, setConfirm] = useState<
    "retire" | "rotate" | "archive" | null
  >(null);
  const [count, setCount] = useState(1);
  const [type, setType] = useState<FixtureType>("INDIAN_TOILET");
  const [photo, setPhoto] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [standardItem, setStandardItem] = useState("");
  const [name, setName] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const qr = useQuery({
    queryKey: ["area-qr", areaId],
    queryFn: () => getAreaQr(areaId),
    enabled: !!areaId && (tab === "qr" || tab === "inventory"),
  });
  const labels = useQuery({
    queryKey: ["area-labels", areaId],
    queryFn: () => getFixtureLabels(areaId),
    enabled: !!areaId && tab === "qr",
  });
  const standards = useQuery({
    queryKey: ["area-standards", areaId],
    queryFn: () => getStandards(areaId),
    enabled: !!areaId && tab === "standards",
  });
  const mutate = async (work: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await work();
      await invalidateWorkspace(qc);
      setEditing(null);
      setConfirm(null);
      setName(null);
      setInstructions(null);
      setSuccess("Changes saved. Existing task requirements remain unchanged.");
    } catch (err) {
      setError(apiMessage(err));
      if (
        (err as { response?: { status?: number } }).response?.status === 409
      ) {
        await query.refetch();
        if (tab === "qr") await qr.refetch();
        setError(
          apiMessage(err) +
            " Inventory refreshed. Review your edits against the latest inventory before saving again.",
        );
      }
    } finally {
      setBusy(false);
    }
  };
  if (query.isPending) return <LoadingSpinner fullScreen />;
  if (query.isError || !query.data)
    return (
      <div role="alert">
        <p>Area could not be loaded.</p>
        <Button onClick={() => void query.refetch()}>Retry</Button>
      </div>
    );
  const area = query.data;
  const templates = area.taskTemplates ?? area.templates ?? [];
  const visibleItems = [...area.items]
    .filter((item) => showAll || item.status !== "RETIRED")
    .sort((a, b) => a.sequence - b.sequence);
  const FixtureIcon = (kind: string) =>
    ({
      TOILET: Bath,
      INDIAN_TOILET: Bath,
      WESTERN_TOILET: Bath,
      SINK: Droplets,
      MIRROR: RectangleHorizontal,
      BIN: Trash2,
      FLOOR: Grid2X2,
    })[kind] ?? Grid2X2;
  const impactedTemplates =
    confirm === "retire" && editing
      ? templates.filter(
          (t) =>
            t.inventorySelection === "ALL" ||
            t.inventoryItems?.some((row) => row.areaItemId === editing.id),
        )
      : templates;
  return (
    <div className="ops-page area-detail-page">
      <Link
        className="ops-text-link print:hidden"
        to={"/locations/" + area.locationId + "?tab=areas"}
      >
        {t("Locations")} / {t("Back to location")}
      </Link>
      <PageHeader
        title={area.name}
        subtitle={
          area.layoutInstructions || t("Fixtures and cleaning requirements")
        }
        action={
          <>
            <StatusBadge status={area.status} />
            <Button
              disabled={area.status === "ARCHIVED"}
              onClick={() => {
                setTab("inventory");
                setShowAdd(true);
              }}
            >
              <Plus size={16} />
              {t("Add fixture")}
            </Button>
            <Button variant="outline" onClick={() => setTab("qr")}>
              <QrCode size={16} />
              {t("QR and labels")}
            </Button>
          </>
        }
      />
      <nav className="ops-tabs print:hidden" aria-label={t("Area sections")}>
        {["inventory", "tasks", "schedules", "qr", "standards", "history"].map(
          (value) => (
            <button
              className={tab === value ? "is-active" : ""}
              aria-pressed={tab === value}
              key={value}
              onClick={() => setTab(value)}
            >
              {t(
                (
                  {
                    inventory: "Fixtures",
                    tasks: "Today’s tasks",
                    schedules: "Cleaning schedule",
                    qr: "QR and labels",
                    standards: "Photo guidance",
                    history: "History",
                  } as Record<string, string>
                )[value],
              )}
            </button>
          ),
        )}
      </nav>
      {error && (
        <p role="alert" className="operations-notice">
          {error} {t("Your entered edits have been preserved.")}
        </p>
      )}
      {success && (
        <p role="status" className="ops-save-result">
          {t(success)}
        </p>
      )}
      {tab === "inventory" && (
        <>
          <div className="area-inventory-layout">
            <section className="ops-panel">
              <div className="ops-panel-heading">
                <div>
                  <h2>{t("Fixtures and required photos")}</h2>
                  <p>{t("Each fixture has its own capture instructions.")}</p>
                </div>
                <span className="panel-total">
                  <strong>
                    {area.items.filter((i) => i.status !== "RETIRED").length}
                  </strong>{" "}
                  {t("fixtures")}
                </span>
              </div>
              <DataTable
                data={showAll ? visibleItems : visibleItems.slice(0, 4)}
                pageSize={showAll ? 20 : undefined}
                rowKey={(item) => item.id}
                emptyMessage="Add fixtures to define this area’s required photos."
                columns={[
                  {
                    key: "fixture",
                    header: "Fixture",
                    render: (item) => {
                      const Icon = FixtureIcon(item.fixtureType);
                      return (
                        <div className="table-identity">
                          <Icon size={18} />
                          <div>
                            <strong>{item.displayName}</strong>
                            <p>{item.stableCode}</p>
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    key: "views",
                    header: "Required views",
                    render: (item) => (
                      <span>
                        {item.requiredViews
                          .map((view) =>
                            t(
                              view.instructions ??
                                view.key.replaceAll("_", " "),
                            ),
                          )
                          .join("; ")}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Condition",
                    render: (item) => <StatusBadge status={item.status} />,
                  },
                  {
                    key: "action",
                    header: "Action",
                    render: (item) => (
                      <Button
                        variant="outline"
                        disabled={
                          busy ||
                          area.status === "ARCHIVED" ||
                          item.status === "RETIRED"
                        }
                        onClick={() => setEditing({ ...item })}
                      >
                        {t("Configure")}
                      </Button>
                    ),
                  },
                ]}
              />
              <div className="panel-footer">
                <span>
                  {showAll
                    ? t("{count} fixtures", { count: visibleItems.length })
                    : t("{count} of {total} fixtures shown", {
                        count: Math.min(4, visibleItems.length),
                        total: visibleItems.length,
                      })}
                </span>
                <button onClick={() => setShowAll(!showAll)}>
                  {t(showAll ? "Show fewer" : "View all fixtures")}
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="ops-panel-body">
                <p className="workspace-footnote">
                  <Info size={15} />
                  {t(
                    "Active and maintenance describe inventory condition, not cleanliness.",
                  )}
                </p>
              </div>
              {showAdd ? (
                <div className="area-add-form">
                  <h3>{t("Add fixtures")}</h3>
                  <div>
                    <label>
                      {t("Fixture type")}
                      <select
                        value={type}
                        onChange={(event) =>
                          setType(event.target.value as FixtureType)
                        }
                        className="block w-full px-3"
                      >
                        {setupFixtureTypes.map((key) => (
                          <option key={key} value={key}>
                            {t(fixtureNames[key])}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {t("Count")}
                      <Input
                        type="number"
                        className="w-24"
                        min={1}
                        max={200}
                        value={count}
                        onChange={(event) =>
                          setCount(Number(event.target.value))
                        }
                      />
                    </label>
                    <Button
                      disabled={
                        busy ||
                        area.status === "ARCHIVED" ||
                        !Number.isSafeInteger(count) ||
                        count < 1 ||
                        count +
                          area.items.filter((i) => i.status !== "RETIRED")
                            .length >
                          200
                      }
                      onClick={() =>
                        void mutate(() =>
                          addItems(
                            areaId,
                            [{ fixtureType: type, count }],
                            area.inventoryVersion,
                          ),
                        )
                      }
                    >
                      {t("Add fixtures")}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowAdd(false)}>
                      {t("Cancel")}
                    </Button>
                  </div>
                </div>
              ) : null}
              <details className="area-edit-form print:hidden">
                <summary>{t("Edit area details")}</summary>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <label className="space-y-2 text-sm">
                    {t("Area name")}
                    <Input
                      value={name ?? area.name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    {t("Layout guidance")}
                    <Textarea
                      value={instructions ?? area.layoutInstructions ?? ""}
                      onChange={(event) => setInstructions(event.target.value)}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    disabled={
                      busy ||
                      area.status === "ARCHIVED" ||
                      (name === null && instructions === null) ||
                      !(name ?? area.name).trim()
                    }
                    onClick={() =>
                      void mutate(() =>
                        editArea(areaId, {
                          name: name ?? area.name,
                          layoutInstructions:
                            instructions ?? area.layoutInstructions ?? "",
                          expectedInventoryVersion: area.inventoryVersion,
                        }),
                      )
                    }
                  >
                    {t("Save area")}
                  </Button>
                  {area.status === "DRAFT" && (
                    <Button
                      variant="outline"
                      disabled={busy || !area.items.length}
                      onClick={() =>
                        void mutate(() =>
                          editArea(areaId, {
                            status: "ACTIVE",
                            expectedInventoryVersion: area.inventoryVersion,
                          }),
                        )
                      }
                    >
                      {t("Activate area")}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    disabled={area.status === "ARCHIVED"}
                    onClick={() => setConfirm("archive")}
                  >
                    {t("Archive area")}
                  </Button>
                </div>
              </details>
            </section>
            <aside className="area-setup">
              <section className="ops-panel">
                <div className="ops-panel-heading">
                  <h2>{t("Area setup")}</h2>
                </div>
                <div className="area-qr-preview">
                  {qr.data ? (
                    <QRCodeSVG
                      aria-label={t("Area QR")}
                      value={qr.data.payload}
                      size={106}
                    />
                  ) : (
                    <QrCode size={80} aria-hidden="true" />
                  )}
                  <div>
                    <p>{t("Scan this code to start assigned cleaning.")}</p>
                    <Button variant="outline" onClick={() => setTab("qr")}>
                      <QrCode size={15} />
                      {t("Open printable QR")}
                    </Button>
                  </div>
                </div>
                {qr.isError ? (
                  <div className="ops-panel-body">
                    <OperationsState
                      error={qr.error}
                      retry={() => void qr.refetch()}
                    />
                  </div>
                ) : null}
                <div className="area-settings-row">
                  <span>
                    <MapPin size={16} />
                    {t("Area status")}
                  </span>
                  <StatusBadge status={area.status} />
                </div>
                <div className="area-settings-row">
                  <span>
                    <Pencil size={16} />
                    {t("Inventory version")}
                  </span>
                  <strong>{area.inventoryVersion}</strong>
                </div>
              </section>
              <AreaReviewPreview areaId={areaId} locationId={area.locationId} />
            </aside>
          </div>
          {editing && (
            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="font-semibold">Configure {editing.displayName}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  Name
                  <Input
                    value={editing.displayName}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        displayName: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Capture order
                  <Input
                    type="number"
                    min={0}
                    value={editing.sequence}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        sequence: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Position hint
                  <Input
                    value={editing.positionHint ?? ""}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        positionHint: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="space-y-1 text-sm">
                  Identification
                  <select
                    className="h-11 w-full border border-border rounded-lg px-3"
                    value={editing.identificationMode}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        identificationMode: event.target
                          .value as AreaItem["identificationMode"],
                      })
                    }
                  >
                    <option value="ORDERED_CONTEXT">
                      Room order and surroundings
                    </option>
                    <option value="EXISTING_NUMBER">
                      Existing stall number
                    </option>
                    <option value="PRINTED_LABEL">Printed fixture label</option>
                  </select>
                </label>
                {editing.identificationMode === "EXISTING_NUMBER" && (
                  <label className="space-y-1 text-sm">
                    Visible number
                    <Input
                      value={editing.existingNumber ?? ""}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          existingNumber: event.target.value,
                        })
                      }
                    />
                  </label>
                )}
                <label className="space-y-1 text-sm">
                  Operational status
                  <select
                    className="h-11 w-full border border-border rounded-lg px-3"
                    value={editing.status}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        status: event.target.value as AreaItem["status"],
                      })
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Required views:{" "}
                {editing.requiredViews.map((view) => view.key).join(", ")}.
                Inventory edits affect future tasks only.
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={
                    busy ||
                    !editing.displayName.trim() ||
                    !Number.isSafeInteger(editing.sequence) ||
                    editing.sequence < 0 ||
                    (editing.identificationMode === "EXISTING_NUMBER" &&
                      !editing.existingNumber?.trim())
                  }
                  onClick={() =>
                    editing.status === "RETIRED"
                      ? setConfirm("retire")
                      : void mutate(() =>
                          editItem(
                            areaId,
                            editing.id,
                            itemEditPayload(editing, area.inventoryVersion),
                          ),
                        )
                  }
                >
                  Save fixture
                </Button>
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </section>
          )}
          <AreaDailyWork
            areaId={areaId}
            locationId={area.locationId}
            preview
            onViewAll={() => setTab("tasks")}
          />
        </>
      )}
      {tab === "schedules" && (
        <div className="space-y-3">
          {templates.length ? (
            templates.map((template) => (
              <div
                className="flex justify-between border-b border-border py-3"
                key={template.id}
              >
                <span>{template.title}</span>
                <StatusBadge status={template.setupStatus} />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No tasks use this area yet.
            </p>
          )}
          <Button asChild>
            <Link to={`/locations/${area.locationId}?tab=templates`}>
              Manage cleaning schedules
            </Link>
          </Button>
        </div>
      )}
      {tab === "tasks" && (
        <AreaDailyWork areaId={areaId} locationId={area.locationId} />
      )}
      {tab === "qr" && (
        <div className="space-y-6">
          {qr.isError ? (
            <div role="alert">
              <p>QR could not be loaded.</p>
              <Button onClick={() => void qr.refetch()}>Retry QR</Button>
            </div>
          ) : qr.data ? (
            <section className="space-y-3">
              <h2 className="font-semibold">{area.name}</h2>
              <QRCodeSVG
                aria-label={t("Area QR")}
                value={qr.data.payload}
                size={220}
              />
              <p className="text-sm text-muted-foreground print:hidden">
                Print and place this QR at the entrance. QR supports
                verification alongside location and fresh capture sessions.
              </p>
              <div className="flex gap-2 print:hidden">
                <Button onClick={() => window.print()}>Print QR</Button>
                <Button
                  variant="outline"
                  disabled={busy || area.status === "ARCHIVED"}
                  onClick={() => setConfirm("rotate")}
                >
                  Replace QR
                </Button>
              </div>
            </section>
          ) : (
            <p role="status">Loading QR…</p>
          )}
          <h2 className="font-semibold">Optional fixture labels</h2>
          <p className="text-sm text-muted-foreground print:hidden">
            Existing stall numbers also work. Printed labels help distinguish
            similar fixtures.
          </p>
          <Button
            className="print:hidden"
            variant="outline"
            disabled={!labels.data?.length}
            onClick={() => window.print()}
          >
            Print fixture labels
          </Button>
          {labels.isError && (
            <Button onClick={() => void labels.refetch()}>
              Retry fixture labels
            </Button>
          )}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {labels.data?.map((label) => (
              <div key={label.itemId} className="space-y-2 break-inside-avoid">
                <QRCodeSVG
                  aria-label={label.displayName}
                  value={label.payload}
                  size={110}
                />
                <p className="text-sm font-medium">{label.displayName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "standards" && (
        <section className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Optional examples explain a special standard. They never replace
            captured cleaning evidence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="max-w-xs"
              aria-label="Optional standard photo"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            />
            <Input
              aria-label="Standard caption"
              className="max-w-xs"
              placeholder="What does this standard show?"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
            <select
              aria-label="Standard fixture"
              className="h-11 rounded-lg border border-border px-3"
              value={standardItem}
              onChange={(event) => setStandardItem(event.target.value)}
            >
              <option value="">Whole area</option>
              {area.items.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.displayName}
                </option>
              ))}
            </select>
            <Button
              disabled={!photo || busy}
              onClick={() =>
                photo &&
                void mutate(() =>
                  uploadStandard(
                    areaId,
                    photo,
                    caption,
                    standardItem ? Number(standardItem) : undefined,
                  ),
                )
              }
            >
              Upload standard
            </Button>
          </div>
          {standards.isError && (
            <p role="alert">Standard photos could not be loaded.</p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            {standards.data?.map((standard) => (
              <StandardPhotoPreview
                key={standard.id}
                areaId={areaId}
                standard={standard}
              />
            ))}
          </div>
        </section>
      )}
      {tab === "history" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Task history retains the inventory that applied when each task was
            generated.
          </p>
          <Button asChild variant="outline">
            <Link to={`/locations/${area.locationId}?tab=instances`}>
              Open task history
            </Link>
          </Button>
        </div>
      )}
      {confirm && (
        <section
          role="alert"
          className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-5 print:hidden"
        >
          <h2 className="font-semibold">
            {confirm === "rotate"
              ? "Replace this area QR?"
              : confirm === "archive"
                ? "Archive this area?"
                : "Retire this fixture?"}
          </h2>
          <p className="text-sm">
            {confirm === "rotate"
              ? `${qr.data?.activeSessionCount ?? 0} active capture sessions will be revoked. Accepted evidence remains. Queued photos require review.`
              : `${impactedTemplates.filter((template) => template.isActive).length} active schedules may need review. Existing task requirements and evidence remain unchanged.`}
          </p>
          {templates.length > 0 && confirm !== "rotate" && (
            <ul className="text-sm">
              {impactedTemplates
                .filter((template) => template.isActive)
                .map((template) => (
                  <li key={template.id}>{template.title}</li>
                ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Button
              disabled={busy}
              onClick={() =>
                void mutate(() =>
                  confirm === "rotate"
                    ? rotateAreaQr(
                        areaId,
                        area.inventoryVersion,
                        qr.data?.version ?? area.qrVersion,
                      )
                    : confirm === "archive"
                      ? archiveArea(areaId, area.inventoryVersion)
                      : editItem(
                          areaId,
                          editing!.id,
                          itemEditPayload(editing!, area.inventoryVersion),
                        ),
                )
              }
            >
              Confirm{" "}
              {confirm === "rotate"
                ? "replacement"
                : confirm === "archive"
                  ? "archive"
                  : "retirement"}
            </Button>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
