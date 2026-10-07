import { useRef, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const areasQuery = useAreas(locationId);
  const areas = areasQuery.data?.filter(area => area.status === "ACTIVE") ?? [];
  const [form, setForm] = useState<TemplateCreateForm>(() => blankCreateForm());
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
    setForm(blankCreateForm());
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
    const problem = validateScheduleStep(form, which) ?? (which === 0 ? chosenArea ? validateInventorySelection(chosenArea, form.inventorySelection, form.selectedItems) : "Choose an active area from the latest inventory." : null);
    if (problem) {
      setError(problem);
      setStep(which);
      focusFirst();
      return false;
    }
    if (which === 2 && form.effectiveDate < siteToday) {
      setError(`Choose ${siteToday} or a later date for ${locationName}.`);
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
    } catch (err) {
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
      setError(`Schedule created. Staff assignment could not be confirmed. ${errorDetails(err).message}`);
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
      if (form.staffId) await assign(id, Number(form.staffId));
      else finish("automatic");
    } catch (err) {
      if (!savedId.current) {
        const detail = errorDetails(err);
        const definitive = Boolean((err as { response?: { status?: number } }).response?.status && (err as { response: { status: number } }).response.status < 500);
        if (definitive) {
          setPhase("editing");
          setError(detail.message);
          if ((err as {response?: {status?: number}}).response?.status === 409) {
            await areasQuery.refetch();
            setStep(0);
            setError(`${detail.message} Inventory refreshed. Review the selected fixtures before retrying. Your draft is preserved.`);
          }
          const field = detail.field ?? "";
          if (/area|inventory|selected|title|description/.test(field)) setStep(0);
          else if (/staff/.test(field)) setStep(1);
          else if (/shift|date|recurr/.test(field)) setStep(2);
        } else {
          setPhase("unknown");
          setError(`Creation could not be confirmed. Check this location's schedule list before trying again. ${detail.message}`);
        }
      }
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[min(90dvh,800px)] overflow-y-auto bg-card text-foreground sm:max-w-2xl" showCloseButton={!busy} onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }} onPointerDownOutside={(event) => { if (busy) event.preventDefault(); }}>
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{locationName} · {timeZone}</p>
          <DialogTitle>Create cleaning schedule</DialogTitle>
          <DialogDescription>Set up the work, team, and time before saving.</DialogDescription>
        </DialogHeader>
        <ol className="grid grid-cols-4 gap-1 border-b border-border pb-4 text-xs" aria-label="Schedule creation steps">
          {labels.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className={`rounded-md px-2 py-2 text-center ${step === index ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground"}`}>{index + 1}. {label}</li>)}
        </ol>
        {phase === "assignment-failed" ? (
          <div className="space-y-4" role="alert">
            <p className="font-semibold">Schedule saved as #{savedId.current}</p>
            <p className="text-sm text-amber-800">{error}</p>
            <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => { if (savedId.current && form.staffId) void assign(savedId.current, Number(form.staffId)); }}>Retry assignment</Button><Button variant="outline" onClick={() => finish("manual-failed-kept")}>Keep schedule and finish</Button></div>
          </div>
        ) : phase === "unknown" ? (
          <div className="space-y-4" role="alert"><p className="text-sm text-amber-800">{error}</p><Button variant="outline" onClick={() => changeOpen(false)}>Close and check schedule list</Button></div>
        ) : (
          <>
            {step === 0 && <div className="space-y-4">
              <div><label htmlFor="schedule-title" className={labelClass}>Task title</label><Input id="schedule-title" ref={firstField} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Clean the lobby" /></div>
              <div><label htmlFor="schedule-description" className={labelClass}>Instructions (optional)</label><Textarea id="schedule-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What should the team do?" /></div>
              <label className={labelClass} htmlFor="schedule-area">Area</label><select id="schedule-area" className={fieldClass} value={form.areaId} onChange={event => setForm({...form, areaId:event.target.value, selectedItems:[]})}><option value="">Choose one area</option>{areas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}</select>
              {areasQuery.isPending && <p role="status" className="text-sm">Loading inventory…</p>}
              {areasQuery.isError && <Button variant="outline" onClick={()=>void areasQuery.refetch()}>Retry loading areas</Button>}
              {!areasQuery.isPending && !areas.length && <p className="text-sm">Set up and activate an area first. <Link to={`/locations/${locationId}/areas/new`} className="text-primary underline">Add area</Link></p>}
              {chosenArea && <InventorySelector area={chosenArea} mode={form.inventorySelection} selected={form.selectedItems} onChange={(inventorySelection,selectedItems)=>setForm({...form,inventorySelection,selectedItems})}/>}

            </div>}
            {step === 1 && <div className="space-y-4"><p className="text-sm text-muted-foreground">Automatic assignment remains available. You can choose a specific person who works at this location.</p><label htmlFor="schedule-staff" className={labelClass}>Assign staff</label><select id="schedule-staff" className={fieldClass} value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}><option value="">Use automatic assignment</option>{staffOptions.filter((staff) => staff.isActive).map((staff) => <option key={staff.id} value={staff.id}>{staff.name}</option>)}</select></div>}
            {step === 2 && <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="schedule-repeat" className={labelClass}>Repeat</label><select id="schedule-repeat" className={fieldClass} value={form.recurringType} onChange={(e) => setForm({ ...form, recurringType: e.target.value as "DAILY" | "ONCE", recurringEndDate: "" })}><option value="DAILY">Daily</option><option value="ONCE">Once</option></select></div>
              <div><label htmlFor="schedule-date" className={labelClass}>Effective date</label><Input id="schedule-date" ref={firstField} type="date" min={siteToday} value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} /></div>
              <div><label htmlFor="schedule-start" className={labelClass}>Start time ({timeZone})</label><Input id="schedule-start" type="time" value={form.shiftStart} onChange={(e) => setForm({ ...form, shiftStart: e.target.value })} /></div>
              <div><label htmlFor="schedule-end" className={labelClass}>End time ({timeZone})</label><Input id="schedule-end" type="time" value={form.shiftEnd} onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })} /></div>
              {form.recurringType === "DAILY" && <div className="sm:col-span-2"><label htmlFor="schedule-repeat-end" className={labelClass}>Repeat until (optional)</label><Input id="schedule-repeat-end" type="date" min={form.effectiveDate} value={form.recurringEndDate} onChange={(e) => setForm({ ...form, recurringEndDate: e.target.value })} /></div>}
            </div>}
            {step === 3 && <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm"><dt className="text-muted-foreground">Task</dt><dd>{form.title.trim()}</dd><dt className="text-muted-foreground">Location</dt><dd>{locationName}</dd><dt className="text-muted-foreground">Area</dt><dd>{chosenArea?.name}</dd><dt className="text-muted-foreground">Inventory</dt><dd>{form.inventorySelection === "ALL" ? "All active items" : `${form.selectedItems.length} selected items`}. {summary && `${summary.mandatory} mandatory fixtures, ${summary.optional} optional fixtures, ${summary.requiredViews} required photos.`} Mandatory items require every mandatory evidence view to pass.</dd><dt className="text-muted-foreground">Team</dt><dd>{chosenStaff?.name ?? "Use automatic assignment"}</dd><dt className="text-muted-foreground">Schedule</dt><dd>{form.recurringType === "DAILY" ? "Daily" : "Once"} from {form.effectiveDate}{form.recurringEndDate ? ` until ${form.recurringEndDate}` : ""}, {form.shiftStart}–{form.shiftEnd} ({timeZone})</dd></dl>}
            {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
            <div className="sticky bottom-0 flex flex-wrap justify-between gap-2 border-t border-border bg-card pt-4"><Button variant="outline" disabled={busy} onClick={() => step === 0 ? changeOpen(false) : setStep((step - 1) as ScheduleStep)}>{step === 0 ? "Cancel" : <><ArrowLeft size={15} /> Back</>}</Button>{step < 3 ? <Button onClick={goNext} disabled={busy}>Next <ArrowRight size={15} /></Button> : <Button onClick={() => void submit()} disabled={busy}>{busy ? (phase === "creating" ? "Creating…" : "Assigning…") : "Create schedule"}</Button>}</div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
