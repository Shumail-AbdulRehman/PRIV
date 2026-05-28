import { client } from "@/api/client";
import type { CreateTaskInput } from "./types";
export type { CreateTaskInput } from "./types";

export const createTaskTemplate = async (data: CreateTaskInput) => {
  const res = await client.post("/task-template", data);
  return res.data;
};

export interface EditTaskTemplateInput {
  title?: string;
  description?: string;
  locationId?: number;
  shiftStart?: string;
  shiftEnd?: string;
  recurringType?: "DAILY" | "ONCE";
  effectiveDate?: string;
  recurringEndDate?: string;
}

export const editTaskTemplate = async (
  id: number,
  data: EditTaskTemplateInput
) => {
  const res = await client.patch(`/task-template/${id}`, data);
  return res.data;
};

export const deleteTaskTemplate = async (id: number) => {
  const res = await client.delete(`/task-template/${id}`);
  return res.data;
};
