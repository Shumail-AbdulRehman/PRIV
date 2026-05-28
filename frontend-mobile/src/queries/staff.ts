import { useQuery } from "@tanstack/react-query";
import { client } from "../api/client";
import type { ApiEnvelope, AttendanceRecord, TaskInstance } from "../types";

export const staffQueryKeys = {
  all: ["staff"] as const,
  attendance: (staffId: number | undefined) =>
    [...staffQueryKeys.all, staffId, "attendance"] as const,
  tasksToday: (staffId: number | undefined) =>
    [...staffQueryKeys.all, staffId, "tasks", "today"] as const,
};

const fetchMyAttendance = async () => {
  const response = await client.get<ApiEnvelope<AttendanceRecord[]>>("/attendance/my");
  return response.data.data;
};

const fetchTodaysTasks = async (staffId: number) => {
  const response = await client.get<ApiEnvelope<TaskInstance[]>>(
    `/task-instance/staff/${staffId}/today`
  );

  return response.data.data;
};

export const useMyAttendanceQuery = (staffId: number | undefined) =>
  useQuery({
    queryKey: staffQueryKeys.attendance(staffId),
    queryFn: fetchMyAttendance,
    enabled: Boolean(staffId),
  });

export const useTodaysTasksQuery = (staffId: number | undefined) =>
  useQuery({
    queryKey: staffQueryKeys.tasksToday(staffId),
    queryFn: () => fetchTodaysTasks(staffId as number),
    enabled: Boolean(staffId),
  });
