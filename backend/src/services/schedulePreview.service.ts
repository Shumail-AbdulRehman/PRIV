import { formatInTimeZone } from "date-fns-tz";
import { getZonedDayRangeFromDateInput } from "../utils/dateTime.js";
import { resolveTaskInstanceWindow } from "../cron/taskInstanceWindow.js";

export type ScheduleTemplate = {
  id: number; title: string; shiftStart: Date; shiftEnd: Date; effectiveDate: Date;
  recurringType: "DAILY" | "ONCE" | null; recurringEndDate: Date | null;
  staff: { id: number; name: string; shiftStart: Date | null; shiftEnd: Date | null } | null;
};
export type ScheduleInstance = {
  id: number; templateId: number | null; title: string; date: Date; shiftStart: Date; shiftEnd: Date;
  status: string; staff: { id: number; name: string } | null;
  assignments: Array<{ staff: { id: number; name: string } | null }>;
};
export type ScheduleItem = {
  key: string; kind: "actual" | "planned"; instanceId: number | null; templateId: number | null;
  title: string; startsAt: string; endsAt: string; status: string | null;
  staff: { id: number; name: string } | null;
  staffMeaning: "actual" | "template-default" | "unassigned";
  continuesFromPreviousDay: boolean; continuesIntoNextDay: boolean;
};
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const dayDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const dateString = (date: Date) => date.toISOString().slice(0, 10);
export const addCalendarDays = (value: string, days: number) => {
  const date = dayDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return dateString(date);
};
export function normalizeMonday(input: string | undefined, now: Date, timezone: string): string | null {
  const day = input ?? formatInTimeZone(now, timezone, "yyyy-MM-dd");
  if (!ISO_DAY.test(day) || !getZonedDayRangeFromDateInput(day, timezone)) return null;
  const weekday = dayDate(day).getUTCDay();
  return addCalendarDays(day, -(weekday === 0 ? 6 : weekday - 1));
}

export function projectWeek({ weekStart, timezone, now, templates, instances }: {
  weekStart: string; timezone: string; now: Date; templates: ScheduleTemplate[]; instances: ScheduleInstance[];
}) {
  const weekEndExclusive = addCalendarDays(weekStart, 7);
  const windowStart = getZonedDayRangeFromDateInput(weekStart, timezone)!.start;
  const windowEnd = getZonedDayRangeFromDateInput(weekEndExclusive, timezone)!.start;
  const todayLocal = formatInTimeZone(now, timezone, "yyyy-MM-dd");
  const actualKeys = new Set(instances.filter((item) => item.templateId !== null)
    .map((item) => `${item.templateId}:${item.date.toISOString()}`));
  const occurrences: Array<Omit<ScheduleItem, "continuesFromPreviousDay" | "continuesIntoNextDay"> & { start: Date; end: Date }> = [];

  for (const instance of instances) {
    if (!(instance.shiftStart < windowEnd && instance.shiftEnd > windowStart)) continue;
    const current = instance.assignments[0]?.staff ?? instance.staff;
    occurrences.push({
      key: `actual:${instance.id}`, kind: "actual", instanceId: instance.id, templateId: instance.templateId,
      title: instance.title, startsAt: instance.shiftStart.toISOString(), endsAt: instance.shiftEnd.toISOString(),
      start: instance.shiftStart, end: instance.shiftEnd, status: instance.status, staff: current,
      staffMeaning: current ? "actual" : "unassigned",
    });
  }

  for (const template of templates) {
    if (template.recurringType !== "DAILY" && template.recurringType !== "ONCE") continue;
    // The scheduler can move an occurrence into the following local day for an overnight staff shift.
    for (let offset = -2; offset < 7; offset++) {
      const baseDay = addCalendarDays(weekStart, offset);
      const range = getZonedDayRangeFromDateInput(baseDay, timezone)!;
      const localToday = range.start;
      const localTomorrow = range.end;
      if (template.recurringType === "DAILY") {
        if (template.effectiveDate > localTomorrow) continue;
        if (template.recurringEndDate && template.recurringEndDate < localToday) continue;
      } else if (template.effectiveDate < localToday || template.effectiveDate >= localTomorrow) continue;
      const resolved = resolveTaskInstanceWindow({
        baseDate: localToday, taskShiftStart: template.shiftStart, taskShiftEnd: template.shiftEnd,
        staffShiftStart: template.staff?.shiftStart, staffShiftEnd: template.staff?.shiftEnd, timeZone: timezone,
      });
      if (!(resolved.shiftStart < windowEnd && resolved.shiftEnd > windowStart)) continue;
      if (formatInTimeZone(resolved.shiftStart, timezone, "yyyy-MM-dd") < todayLocal) continue;
      const occurrenceKey = `${template.id}:${resolved.date.toISOString()}`;
      if (actualKeys.has(occurrenceKey)) continue;
      occurrences.push({
        key: `planned:${occurrenceKey}`, kind: "planned", instanceId: null, templateId: template.id,
        title: template.title, startsAt: resolved.shiftStart.toISOString(), endsAt: resolved.shiftEnd.toISOString(),
        start: resolved.shiftStart, end: resolved.shiftEnd, status: null,
        staff: template.staff ? { id: template.staff.id, name: template.staff.name } : null,
        staffMeaning: template.staff ? "template-default" : "unassigned",
      });
    }
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addCalendarDays(weekStart, index);
    const { start, end } = getZonedDayRangeFromDateInput(date, timezone)!;
    const items: ScheduleItem[] = occurrences.filter((item) => item.start < end && item.end > start)
      .sort((a, b) => a.start.getTime() - b.start.getTime() || a.title.localeCompare(b.title) || a.key.localeCompare(b.key))
      .map(({ start: itemStart, end: itemEnd, ...item }) => ({
        ...item, continuesFromPreviousDay: itemStart < start, continuesIntoNextDay: itemEnd > end,
      }));
    return { date, items };
  });
  return { weekStart, weekEndExclusive, days };
}
