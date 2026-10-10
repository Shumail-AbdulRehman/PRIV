import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { client } from './client';
import type { ApiEnvelope, TaskInstance } from '../types';

export async function startCleaning(queryClient: QueryClient, queryKey: QueryKey, taskId: number, areaQr: string) {
  const response = await client.post<ApiEnvelope<TaskInstance>>(`/task-instance/${taskId}/start`, { areaQr });
  // Cancel an older feed response before applying the server-confirmed start.
  await queryClient.cancelQueries({ queryKey });
  queryClient.setQueryData<TaskInstance[]>(queryKey, tasks =>
    tasks?.map(task => task.id === taskId ? { ...task, ...response.data.data } : task));
  // Refresh related verification data without making staff wait for another feed.
  void queryClient.invalidateQueries({ queryKey }).catch(() => {});
  return response.data.data;
}
