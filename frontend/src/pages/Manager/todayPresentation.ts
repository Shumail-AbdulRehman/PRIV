import type { StaffStatusEntry } from "./types";

export function needsAttention(entry: StaffStatusEntry): boolean {
  return entry.flags.isAbsent || entry.flags.isLateAttendance || entry.flags.hasAttentionTasks;
}

export function attentionReasons(entry: StaffStatusEntry, asOf: string): string[] {
  const reasons: string[] = [];
  if (entry.flags.isAbsent) reasons.push("Missing check-in");
  if (entry.flags.isLateAttendance) reasons.push("Late check-in");
  if (entry.attendance?.status === "MISSED_CHECKOUT") reasons.push("Missing check-out");

  const counts = new Map<string, number>();
  const plurals: Record<string, string> = {
    "missed task": "missed tasks",
    "task not completed on time": "tasks not completed on time",
    "task completed late": "tasks completed late",
    "overdue task": "overdue tasks",
    "late start": "late starts",
    "task started late": "tasks started late",
  };
  const requestTime = Date.parse(asOf);
  for (const task of entry.tasks) {
    let label: string | undefined;
    if (task.status === "MISSED") label = "missed task";
    else if (task.status === "NOT_COMPLETED_INTIME") label = "task not completed on time";
    else if (task.status === "COMPLETED" && task.isLate) label = "task completed late";
    else if (task.status === "PENDING" || task.status === "IN_PROGRESS") {
      if (Number.isFinite(requestTime) && Date.parse(task.shiftEnd) < requestTime) label = "overdue task";
      else if (task.isCurrentlyLate) label = task.status === "PENDING" ? "late start" : "task started late";
    }
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  for (const [label, count] of counts) {
    reasons.push(`${count} ${count === 1 ? label : plurals[label]}`);
  }
  return reasons;
}

function attentionRank(entry: StaffStatusEntry, asOf: string): number {
  if (entry.flags.isAbsent) return 0;
  const requestTime = Date.parse(asOf);
  if (Number.isFinite(requestTime) && entry.tasks.some((task) =>
    (task.status === "PENDING" || task.status === "IN_PROGRESS") && Date.parse(task.shiftEnd) < requestTime,
  )) return 1;
  return 2;
}

export function sortedStaff(entries: StaffStatusEntry[], attentionOnly: boolean, asOf: string): StaffStatusEntry[] {
  return entries.filter((entry) => !attentionOnly || needsAttention(entry)).sort((a, b) => {
    if (attentionOnly) {
      const rank = attentionRank(a, asOf) - attentionRank(b, asOf);
      if (rank) return rank;
    }
    return a.staff.name.localeCompare(b.staff.name, undefined, { sensitivity: "base" }) || a.staff.id - b.staff.id;
  });
}

export function staffTodayLink(entry: StaffStatusEntry): string {
  const day = entry.localDate;
  return `/staff/${entry.staff.id}?dateFrom=${day}&dateTo=${day}&tab=overview&focus=today`;
}
