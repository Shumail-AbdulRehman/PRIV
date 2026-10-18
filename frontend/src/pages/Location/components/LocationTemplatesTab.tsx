import DataTable from "@/components/common/DataTable";
import { useLanguage } from "@/i18n/context";
import TemplateInventoryEditor from "@/pages/Area/TemplateInventoryEditor";
import { useAreas } from "@/pages/Area/queries";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import DeleteButton from "@/components/common/DeleteButton";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus } from "lucide-react";
import {
  useDeleteTaskTemplate,
  useEditTaskTemplate,
} from "@/pages/Task/queries";
import { useAssignStaffToTemplate } from "@/pages/Assignment/queries";
import type { EditTaskTemplateInput } from "@/pages/Task/api";
import type { LocationStaff, TaskTemplate } from "../types";
import { toDateStr, buildDateTimeIso } from "@/pages/Task/taskScheduleForm";
import TaskScheduleWizard from "@/pages/Task/components/TaskScheduleWizard";

const fmtTimeWithTz = (d: string | null, timeZone = "UTC") => {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), timeZone, "HH:mm (zzz)");
};

interface ApiErrorBody {
  message?: string;
  errors?: { message: string }[];
}

interface ApiError {
  response?: {
    data?: ApiErrorBody;
  };
  message?: string;
}

export default function LocationTemplatesTab({
  templates,
  staffList,
  locationId,
  timeZone,
  locationName,
}: {
  templates: TaskTemplate[];
  staffList: LocationStaff[];
  locationId: number;
  timeZone: string;
  locationName: string;
}) {
  const { t: translate } = useLanguage();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash.startsWith("#schedule-"))
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ block: "center" });
  }, [hash, templates]);
  const areasQuery = useAreas(locationId);
  const deleteTemplate = useDeleteTaskTemplate();
  const editTemplate = useEditTaskTemplate();
  const assignStaff = useAssignStaffToTemplate();
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(
    null,
  );
  const [editError, setEditError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    staffId: "" as string,
    shiftStart: "",
    shiftEnd: "",
    recurringType: "" as string,
    effectiveDate: "",
  });
  const todayDate = toDateStr(new Date());

  const toTimeValue = (iso?: string | null) => {
    if (!iso) return "";
    return formatInTimeZone(new Date(iso), timeZone, "HH:mm");
  };

  const toDateValue = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  };

  const wallTimeToIso = (base: string | null, timeValue: string) => {
    const datePart = formatInTimeZone(
      base ? new Date(base) : new Date(),
      timeZone,
      "yyyy-MM-dd",
    );
    return buildDateTimeIso(timeZone, datePart, timeValue);
  };

  const extractError = (err: unknown) => {
    const error = err as ApiError;
    return (
      error.response?.data?.errors?.map((e) => e.message).join(", ") ||
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred"
    );
  };

  const handleEditOpen = (t: TaskTemplate) => {
    setEditError(null);
    setEditingTemplate(t);
    setEditForm({
      title: t.title,
      description: t.description || "",
      staffId: t.staffId ? String(t.staffId) : "",
      shiftStart: toTimeValue(t.shiftStart),
      shiftEnd: toTimeValue(t.shiftEnd),
      recurringType: t.recurringType || "",
      effectiveDate: toDateValue(t.effectiveDate),
    });
  };

  const handleEditSave = async () => {
    if (!editingTemplate) return;
    setEditError(null);

    const payload: EditTaskTemplateInput = {};
    if (editForm.title !== editingTemplate.title)
      payload.title = editForm.title;
    if (editForm.description !== (editingTemplate.description || ""))
      payload.description = editForm.description || undefined;
    if (
      (editForm.recurringType === "DAILY" ||
        editForm.recurringType === "ONCE") &&
      editForm.recurringType !== editingTemplate.recurringType
    ) {
      payload.recurringType = editForm.recurringType;
    }
    if (
      editForm.shiftStart &&
      editForm.shiftStart !== toTimeValue(editingTemplate.shiftStart)
    ) {
      payload.shiftStart = wallTimeToIso(
        editingTemplate.shiftStart,
        editForm.shiftStart,
      );
    }
    if (
      editForm.shiftEnd &&
      editForm.shiftEnd !== toTimeValue(editingTemplate.shiftEnd)
    ) {
      payload.shiftEnd = wallTimeToIso(
        editingTemplate.shiftEnd,
        editForm.shiftEnd,
      );
    }
    if (
      editForm.effectiveDate &&
      editForm.effectiveDate !== toDateValue(editingTemplate.effectiveDate)
    ) {
      const [year, month, day] = editForm.effectiveDate.split("-").map(Number);
      payload.effectiveDate = new Date(
        Date.UTC(year, month - 1, day, 0, 0, 0),
      ).toISOString();
    }

    const staffChanged =
      editForm.staffId !== String(editingTemplate.staffId ?? "");
    const hasFieldChanges = Object.keys(payload).length > 0;

    try {
      if (hasFieldChanges) {
        await new Promise<void>((resolve, reject) => {
          editTemplate.mutate(
            { id: editingTemplate.id, data: payload },
            { onSuccess: () => resolve(), onError: (err) => reject(err) },
          );
        });
      }

      if (staffChanged && editForm.staffId) {
        await new Promise<void>((resolve, reject) => {
          assignStaff.mutate(
            {
              templateId: editingTemplate.id,
              staffId: Number(editForm.staffId),
            },
            { onSuccess: () => resolve(), onError: (err) => reject(err) },
          );
        });
      }

      setEditingTemplate(null);
    } catch (err: unknown) {
      setEditError(extractError(err));
    }
  };

  const inputCls =
    "w-full rounded-lg border border-border/80 bg-background/90 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/10";
  const formLabelCls = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {translate("Cleaning schedules")}
          </p>
          <p className="text-sm text-muted-foreground">
            Create schedules for this location and optionally choose a team
            member.
          </p>
        </div>
        <Button
          className="rounded-lg"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="size-4" /> {translate("Add cleaning schedule")}
        </Button>
        {createDialogOpen && (
          <TaskScheduleWizard
            locationId={locationId}
            locationName={locationName}
            timeZone={timeZone}
            staffOptions={staffList}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onCreated={() => undefined}
          />
        )}
      </div>

      <DataTable
        data={templates}
        rowKey={(row) => row.id}
        emptyMessage="No cleaning schedules for this location."
        columns={[
          {
            key: "schedule",
            header: "Cleaning schedule",
            sortValue: (row) => row.title,
            render: (row) => (
              <div id={"schedule-" + row.id}>
                <strong>{row.title}</strong>
                {row.description ? <p>{row.description}</p> : null}
                {row.setupStatus === "NEEDS_REVIEW" ? (
                  <Link
                    className="text-amber-800 underline text-xs"
                    to={"/locations/" + locationId + "?tab=areas"}
                  >
                    {translate("Inventory needs review")}
                  </Link>
                ) : null}
                {row.referenceImages?.length ? (
                  <p>
                    {row.referenceImages.length} {translate("reference areas")}
                  </p>
                ) : row.referenceImageUrl ? (
                  <p>{translate("Reference set")}</p>
                ) : null}
              </div>
            ),
          },
          {
            key: "area",
            header: "Area",
            sortValue: (row) => row.area?.name ?? "",
            render: (row) =>
              row.areaId ? (
                <div>
                  <Link className="text-primary" to={"/areas/" + row.areaId}>
                    {row.area?.name ??
                      areasQuery.data?.find((area) => area.id === row.areaId)
                        ?.name ??
                      "Area " + row.areaId}
                  </Link>
                  <p>
                    {translate(
                      row.inventorySelection === "SUBSET"
                        ? "Selected fixtures"
                        : "All active fixtures",
                    )}
                  </p>
                </div>
              ) : (
                "—"
              ),
          },
          {
            key: "staff",
            header: "Assigned to",
            sortValue: (row) => row.staff?.name ?? "",
            render: (row) => row.staff?.name ?? translate("Unassigned"),
          },
          {
            key: "shift",
            header: "Shift",
            render: (row) => (
              <div>
                {fmtTimeWithTz(row.shiftStart, timeZone)}
                <p>{fmtTimeWithTz(row.shiftEnd, timeZone)}</p>
                {row.effectiveDate ? (
                  <p>
                    {translate("Effective")}:{" "}
                    {new Date(row.effectiveDate).toLocaleDateString("en-PK", {
                      timeZone: "UTC",
                    })}
                  </p>
                ) : null}
              </div>
            ),
          },
          {
            key: "recurrence",
            header: "Recurrence",
            render: (row) => (
              <StatusBadge status={row.recurringType ?? "ONCE"} />
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => handleEditOpen(row)}>
                  <Pencil size={14} />
                  {translate("Edit schedule")}
                </Button>
                <DeleteButton
                  name={row.title}
                  preserveHistory
                  description="This removes the schedule and today's and future tasks from active work. Past task history and recorded evidence are kept."
                  onDelete={() => deleteTemplate.mutateAsync(row.id)}
                />
              </div>
            ),
          },
        ]}
      />

      {editingTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setEditingTemplate(null)}
        >
          <div
            className="mx-4 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Edit Task Template
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  aria-label="Schedule title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Description
                </label>
                <textarea
                  aria-label="Description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className={formLabelCls}>Assigned Staff</label>
                <select
                  aria-label="Assigned staff"
                  value={editForm.staffId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, staffId: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">Unassigned</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={formLabelCls}>Shift Start</label>
                  <Input
                    type="time"
                    aria-label="Shift start"
                    value={editForm.shiftStart}
                    onChange={(e) =>
                      setEditForm({ ...editForm, shiftStart: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={formLabelCls}>Shift End</label>
                  <Input
                    type="time"
                    aria-label="Shift end"
                    value={editForm.shiftEnd}
                    onChange={(e) =>
                      setEditForm({ ...editForm, shiftEnd: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className={formLabelCls}>Recurring Type</label>
                <select
                  aria-label="Recurrence"
                  value={editForm.recurringType}
                  onChange={(e) =>
                    setEditForm({ ...editForm, recurringType: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">Select type</option>
                  <option value="DAILY">Daily</option>
                  <option value="ONCE">Once</option>
                </select>
              </div>

              <div>
                <label className={formLabelCls}>Effective Date</label>
                <Input
                  type="date"
                  aria-label="Effective date"
                  value={editForm.effectiveDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, effectiveDate: e.target.value })
                  }
                  min={todayDate}
                />
              </div>

              {editingTemplate.areaId && (
                <TemplateInventoryEditor
                  key={editingTemplate.id}
                  templateId={editingTemplate.id}
                  areaId={editingTemplate.areaId}
                />
              )}

              {editError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {editError}
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editTemplate.isPending || !editForm.title.trim()}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {editTemplate.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
