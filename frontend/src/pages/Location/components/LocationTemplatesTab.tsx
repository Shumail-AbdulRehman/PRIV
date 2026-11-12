import DataTable from "@/components/common/DataTable";
import { useLocationLanguage } from "../locationTranslations";
import { SidePanel, SidePanelFooter } from "@/components/workspace/SidePanel";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/workspace/StatusPill";
import PersonAvatar from "@/components/workspace/PersonAvatar";
import { moveWeek, normalizeWeek } from "../scheduleTypes";
import "@/pages/Task/schedule-v6.css";
import { useSetupFormText } from "@/pages/Area/areaFormText";
import TemplateInventoryEditor from "@/pages/Area/TemplateInventoryEditor";
import { useAreas } from "@/pages/Area/queries";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import DeleteButton from "@/components/common/DeleteButton";
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

/** Calendar arithmetic uses UTC as a container for location-local date fields. */
function addDay(day: string, offset: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export interface ScheduleWeekProps {
  templates: TaskTemplate[];
  timeZone: string;
  week: string;
  onSelect: (template: TaskTemplate) => void;
}

/** Read-only projection of already loaded templates; never creates occurrences. */
export function ScheduleWeek({ templates, timeZone, week, onSelect }: ScheduleWeekProps) {
  const { t, language } = useLocationLanguage();
  const days = Array.from({ length: 7 }, (_, index) => addDay(week, index));
  const label = (day: string) => new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-PK', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${day}T12:00:00Z`));
  const time = (value: string | null) => value && Number.isFinite(Date.parse(value)) ? formatInTimeZone(value, timeZone, 'HH:mm') : '';
  return <table className="wx-schedule-week" role="table" aria-label={t('Week at a glance')}>
    <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">{t('Cleaning schedule')}</th>{days.map(day => <th role="columnheader" scope="col" key={day}>{label(day)}</th>)}</tr></thead>
    <tbody role="rowgroup">{templates.map(template => {
      const start = time(template.shiftStart), end = time(template.shiftEnd);
      const overnight = !!start && !!end && end <= start;
      const effective = template.effectiveDate?.slice(0, 10) || (start ? formatInTimeZone(template.shiftStart!, timeZone, 'yyyy-MM-dd') : '');
      // Older location DTOs omit the optional recurrence end; honor it if present.
      const until = (template as TaskTemplate & { recurringEndDate?: string | null }).recurringEndDate?.slice(0, 10);
      const occurs = (day: string) => template.isActive !== false && !!start && !!end && !!effective && day >= effective && (!until || day <= until) && (template.recurringType === 'DAILY' || day === effective);
      return <tr role="row" key={template.id}>
        <th role="rowheader" scope="row"><button type="button" onClick={() => onSelect(template)}><bdi>{template.title}</bdi></button><small>{t(template.recurringType === 'DAILY' ? 'Daily' : 'Once')}</small></th>
        {days.map(day => {
          const carry = overnight && end !== '00:00' && occurs(addDay(day, -1));
          const begins = occurs(day);
          return <td role="cell" key={day} aria-label={label(day)}><span className="wx-schedule-day-label" aria-hidden="true">{label(day)}</span>
            {carry && <button type="button" className="wx-schedule-bar wx-schedule-bar-night wx-schedule-bar-carry" onClick={() => onSelect(template)} aria-label={`${template.title} · ${label(day)} · ${t('Continues from previous day')} · 00:00–${end}`}><span>{t('Continues from previous day')}</span><bdi dir="ltr">00:00–{end}</bdi></button>}
            {begins && <button type="button" className={`wx-schedule-bar${overnight ? ' wx-schedule-bar-night wx-schedule-bar-start' : ''}`} onClick={() => onSelect(template)} aria-label={`${template.title} · ${label(day)} · ${start}–${end}${overnight ? ' · ' + t('Continues into next day') : ''}`}><bdi dir="ltr">{start}–{overnight ? '24:00' : end}</bdi>{overnight && <span>{t('Continues into next day')}</span>}</button>}
            {!carry && !begins && <span className="wx-schedule-no-slot">—</span>}
          </td>;
        })}
      </tr>;
    })}</tbody>
  </table>;
}

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
  const formText = useSetupFormText();
  const [saving,setSaving]=useState(false);
  const [assignmentRetry,setAssignmentRetry]=useState(false);
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
  const [dateTouched, setDateTouched] = useState(false);
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
    setEditError(null);setAssignmentRetry(false);setDateTouched(false);
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

  const dateInvalid = !!editForm.effectiveDate && editForm.effectiveDate !== toDateValue(editingTemplate?.effectiveDate) && editForm.effectiveDate < todayDate;
  const handleEditSave = async () => {
    if (dateInvalid) { setDateTouched(true); return; }
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
    let fieldsSaved=false;
    let assignmentAttempted=false;

    try {
      if (hasFieldChanges) {
        await new Promise<void>((resolve, reject) => {
          editTemplate.mutate(
            { id: editingTemplate.id, data: payload },
            { onSuccess: () => resolve(), onError: (err) => reject(err) },
          );
        });
        fieldsSaved=true;
        setEditingTemplate({...editingTemplate,...payload});
      }

      if (staffChanged && editForm.staffId) {
        assignmentAttempted=true;
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
      setAssignmentRetry(assignmentAttempted);
      setEditError(translate(fieldsSaved&&staffChanged
       ? 'Schedule details were saved. Staff assignment could not be confirmed. Your draft is kept. Review the assignment before retrying.'
       : staffChanged&&!hasFieldChanges
        ? 'Staff assignment could not be confirmed. Your draft is kept. Review the assignment before retrying.'
        : 'The schedule could not be saved. Your draft is kept. Refresh the saved schedule before trying again.'));
    } finally {inFlight.current=false;setSaving(false);}
  };

  const inputCls = "wx-schedule-input";
  const formLabelCls = "wx-schedule-label";
  const week = normalizeWeek(params.get('week')) ?? normalizeWeek(todayDate)!;
  const changeWeek = (nextWeek?: string) => setParams(previous => {
    const next = new URLSearchParams(previous);
    if (nextWeek) next.set('week', nextWeek); else next.delete('week');
    return next;
  });

  return (
    <section className="wx-schedule" aria-label={translate("Cleaning schedules")}>
      <div className="wx-schedule-heading">
        <div>
          <h2>
            {translate("Cleaning schedules")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {translate("Create schedules for this location and optionally choose a team member.")}
          </p>
        </div>
        <Button
          className="wx-schedule-primary"
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

      <p className="wx-schedule-help">{translate('Daily schedules include every day, including weekends.')}</p>
      {templates.length > 0 ? <>
        <div className="wx-schedule-week-nav"><p><bdi>{new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-PK', { timeZone: 'UTC', dateStyle: 'medium' }).format(new Date(week + 'T12:00:00Z'))}</bdi> · <bdi>{timeZone}</bdi></p><div className="wx-schedule-actions">
          <Button variant="outline" onClick={() => changeWeek(moveWeek(week, -1))}>{translate('Previous week')}</Button>
          <Button variant="outline" onClick={() => changeWeek()}>{translate('This week')}</Button>
          <Button variant="outline" onClick={() => changeWeek(moveWeek(week, 1))}>{translate('Next week')}</Button>
        </div></div>
        <ScheduleWeek templates={templates} week={week} timeZone={timeZone} onSelect={handleEditOpen} />
        <h3 className="wx-schedule-register-title">{translate('Cleaning schedules')}</h3>
      <DataTable mobileCards
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
                    className="wx-schedule-attention"
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
            render: (row) => <div className="wx-schedule-person"><PersonAvatar name={row.staff?.name}/><bdi>{row.staff?.name ?? translate("Unassigned")}</bdi></div>,
          },
          {
            key: "shift",
            header: "Shift",
            className: "wx-schedule-shift-cell",
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
            className: "wx-schedule-state-cell",
            render: (row) => (
              <StatusPill tone="neutral" status={row.recurringType ?? "ONCE"} />
            ),
          },
          {
            key: "status",
            header: "Status",
            className: "wx-schedule-state-cell",
            render: (row) => (
              <StatusPill tone={row.isActive ? "ok" : "neutral"} status={row.isActive ? "ACTIVE" : "INACTIVE"} />
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "wx-schedule-action-cell",
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

      </> : <EmptyState title={translate('No cleaning schedules for this location.')} message={translate('Create schedules for this location and optionally choose a team member.')} action={<Button onClick={() => setCreateDialogOpen(true)}>{translate('Add cleaning schedule')}</Button>} />}

      <SidePanel wide title={translate('Edit cleaning schedule')} description={translate('Changes apply to the schedule. Recorded task history stays unchanged.')} open={!!editingTemplate} onOpenChange={open=>{if(!open&&!inFlight.current)setEditingTemplate(null);}} footer={<SidePanelFooter className="wx-schedule-footer"><Button type="button" variant="outline" disabled={saving} onClick={()=>setEditingTemplate(null)}>{translate('Cancel')}</Button><Button type="submit" form="location-schedule-edit" disabled={saving||!editForm.title.trim()} aria-busy={saving}>{translate(saving?'Saving...':assignmentRetry?'Retry staff assignment':'Save changes')}</Button></SidePanelFooter>}>
        {editingTemplate?<div className="wx-schedule-form" aria-busy={saving}><p className="wx-schedule-help"><bdi>{locationName}</bdi> · <bdi>{timeZone}</bdi></p><form id="location-schedule-edit" onChange={()=>setAssignmentRetry(false)} onSubmit={event=>{event.preventDefault();void handleEditSave();}}><fieldset disabled={saving} className="wx-schedule-stack">

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

              <div><label htmlFor="schedule-area" className={formLabelCls}>{translate('Area')}</label><input id="schedule-area" readOnly value={editingTemplate.area?.name ?? areasQuery.data?.find(area => area.id === editingTemplate.areaId)?.name ?? '—'} /><p className="wx-schedule-help">{translate('Changes apply to future tasks. Each generated task keeps its original requirements.')}</p></div>

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

              <div className="wx-schedule-pair">
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

              <div className="wx-schedule-pair">
              <div className="wx-schedule-field">
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

              <div className="wx-schedule-field">
                <label htmlFor="schedule-effective" className={formLabelCls}>{translate("Effective from")}</label>
                <Input
                  type="date"
                  id="schedule-effective" aria-label={translate("Effective from")} aria-invalid={dateTouched && dateInvalid} aria-describedby={dateTouched && dateInvalid ? "edit-schedule-date-error" : undefined}
                  value={editForm.effectiveDate}
                  onChange={(e) => {
                    setDateTouched(true);
                    setEditForm({ ...editForm, effectiveDate: e.target.value });
                  }}
                  onBlur={() => setDateTouched(true)}
                  min={editForm.effectiveDate === toDateValue(editingTemplate.effectiveDate) ? undefined : todayDate}
                  dir="ltr"
                />
                {dateTouched && dateInvalid && <p className="wx-schedule-error" role="alert" id="edit-schedule-date-error">{formText('Choose {date} or a later date for {location}.', { date: todayDate, location: locationName })}</p>}
              </div>
              <p className="wx-schedule-help wx-schedule-full">{translate('Daily schedules include every day, including weekends.')}</p>
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
                <div role="alert" className="wx-schedule-error">
                  {editError}
                </div>
              )}

        </div>:null}
      </SidePanel>
    </section>
  );
}
