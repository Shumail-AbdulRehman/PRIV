import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatInTimeZone } from "date-fns-tz";
import DeleteButton from "@/components/common/DeleteButton";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, MoreVertical, Pencil, Plus } from "lucide-react";
import { useDeleteTaskTemplate, useEditTaskTemplate } from "@/pages/Task/queries";
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
  const deleteTemplate = useDeleteTaskTemplate();
  const editTemplate = useEditTaskTemplate();
  const assignStaff = useAssignStaffToTemplate();
  const [openMenu, setOpenMenu] = useState<number | null>(null);
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
    setOpenMenu(null);
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
          <p className="text-sm font-medium text-foreground">Task templates</p>
          <p className="text-sm text-muted-foreground">
            Create schedules for this location and optionally choose a team member.
          </p>
        </div>
        <Button className="rounded-lg" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4" /> Add template
        </Button>
        {createDialogOpen && <TaskScheduleWizard
          locationId={locationId}
          locationName={locationName}
          timeZone={timeZone}
          staffOptions={staffList}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreated={() => undefined}
        />}
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center">
          <ClipboardList className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-500">
            No task templates for this location.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t.id}
            className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {t.title}
                </h3>
                {t.description && (
                  <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                    {t.description}
                  </p>
                )}
              </div>
              {t.referenceImages && t.referenceImages.length > 0 ? (
                <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  {t.referenceImages.length} reference{" "}
                  {t.referenceImages.length === 1 ? "area" : "areas"}
                </span>
              ) : t.referenceImageUrl ? (
                <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  Reference set
                </span>
              ) : null}

              <div className="relative shrink-0">
                <button
                  aria-label={`Actions for ${t.title}`}
                  onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}
                  className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {openMenu === t.id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenMenu(null)}
                    />
                    <div className="absolute right-0 top-8 z-50 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                      <button
                        onClick={() => handleEditOpen(t)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <DeleteButton
                        name={t.title}
                        description="This schedule and all its task history, assignments, and evidence records will be removed."
                        onDelete={() => deleteTemplate.mutateAsync(t.id)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={t.recurringType ?? "ONCE"} />
              <StatusBadge status={t.isActive ? "ACTIVE" : "INACTIVE"} />
            </div>

            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Assigned To
              </p>
              {t.staff ? (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                    {t.staff.name
                      .split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600">{t.staff.name}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Unassigned</span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-400">Shift</p>
                <p className="text-gray-600 font-medium">
                  {fmtTimeWithTz(t.shiftStart, timeZone)} –{" "}
                  {fmtTimeWithTz(t.shiftEnd, timeZone)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Effective</p>
                <p className="text-gray-600 font-medium">
                  {t.effectiveDate
                    ? new Date(t.effectiveDate).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            {t.qrToken && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  QR Code
                </p>
                <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-3 border border-gray-100">
                  <QRCodeSVG
                    value={t.qrToken}
                    size={140}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1a1a1a"
                  />
                  <p className="text-[10px] text-gray-400 font-mono break-all text-center select-all">
                    {t.qrToken}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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
                  value={editForm.effectiveDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, effectiveDate: e.target.value })
                  }
                  min={todayDate}
                />
              </div>

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
