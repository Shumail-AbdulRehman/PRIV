import { Badge } from "./ui/badge";
import type { AttendanceStatus, TaskStatus } from "../types";

type StatusBadgeProps = {
  status: TaskStatus | AttendanceStatus | string;
};

const taskVariantMap: Record<TaskStatus, "warning" | "default" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  MISSED: "destructive",
  NOT_COMPLETED_INTIME: "destructive",
  CANCELLED: "secondary",
};

const attendanceVariantMap: Record<AttendanceStatus, "warning" | "default" | "success" | "destructive" | "secondary"> = {
  ABSENT: "warning",
  CHECKED_IN: "default",
  CHECKED_OUT: "success",
  LATE: "warning",
  MISSED_CHECKOUT: "destructive",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant =
    (taskVariantMap as Record<string, typeof taskVariantMap[keyof typeof taskVariantMap]>)[status] ??
    (attendanceVariantMap as Record<string, typeof attendanceVariantMap[keyof typeof attendanceVariantMap]>)[status] ??
    "secondary";

  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}
