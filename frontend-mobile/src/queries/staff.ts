import { savedWork } from '../verification/queue';
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

const fetchTodaysTasks = async (staffId:number) => {
  let local:TaskInstance[]=[];
  try {local=(await savedWork()).map(s=>({...s.manifest.task,date:s.manifest.task.shiftEnd,shiftStart:s.manifest.task.shiftEnd,startedAt:null,completedAt:null,proofImageUrls:[]} as TaskInstance));}catch{/* Legacy/web does not open a native queue. */}
  const results=await Promise.allSettled([
    client.get<ApiEnvelope<TaskInstance[]>>(`/task-instance/staff/${staffId}/today`),
    (async()=>{let cursor:number|null=null;const tasks:TaskInstance[]=[];do{const page: {data:ApiEnvelope<{tasks:TaskInstance[];nextCursor:number|null}>}=await client.get<ApiEnvelope<{tasks:TaskInstance[];nextCursor:number|null}>>('/task-instance/staff/me/verification-work',{params:cursor?{cursor}:{}});tasks.push(...page.data.data.tasks);cursor=page.data.data.nextCursor;}while(cursor);return tasks;})(),
  ]);
  const map=new Map(local.map(t=>[t.id,t]));
  if(results[0].status==='fulfilled')results[0].value.data.data.forEach(t=>map.set(t.id,t));
  if(results[1].status==='fulfilled')results[1].value.forEach(t=>map.set(t.id,{...map.get(t.id),...t}));
  if(results.every(r=>r.status==='rejected')&&!local.length)throw (results[0] as PromiseRejectedResult).reason;
  return [...map.values()].sort((a,b)=>a.shiftStart.localeCompare(b.shiftStart));
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
