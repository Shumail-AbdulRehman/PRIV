import DataTable from "@/components/common/DataTable";
import { useLocationLanguage } from "../locationTranslations";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from "@/components/ui/dialog";
import TemplateInventoryEditor from "@/pages/Area/TemplateInventoryEditor";
import { useAreas } from "@/pages/Area/queries";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
import { buildDateTimeIso } from "@/pages/Task/taskScheduleForm";
import TaskScheduleWizard from "@/pages/Task/components/TaskScheduleWizard";

const fmtTimeWithTz = (d: string | null, timeZone = "UTC") => {
  if (!d) return "—";
  return formatInTimeZone(new Date(d), timeZone, "HH:mm (zzz)");
};

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
  const { t: translate,language } = useLocationLanguage();
  const [saving,setSaving]=useState(false);
  const inFlight=useRef(false);
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
  const [params,setParams]=useSearchParams();
  const createDialogOpen=params.get('newSchedule')==='1';
  const setCreateDialogOpen=(open:boolean)=>setParams(previous=>{const result=new URLSearchParams(previous);if(open)result.set('newSchedule','1');else result.delete('newSchedule');return result;},{replace:true});
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    staffId: "" as string,
    shiftStart: "",
    shiftEnd: "",
    recurringType: "" as string,
    effectiveDate: "",
  });
  const todayDate = formatInTimeZone(new Date(),timeZone,'yyyy-MM-dd');

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
    if (!editingTemplate || inFlight.current) return;
    inFlight.current=true;setSaving(true);
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
    } catch {
      setEditError(translate("The schedule could not be saved. Your draft is kept. Refresh the saved schedule before trying again."));
    } finally {inFlight.current=false;setSaving(false);}
  };

  const inputCls =
    "w-full rounded-lg border border-border/80 bg-background/90 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/10";
  const formLabelCls = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <section className="ops-panel location-schedules-v5">
      <div className="ops-panel-heading flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2>
            {translate("Cleaning schedules")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {translate("Create schedules for this location and optionally choose a team member.")}
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
        emptyMessage={translate("No cleaning schedules for this location.")}
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
                    className="text-warning underline text-xs"
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
                    {new Date(row.effectiveDate).toLocaleDateString(language === "ur" ? "ur-PK" : "en-PK", {
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

      <Dialog open={!!editingTemplate} onOpenChange={open=>{if(!open&&!inFlight.current)setEditingTemplate(null);}}>
       <DialogContent className="location-schedule-editor-v5" onInteractOutside={event=>{if(inFlight.current)event.preventDefault();}} onEscapeKeyDown={event=>{if(inFlight.current)event.preventDefault();}}>
        <DialogHeader><DialogTitle>{translate('Edit cleaning schedule')}</DialogTitle><DialogDescription>{translate('Changes apply to the schedule. Recorded task history stays unchanged.')}</DialogDescription></DialogHeader>
        {editingTemplate?<><form id="location-schedule-edit" onSubmit={event=>{event.preventDefault();void handleEditSave();}}><fieldset disabled={saving} className="space-y-4">

              <div>
                <label htmlFor="schedule-title" className={formLabelCls}>{translate("Schedule title")}</label>
                <input
                  type="text"
                  id="schedule-title" aria-label={translate("Schedule title")}
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="schedule-description" className={formLabelCls}>{translate("Description")}</label>
                <textarea
                  id="schedule-description" aria-label={translate("Description")}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label htmlFor="schedule-staff" className={formLabelCls}>{translate("Assigned staff")}</label>
                <select
                  id="schedule-staff" aria-label={translate("Assigned staff")}
                  value={editForm.staffId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, staffId: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="" disabled={!!editingTemplate.staffId}>{translate("Unassigned")}</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="schedule-start" className={formLabelCls}>{translate("Shift start")}</label>
                  <Input
                    type="time"
                    id="schedule-start" aria-label={translate("Shift start")}
                    value={editForm.shiftStart}
                    onChange={(e) =>
                      setEditForm({ ...editForm, shiftStart: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label htmlFor="schedule-end" className={formLabelCls}>{translate("Shift end")}</label>
                  <Input
                    type="time"
                    id="schedule-end" aria-label={translate("Shift end")}
                    value={editForm.shiftEnd}
                    onChange={(e) =>
                      setEditForm({ ...editForm, shiftEnd: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label htmlFor="schedule-recurrence" className={formLabelCls}>{translate("Recurrence")}</label>
                <select
                  id="schedule-recurrence" aria-label={translate("Recurrence")}
                  value={editForm.recurringType}
                  onChange={(e) =>
                    setEditForm({ ...editForm, recurringType: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">{translate("Select type")}</option>
                  <option value="DAILY">{translate("Daily")}</option>
                  <option value="ONCE">{translate("Once")}</option>
                </select>
              </div>

              <div>
                <label htmlFor="schedule-effective" className={formLabelCls}>{translate("Effective date")}</label>
                <Input
                  type="date"
                  id="schedule-effective" aria-label={translate("Effective date")}
                  value={editForm.effectiveDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, effectiveDate: e.target.value })
                  }
                  min={todayDate}
                />
              </div>

              </fieldset></form>
              {editingTemplate.areaId && (
                <fieldset disabled={saving}><TemplateInventoryEditor
                  key={editingTemplate.id}
                  templateId={editingTemplate.id}
                  areaId={editingTemplate.areaId}
                /></fieldset>
              )}

              {editError && (
                <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {editError}
                </div>
              )}

              <div className="location-schedule-actions-v5"><Button type="button" variant="outline" disabled={saving} onClick={()=>setEditingTemplate(null)}>{translate('Cancel')}</Button><Button type="submit" form="location-schedule-edit" disabled={saving||!editForm.title.trim()}>{translate(saving?'Saving...':'Save changes')}</Button></div>
        </>:null}
       </DialogContent>
      </Dialog>
    </section>
  );
}
