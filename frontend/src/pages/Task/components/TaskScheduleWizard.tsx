import { useRef, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { setupErrorKey, useSetupFormText } from '@/pages/Area/areaFormText';
import '@/pages/Area/setup-forms.css';
import { useAreas } from "@/pages/Area/queries";
import InventorySelector from "@/pages/Area/InventorySelector";
import { inventorySummary, validateInventorySelection } from "@/pages/Area/types";
import { Link } from "react-router-dom";
import { createTaskTemplate, getTaskTemplate } from "@/pages/Task/api";
import { assignStaffToTaskTemplate } from "@/pages/Assignment/api";
import { invalidateWorkspace } from "@/lib/invalidateWorkspace";
import { blankCreateForm, buildDateTimeIso, buildEffectiveDate, validateScheduleStep, type ScheduleStep, type TemplateCreateForm } from "@/pages/Task/taskScheduleForm";
import type { LocationStaff } from "@/pages/Location/types";

export type CreatedSchedule = {
  templateId: number;
  assignment: "automatic" | "manual" | "manual-failed-kept";
};

type Props = {
  locationId: number;
  locationName: string;
  timeZone: string;
  staffOptions: LocationStaff[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (outcome: CreatedSchedule) => void;
};

type Phase = "editing" | "creating" | "assigning" | "assignment-failed" | "unknown";

const fieldClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
const labels = ["Task", "Team", "Schedule", "Review"] as const;

function errorDetails(error: unknown): { message: string; field?: string } {
  const value = error as { response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } }; message?: string };
  const first = value.response?.data?.errors?.[0];
  return { message: first?.message || value.response?.data?.message || value.message || "Could not save the schedule.", field: first?.field };
}

export default function TaskScheduleWizard({ locationId, locationName, timeZone, staffOptions, open, onOpenChange, onCreated }: Props) {
  const qc = useQueryClient();
  const t = useSetupFormText();
  const areasQuery = useAreas(locationId);
  const areas = areasQuery.data?.filter(area => area.status === "ACTIVE") ?? [];
  const [form, setForm] = useState<TemplateCreateForm>(() => ({ ...blankCreateForm(), effectiveDate: formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd") }));
  const [step, setStep] = useState<ScheduleStep>(0);
  const [phase, setPhase] = useState<Phase>("editing");
  const [error, setError] = useState<string | null>(null);
  const savedId = useRef<number | null>(null);
  const inFlight = useRef(false);
  const assignmentInFlight = useRef(false);
  const firstField = useRef<HTMLInputElement | null>(null);
  const siteToday = formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd");
  const busy = phase === "creating" || phase === "assigning";
  const chosenArea = areas.find(area => String(area.id) === form.areaId);
  const summary = chosenArea && inventorySummary(chosenArea, form.inventorySelection, form.selectedItems);
  const chosenStaff = staffOptions.find((staff) => String(staff.id) === form.staffId);

  const reset = () => {
    setForm({ ...blankCreateForm(), effectiveDate: formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd") });
    setStep(0);
    setPhase("editing");
    setError(null);
    savedId.current = null;
    inFlight.current = false;
    assignmentInFlight.current = false;
  };

  const changeOpen = (next: boolean) => {
    if (!next && busy) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const focusFirst = () => requestAnimationFrame(() => firstField.current?.focus());
  const validate = (which: ScheduleStep) => {
    const problem = (which === 0 && areasQuery.isError ? "Area inventory could not load. Retry before continuing." : null) ?? validateScheduleStep(form, which) ?? (which === 0 ? chosenArea ? validateInventorySelection(chosenArea, form.inventorySelection, form.selectedItems) : "Choose an active area from the latest inventory." : null);
    if (problem) {
      setError(problem);
      setStep(which);
      focusFirst();
      return false;
    }
    if (which === 2 && form.effectiveDate < siteToday) {
      setError(t('Choose {date} or a later date for {location}.', { date: siteToday, location: locationName }));
      setStep(2);
      focusFirst();
      return false;
    }
    setError(null);
    return true;
  };

  const goNext = () => {
    if (!validate(step)) return;
    setStep((step + 1) as ScheduleStep);
  };

  const invalidateSaved = () => { void invalidateWorkspace(qc).catch(() => undefined); };

  const finish = (assignment: CreatedSchedule["assignment"]) => {
    if (!savedId.current) return;
    onCreated({ templateId: savedId.current, assignment });
    reset();
    onOpenChange(false);
  };

  const assign = async (templateId: number, staffId: number) => {
    if (assignmentInFlight.current) return;
    assignmentInFlight.current = true;
    setPhase("assigning");
    setError(null);
    try {
      await assignStaffToTaskTemplate(templateId, staffId);
      invalidateSaved();
      finish("manual");
    } catch {
      // A timeout may have happened after the server saved the assignment.
      try {
        const current = await getTaskTemplate(templateId);
        if (current?.data?.staffId === staffId) {
          invalidateSaved();
          finish("manual");
          return;
        }
      } catch { /* The saved schedule still exists; its assignment is uncertain. */ }
      setPhase("assignment-failed");
      setError(t('Schedule created. Staff assignment could not be confirmed.'));
    } finally {
      assignmentInFlight.current = false;
    }
  };

  const submit = async () => {
    if (inFlight.current || savedId.current) return;
    for (const part of [0, 1, 2] as ScheduleStep[]) if (!validate(part)) return;
    inFlight.current = true;
    setPhase("creating");
    setError(null);
    try {
      const created = await createTaskTemplate({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        locationId,
        staffId: form.staffId ? Number(form.staffId) : undefined,
        shiftStart: new Date(buildDateTimeIso(timeZone, form.effectiveDate, form.shiftStart)),
        shiftEnd: new Date(buildDateTimeIso(timeZone, form.effectiveDate, form.shiftEnd)),
        recurringType: form.recurringType,
        effectiveDate: buildEffectiveDate(form.effectiveDate),
        recurringEndDate: form.recurringType === "DAILY" && form.recurringEndDate ? buildEffectiveDate(form.recurringEndDate) : undefined,
        areaId: Number(form.areaId),
        inventorySelection: form.inventorySelection,
        selectedItems: form.selectedItems,
        expectedInventoryVersion: chosenArea!.inventoryVersion,
      });
      const id = Number(created?.data?.id);
      if (!Number.isSafeInteger(id) || id <= 0) throw new Error("The server did not return a schedule ID. Check the schedule list before trying again.");
      savedId.current = id;
      invalidateSaved();
      if (form.staffId) finish("manual");
      else finish("automatic");
    } catch (err) {
      if (!savedId.current) {
        const detail = errorDetails(err);
        const definitive = Boolean((err as { response?: { status?: number } }).response?.status && (err as { response: { status: number } }).response.status < 500);
        if (definitive) {
          setPhase("editing");
          setError(setupErrorKey(err, 'Could not save the schedule. Check the fields and try again.'));
          if ((err as {response?: {status?: number}}).response?.status === 409) {
            const refreshed = await areasQuery.refetch();
            setStep(0);
            setError(refreshed.isError ? 'Inventory could not refresh. Your draft is preserved. Retry loading areas.' : 'Inventory refreshed. Review the selected fixtures before retrying. Your draft is preserved.');
          }
          const field = detail.field ?? "";
          if (/area|inventory|selected|title|description/.test(field)) setStep(0);
          else if (/staff/.test(field)) setStep(1);
          else if (/shift|date|recurr/.test(field)) setStep(2);
        } else {
          setPhase("unknown");
          setError('Creation could not be confirmed. Check this location’s schedule list before trying again.');
        }
      }
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="setup-form-dialog schedule-v5" showCloseButton={!busy} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} onPointerDownOutside={event => { if (busy) event.preventDefault(); }} aria-busy={busy}>
        <DialogHeader>
          <DialogTitle>{t('Create cleaning schedule')}</DialogTitle>
          <DialogDescription>{t('Set up the work, team, and time before saving.')}</DialogDescription>
          <p className="setup-form-site"><bdi>{locationName}</bdi> · <bdi>{timeZone}</bdi></p>
        </DialogHeader>
        <ol className="setup-form-steps" aria-label={t('Schedule creation steps')}>
          {labels.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}>{index + 1}. {t(label)}</li>)}
        </ol>
        {phase === 'assignment-failed' ? (
          <div className="space-y-4" role="alert">
            <p className="font-semibold">{t('Schedule saved as #{id}', { id: savedId.current ?? '' })}</p>
            <p className="setup-form-warning">{error && t(error)}</p>
            <div className="flex flex-wrap gap-2"><Button type="button" disabled={busy} onClick={() => { if (savedId.current && form.staffId) void assign(savedId.current, Number(form.staffId)); }}>{t('Retry assignment')}</Button><Button type="button" variant="outline" onClick={() => finish('manual-failed-kept')}>{t('Keep schedule and finish')}</Button></div>
          </div>
        ) : phase === 'unknown' ? (
          <div className="space-y-4" role="alert"><p className="setup-form-warning">{error && t(error)}</p><Button type="button" variant="outline" onClick={() => changeOpen(false)}>{t('Close and check schedule list')}</Button></div>
        ) : (
          <>
            <fieldset disabled={busy} aria-describedby={error ? 'schedule-error' : undefined}>
            {step === 0 && <div className="space-y-4">
              <div><label htmlFor="schedule-title" className={labelClass}>{t('Task title')}</label><Input id="schedule-title" ref={firstField} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder={t('Clean the lobby')} aria-describedby={error ? 'schedule-error' : undefined} /></div>
              <div><label htmlFor="schedule-description" className={labelClass}>{t('Instructions (optional)')}</label><Textarea id="schedule-description" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder={t('What should the team do?')} /></div>
              <div><label className={labelClass} htmlFor="schedule-area">{t('Area template')}</label><select id="schedule-area" className={fieldClass} value={form.areaId} aria-describedby={error ? 'schedule-error' : undefined} onChange={event => setForm({ ...form, areaId: event.target.value, selectedItems: [] })}><option value="">{t('Choose one area')}</option>{areas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}</select></div>
              {areasQuery.isPending && <p role="status">{t('Loading inventory…')}</p>}
              {areasQuery.isError && <div role="alert"><p>{t('Area inventory could not load. Retry before continuing.')}</p><Button type="button" variant="outline" onClick={() => void areasQuery.refetch()}>{t('Retry loading areas')}</Button></div>}
              {!areasQuery.isPending && !areasQuery.isError && !areas.length && <p className="setup-form-help">{t('Set up and activate an area first.')} <Link to={`/locations/${locationId}?tab=areas&newArea=1`} className="text-primary underline">{t('Add area')}</Link></p>}
              {chosenArea && <InventorySelector area={chosenArea} mode={form.inventorySelection} selected={form.selectedItems} onChange={(inventorySelection, selectedItems) => setForm({ ...form, inventorySelection, selectedItems })} />}
            </div>}
            {step === 1 && <div className="space-y-4"><p className="setup-form-help">{t('Automatic assignment remains available. You can choose a specific person who works at this location.')}</p><label htmlFor="schedule-staff" className={labelClass}>{t('Assign staff')}</label><select id="schedule-staff" className={fieldClass} value={form.staffId} onChange={event => setForm({ ...form, staffId: event.target.value })}><option value="">{t('Use automatic assignment')}</option>{staffOptions.filter(staff => staff.isActive).map(staff => <option key={staff.id} value={staff.id}>{staff.name}</option>)}</select></div>}
            {step === 2 && <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="schedule-repeat" className={labelClass}>{t('Repeat')}</label><select id="schedule-repeat" className={fieldClass} value={form.recurringType} onChange={event => setForm({ ...form, recurringType: event.target.value as 'DAILY' | 'ONCE', recurringEndDate: '' })}><option value="DAILY">{t('Daily')}</option><option value="ONCE">{t('Once')}</option></select></div>
              <div><label htmlFor="schedule-date" className={labelClass}>{t('Effective date')}</label><Input id="schedule-date" ref={firstField} type="date" dir="ltr" min={siteToday} value={form.effectiveDate} onChange={event => setForm({ ...form, effectiveDate: event.target.value })} aria-describedby={error ? 'schedule-error' : undefined} /></div>
              <div><label htmlFor="schedule-start" className={labelClass}>{t('Start time')} (<bdi>{timeZone}</bdi>)</label><Input id="schedule-start" type="time" dir="ltr" value={form.shiftStart} onChange={event => setForm({ ...form, shiftStart: event.target.value })} /></div>
              <div><label htmlFor="schedule-end" className={labelClass}>{t('End time')} (<bdi>{timeZone}</bdi>)</label><Input id="schedule-end" type="time" dir="ltr" value={form.shiftEnd} onChange={event => setForm({ ...form, shiftEnd: event.target.value })} /></div>
              {form.recurringType === 'DAILY' && <div className="sm:col-span-2"><label htmlFor="schedule-repeat-end" className={labelClass}>{t('Repeat until (optional)')}</label><Input id="schedule-repeat-end" type="date" dir="ltr" min={form.effectiveDate} value={form.recurringEndDate} onChange={event => setForm({ ...form, recurringEndDate: event.target.value })} /></div>}
              <p className="setup-form-help sm:col-span-2">{t('Daily schedules include every day, including weekends. Dates and times follow this location’s timezone.')}</p>
            </div>}
            {step === 3 && <div className="space-y-4"><dl className="setup-form-facts"><dt>{t('Task')}</dt><dd><bdi>{form.title.trim()}</bdi></dd><dt>{t('Location')}</dt><dd><bdi>{locationName}</bdi></dd><dt>{t('Area template')}</dt><dd><bdi>{chosenArea?.name}</bdi></dd><dt>{t('Fixtures')}</dt><dd>{form.inventorySelection === 'ALL' ? t('All active items') : t('{count} selected items', { count: form.selectedItems.length })}. {summary && t('{mandatory} mandatory fixtures, {optional} optional fixtures, {photos} required photos.', { ...summary, photos: summary.requiredViews })} {t('Mandatory items require every mandatory evidence view to pass.')}</dd><dt>{t('Team')}</dt><dd>{chosenStaff ? <bdi>{chosenStaff.name}</bdi> : t('Use automatic assignment')}</dd><dt>{t('Schedule')}</dt><dd>{t('{repeat} from {start}', { repeat: t(form.recurringType === 'DAILY' ? 'Daily' : 'Once'), start: form.effectiveDate })}{form.recurringEndDate ? <> · {t('Until {date}', { date: form.recurringEndDate })}</> : null} · <bdi>{form.shiftStart}–{form.shiftEnd} ({timeZone})</bdi></dd></dl><p className="setup-form-help">{t('A task QR is available only after an occurrence exists. Previewing a future slot does not generate a task.')}</p></div>}
            </fieldset>
            {error && <p id="schedule-error" role="alert" className="setup-form-error">{t(error)}</p>}
            <div className="setup-form-actions"><Button type="button" variant="outline" disabled={busy} onClick={() => step === 0 ? changeOpen(false) : setStep((step - 1) as ScheduleStep)}>{step === 0 ? t('Cancel') : <><ArrowLeft size={15} aria-hidden="true" />{t('Back')}</>}</Button>{step < 3 ? <Button type="button" onClick={goNext} disabled={busy || (step === 0 && (areasQuery.isPending || areasQuery.isError))}>{t('Next')}<ArrowRight size={15} aria-hidden="true" /></Button> : <Button type="button" onClick={() => void submit()} disabled={busy} aria-busy={busy}>{t(busy ? (phase === 'creating' ? 'Creating…' : 'Assigning…') : 'Create schedule')}</Button>}</div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
