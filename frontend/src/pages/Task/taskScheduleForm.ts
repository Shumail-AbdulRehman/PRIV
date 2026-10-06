import { fromZonedTime } from "date-fns-tz";

export interface ReferenceImageFormItem {
  id: string;
  name: string;
  file: File | null;
  previewUrl: string | null;
}

export interface TemplateCreateForm {
  title: string;
  description: string;
  staffId: string;
  shiftStart: string;
  shiftEnd: string;
  recurringType: "DAILY" | "ONCE";
  effectiveDate: string;
  recurringEndDate: string;
  referenceImages: ReferenceImageFormItem[];
  areaId: string;
  inventorySelection: "ALL" | "SUBSET";
  selectedItems: Array<{areaItemId:number; mandatory:boolean}>;
}

export const toDateStr = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

export const createEmptyReferenceItem = (): ReferenceImageFormItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  name: "",
  file: null,
  previewUrl: null,
});

export const blankCreateForm = (initial = false): TemplateCreateForm => ({
  areaId: "",
  inventorySelection: "ALL",
  selectedItems: [],
  title: "",
  description: "",
  staffId: "",
  shiftStart: "",
  shiftEnd: "",
  recurringType: "DAILY",
  effectiveDate: toDateStr(new Date()),
  recurringEndDate: "",
  referenceImages: [
    initial
      ? { id: crypto.randomUUID(), name: "", file: null, previewUrl: null }
      : createEmptyReferenceItem(),
  ],
});

export const buildDateTimeIso = (timeZone: string, dateValue: string, timeValue: string) =>
  fromZonedTime(`${dateValue}T${timeValue}:00`, timeZone).toISOString();

export const buildEffectiveDate = (dateValue: string) => {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
};

export type ScheduleStep = 0 | 1 | 2 | 3;

export function validateScheduleStep(form: TemplateCreateForm, step: ScheduleStep, legacyReferenceLimit?: number): string | null {
  if (step === 0) {
    if (!form.title.trim()) return "Add a task title.";
    if (legacyReferenceLimit !== undefined) {
      if (!form.referenceImages.length) return "Add at least one named reference photo.";
      if (form.referenceImages.length > legacyReferenceLimit) return `Your plan allows up to ${legacyReferenceLimit} reference photos per task.`;
      if (form.referenceImages.some(ref => !ref.name.trim() || !ref.file)) return "Give every reference area both a name and a photo.";
      const names = form.referenceImages.map(ref => ref.name.trim());
      return new Set(names).size === names.length ? null : "Reference area names must be unique.";
    }
    if (!form.areaId || !Number.isSafeInteger(Number(form.areaId)) || Number(form.areaId) < 1) return "Choose one area.";
    if (form.inventorySelection === "SUBSET" && !form.selectedItems.some(item => item.mandatory)) return "Choose at least one mandatory item.";
    if (new Set(form.selectedItems.map(item => item.areaItemId)).size !== form.selectedItems.length) return "An inventory item can only be selected once.";
  }
  if (step === 2) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.effectiveDate) || !form.shiftStart || !form.shiftEnd) return "Choose a date, start time, and end time.";
    if (form.recurringType === "DAILY" && form.recurringEndDate && form.recurringEndDate < form.effectiveDate) return "The repeat end date must be on or after the effective date.";
  }
  return null;
}
