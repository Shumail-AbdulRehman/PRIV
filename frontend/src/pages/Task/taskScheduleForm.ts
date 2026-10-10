import { fromZonedTime } from "date-fns-tz";

export interface TemplateCreateForm {
  title: string;
  description: string;
  staffId: string;
  shiftStart: string;
  shiftEnd: string;
  recurringType: "DAILY" | "ONCE";
  effectiveDate: string;
  recurringEndDate: string;
  areaId: string;
  inventorySelection: "ALL" | "SUBSET";
  selectedItems: Array<{areaItemId:number; mandatory:boolean}>;
}

export const toDateStr = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

export const blankCreateForm = (): TemplateCreateForm => ({
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

});

export const buildDateTimeIso = (timeZone: string, dateValue: string, timeValue: string) =>
  fromZonedTime(`${dateValue}T${timeValue}:00`, timeZone).toISOString();

export const buildEffectiveDate = (dateValue: string) => {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
};

export type ScheduleStep = 0 | 1 | 2 | 3;

export function validateScheduleStep(form: TemplateCreateForm, step: ScheduleStep): string | null {
  if (step === 0) {
    if (!form.title.trim()) return "Add a task title.";
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
