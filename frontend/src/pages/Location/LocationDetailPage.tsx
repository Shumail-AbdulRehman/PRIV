import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useGetLocationById } from "./queries";
import type { LocationStatsFilter } from "./queries";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useCreateTaskTemplate, useDeleteTaskTemplate, useEditTaskTemplate } from "@/pages/Task/queries";
import { useAssignStaffToTemplate } from "@/pages/Assignment/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Building2,
  Clock,
  Users,
  ClipboardList,
  Navigation,
  Radius,
  XCircle,
  Activity,
  CalendarCheck,
  Calendar,
  RefreshCw,
  Trash2,
  Pencil,
  MoreVertical,
  Plus,
} from "lucide-react";

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtCoord = (v: string) => parseFloat(v).toFixed(6);
const fmtTime = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

type FilterKey = "today" | "yesterday" | "7days" | "all";
const FILTERS: { key: FilterKey; label: string; toFilter: () => LocationStatsFilter | undefined }[] = [
  { key: "today", label: "Today", toFilter: () => { const t = toDateStr(new Date()); return { type: "range", dateFrom: t, dateTo: t }; } },
  { key: "yesterday", label: "Yesterday", toFilter: () => { const y = new Date(); y.setDate(y.getDate() - 1); const s = toDateStr(y); return { type: "range", dateFrom: s, dateTo: s }; } },
  { key: "7days", label: "Last 7 Days", toFilter: () => ({ type: "days", days: 7 }) },
  { key: "all", label: "All Time", toFilter: () => undefined },
];

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-teal-100 text-teal-600",
    cyan: "bg-sky-100 text-sky-600",
    purple: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color] ?? colors.indigo}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

type Tab = "staff" | "templates" | "instances";
const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "staff", label: "Staff", icon: Users },
  { key: "templates", label: "Task Templates", icon: ClipboardList },
  { key: "instances", label: "Task Instances", icon: Clock },
];

interface TaskStatEntry { status: string; _count: { status: number } }

interface TemplateCreateForm {
  title: string;
  description: string;
  staffId: string;
  shiftStart: string;
  shiftEnd: string;
  recurringType: "DAILY" | "ONCE";
  effectiveDate: string;
}

function TemplatesTab({
  templates,
  staffList,
  locationId,
}: {
  templates: any[];
  staffList: any[];
  locationId: number;
}) {
  const queryClient = useQueryClient();
  const createTemplate = useCreateTaskTemplate(false);
  const deleteTemplate = useDeleteTaskTemplate();
  const editTemplate = useEditTaskTemplate();
  const assignStaff = useAssignStaffToTemplate();
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TemplateCreateForm>({
    title: "",
    description: "",
    staffId: "",
    shiftStart: "",
    shiftEnd: "",
    recurringType: "DAILY",
    effectiveDate: toDateStr(new Date()),
  });
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

  const toTimeValue = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const toDateValue = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toISOString().split("T")[0];
  };

  const resetCreateForm = () => {
    setCreateForm({
      title: "",
      description: "",
      staffId: "",
      shiftStart: "",
      shiftEnd: "",
      recurringType: "DAILY",
      effectiveDate: toDateStr(new Date()),
    });
    setCreateError(null);
  };

  const buildDateTimeIso = (dateValue: string, timeValue: string) => {
    const localDate = new Date(`${dateValue}T${timeValue}:00`);
    return localDate.toISOString();
  };

  const buildEffectiveDate = (dateValue: string) => {
    return new Date(`${dateValue}T12:00:00`);
  };

  const extractError = (err: any) =>
    err?.response?.data?.errors?.map((e: any) => e.message).join(", ") ||
    err?.response?.data?.message ||
    err?.message ||
    "An unknown error occurred";

  const handleDelete = (t: any) => {
    setOpenMenu(null);
    if (confirm(`Delete "${t.title}"? This will cancel all pending task instances.`)) {
      deleteTemplate.mutate(t.id);
    }
  };

  const handleCreateTemplate = async () => {
    setCreateError(null);

    if (!createForm.title.trim() || !createForm.shiftStart || !createForm.shiftEnd || !createForm.effectiveDate) {
      setCreateError("Title, shift start, shift end, and effective date are required.");
      return;
    }

    if (!createForm.staffId) {
      setCreateError("Staff assignment is required for every task template.");
      return;
    }

    let createdId: number | null = null;
    try {
      const created = await createTemplate.mutateAsync({
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        locationId,
        shiftStart: new Date(buildDateTimeIso(createForm.effectiveDate, createForm.shiftStart)),
        shiftEnd: new Date(buildDateTimeIso(createForm.effectiveDate, createForm.shiftEnd)),
        recurringType: createForm.recurringType,
        effectiveDate: buildEffectiveDate(createForm.effectiveDate),
      });

      createdId = created?.data?.id ?? null;

      if (!createdId) {
        throw new Error("Task template was created but no template id was returned.");
      }

      await assignStaff.mutateAsync({
        templateId: createdId,
        staffId: Number(createForm.staffId),
      });

      await queryClient.invalidateQueries({ queryKey: ["location"] });
      resetCreateForm();
      setCreateDialogOpen(false);
    } catch (err: unknown) {
      if (createdId) {
        try {
          await deleteTemplate.mutateAsync(createdId);
        } catch {
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["location"] });
      setCreateError(extractError(err));
    }
  };

  const handleEditOpen = (t: any) => {
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

    const payload: Record<string, any> = {};
    if (editForm.title !== editingTemplate.title) payload.title = editForm.title;
    if (editForm.description !== (editingTemplate.description || "")) payload.description = editForm.description || undefined;
    if (editForm.recurringType && editForm.recurringType !== editingTemplate.recurringType) {
      payload.recurringType = editForm.recurringType;
    }
    if (editForm.shiftStart && editForm.shiftStart !== toTimeValue(editingTemplate.shiftStart)) {
      const base = new Date(editingTemplate.shiftStart);
      const [h, m] = editForm.shiftStart.split(":").map(Number);
      base.setHours(h, m, 0, 0);
      payload.shiftStart = base.toISOString();
    }
    if (editForm.shiftEnd && editForm.shiftEnd !== toTimeValue(editingTemplate.shiftEnd)) {
      const base = new Date(editingTemplate.shiftEnd);
      const [h, m] = editForm.shiftEnd.split(":").map(Number);
      base.setHours(h, m, 0, 0);
      payload.shiftEnd = base.toISOString();
    }
    if (editForm.effectiveDate && editForm.effectiveDate !== toDateValue(editingTemplate.effectiveDate)) {
      payload.effectiveDate = new Date(editForm.effectiveDate).toISOString();
    }

    const staffChanged = editForm.staffId !== String(editingTemplate.staffId ?? "");
    const hasFieldChanges = Object.keys(payload).length > 0;

    try {
      if (hasFieldChanges) {
        await new Promise<void>((resolve, reject) => {
          editTemplate.mutate(
            { id: editingTemplate.id, data: payload },
            { onSuccess: () => resolve(), onError: (err) => reject(err) }
          );
        });
      }

      if (staffChanged && editForm.staffId) {
        await new Promise<void>((resolve, reject) => {
          assignStaff.mutate(
            { templateId: editingTemplate.id, staffId: Number(editForm.staffId) },
            { onSuccess: () => resolve(), onError: (err) => reject(err) }
          );
        });
      }

      setEditingTemplate(null);
    } catch (err: unknown) {
      setEditError(extractError(err));
    }
  };

  const inputCls = "w-full rounded-2xl border border-border/80 bg-background/90 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/10";
  const formLabelCls = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Task templates</p>
          <p className="text-sm text-muted-foreground">
            Every template must be assigned to a staff member from the same location.
          </p>
        </div>
        <Dialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) resetCreateForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-2xl">
              <Plus className="size-4" />
              Add template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto border-border/70 bg-card text-card-foreground sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create task template</DialogTitle>
              <DialogDescription>
                This follows the backend flow: create the task template at the location, then immediately assign staff. If assignment fails, the new template is rolled back.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className={formLabelCls}>Title</label>
                <Input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Open and sanitize lobby"
                />
              </div>
              <div>
                <label className={formLabelCls}>Description</label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Optional notes for the task template"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={formLabelCls}>Recurring type</label>
                  <select
                    value={createForm.recurringType}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        recurringType: e.target.value as "DAILY" | "ONCE",
                      })
                    }
                    className={inputCls}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="ONCE">Once</option>
                  </select>
                </div>
                <div>
                  <label className={formLabelCls}>Effective date</label>
                <Input
                  type="date"
                  value={createForm.effectiveDate}
                  onChange={(e) => setCreateForm({ ...createForm, effectiveDate: e.target.value })}
                  min={todayDate}
                />
              </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={formLabelCls}>Shift start</label>
                  <Input
                    type="time"
                    value={createForm.shiftStart}
                    onChange={(e) => setCreateForm({ ...createForm, shiftStart: e.target.value })}
                  />
                </div>
                <div>
                  <label className={formLabelCls}>Shift end</label>
                  <Input
                    type="time"
                    value={createForm.shiftEnd}
                    onChange={(e) => setCreateForm({ ...createForm, shiftEnd: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={formLabelCls}>Assign staff</label>
                <select
                  value={createForm.staffId}
                  onChange={(e) => setCreateForm({ ...createForm, staffId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select staff</option>
                  {staffList.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Backend rule: the selected staff member must already belong to this location and the task time must fit inside their shift.
                </p>
              </div>
              {createError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {createError}
                </div>
              ) : null}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-2xl"
                  onClick={handleCreateTemplate}
                  disabled={createTemplate.isPending || assignStaff.isPending}
                >
                  {createTemplate.isPending || assignStaff.isPending ? "Saving..." : "Create template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center">
          <ClipboardList className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-500">No task templates for this location.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((t: any) => (
          <div
            key={t.id}
            className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{t.title}</h3>
                {t.description && (
                  <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">{t.description}</p>
                )}
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}
                  className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {openMenu === t.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                    <div className="absolute right-0 top-8 z-50 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                      <button
                        onClick={() => handleEditOpen(t)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
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
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Assigned To</p>
              {t.staff ? (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-[10px] font-bold text-teal-600">
                    {t.staff.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
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
                <p className="text-gray-600 font-medium">{fmtTime(t.shiftStart)} – {fmtTime(t.shiftEnd)}</p>
              </div>
              <div>
                <p className="text-gray-400">Effective</p>
                <p className="text-gray-600 font-medium">
                  {t.effectiveDate ? new Date(t.effectiveDate).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>

            {t.qrToken && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">QR Code</p>
                <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-3 border border-gray-100">
                  <QRCodeSVG
                    value={t.qrToken}
                    size={140}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1a1a1a"
                  />
                  <p className="text-[10px] text-gray-400 font-mono break-all text-center select-all">{t.qrToken}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setEditingTemplate(null)}>
          <div className="mx-4 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-5">Edit Task Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className={formLabelCls}>Assigned Staff</label>
                <select
                  value={editForm.staffId}
                  onChange={(e) => setEditForm({ ...editForm, staffId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Unassigned</option>
                  {staffList.map((s: any) => (
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
                    onChange={(e) => setEditForm({ ...editForm, shiftStart: e.target.value })}
                  />
                </div>
                <div>
                  <label className={formLabelCls}>Shift End</label>
                  <Input
                    type="time"
                    value={editForm.shiftEnd}
                    onChange={(e) => setEditForm({ ...editForm, shiftEnd: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={formLabelCls}>Recurring Type</label>
                <select
                  value={editForm.recurringType}
                  onChange={(e) => setEditForm({ ...editForm, recurringType: e.target.value })}
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
                  onChange={(e) => setEditForm({ ...editForm, effectiveDate: e.target.value })}
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
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-60"
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


const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [activeTab, setActiveTab] = useState<Tab>("staff");

  const currentFilter = FILTERS.find((f) => f.key === activeFilter)!;
  const filter = currentFilter.toFilter();

  const { data, isLoading, isFetching } = useGetLocationById(id!, filter);
  const locationInfo = data?.data?.locationInfo;
  const taskStats: TaskStatEntry[] = data?.data?.taskStats ?? [];

  console.log("location info is::",locationInfo);

  const staffCount = locationInfo?.staff?.length ?? 0;
  const templateCount = locationInfo?.taskTemplates?.length ?? 0;
  const instanceCount = locationInfo?.taskInstances?.length ?? 0;
  const completedCount = taskStats.find((t) => t.status === "COMPLETED")?._count?.status ?? 0;

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!locationInfo) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <XCircle className="h-10 w-10 text-red-600" />
          <p className="text-base font-semibold text-gray-900">Location not found</p>
          <button onClick={() => navigate(-1)} className="mt-2 text-sm text-teal-600 hover:underline">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/locations" className="text-gray-500 hover:text-gray-900 transition-colors">
          Locations
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{locationInfo.name}</span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50">
              <MapPin className="h-7 w-7 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{locationInfo.name}</h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                <Building2 className="h-3.5 w-3.5" />
                {locationInfo.address}
              </p>
            </div>
          </div>
          <StatusBadge status={locationInfo.isActive ? "ACTIVE" : "INACTIVE"} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
            <Navigation className="h-3 w-3" /> Lat: {fmtCoord(locationInfo.latitude)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
            <Navigation className="h-3 w-3 rotate-90" /> Lng: {fmtCoord(locationInfo.longitude)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
            <Radius className="h-3 w-3" /> Radius: {locationInfo.radiusMeters}m
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-1">
          <Calendar className="ml-2 h-4 w-4 text-gray-400 shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                f.key === activeFilter
                  ? "bg-teal-600 text-gray-900 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {f.key === activeFilter && isFetching && <RefreshCw className="h-3 w-3 animate-spin" />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Staff" value={staffCount} icon={Users} color="indigo" />
        <StatCard label="Task Templates" value={templateCount} icon={ClipboardList} color="purple" />
        <StatCard label="Task Instances" value={instanceCount} icon={Activity} color="cyan" />
        <StatCard label="Completed" value={completedCount} icon={CalendarCheck} color="emerald" />
      </div>

      {taskStats.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {taskStats.map((entry) => (
            <div key={entry.status} className="flex items-center gap-2">
              <StatusBadge status={entry.status} />
              <span className="text-sm font-semibold text-gray-900">{entry._count.status}</span>
            </div>
          ))}
        </div>
      )}

      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-indigo-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "staff" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Shift</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locationInfo.staff?.length > 0 ? (
                locationInfo.staff.map((s: any) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-100/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-600">
                          {s.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{s.email}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {fmtTime(s.shiftStart)} – {fmtTime(s.shiftEnd)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={s.isActive ? "ACTIVE" : "INACTIVE"} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                    No staff assigned to this location.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "templates" && (
        <TemplatesTab
          templates={locationInfo.taskTemplates ?? []}
          staffList={locationInfo.staff ?? []}
          locationId={locationInfo.id}
        />
      )}

      {activeTab === "instances" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Title</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Shift</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Late</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locationInfo.taskInstances?.length > 0 ? (
                locationInfo.taskInstances.map((ti: any) => (
                  <tr key={ti.id} className="transition-colors hover:bg-gray-100/50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{ti.title}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {new Date(ti.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {fmtTime(ti.shiftStart)} – {fmtTime(ti.shiftEnd)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={ti.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {ti.isLate ? (
                        <span className="font-semibold text-amber-400">+{ti.lateMinutes ?? "?"}m</span>
                      ) : (
                        <span className="text-emerald-400">On time</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {ti.proofImageUrls && ti.proofImageUrls.length > 0 ? (
                        <div className="flex gap-1">
                          {ti.proofImageUrls.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt={`Proof ${i + 1}`} className="h-9 w-9 rounded-md object-cover border border-gray-200 hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer" />
                            </a>
                          ))}
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">
                    No task instances for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LocationDetailPage;
