import { client } from "@/api/client";
import type { CreateTaskTemplateFormData } from "./types";
export type { CreateTaskTemplateFormData } from "./types";

export const createTaskTemplate = async (data: CreateTaskTemplateFormData) => {
  const formData = new FormData();
  formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  formData.append("locationId", String(data.locationId));
  formData.append("shiftStart", data.shiftStart.toISOString());
  formData.append("shiftEnd", data.shiftEnd.toISOString());
  if (data.recurringType) formData.append("recurringType", data.recurringType);
  formData.append("effectiveDate", data.effectiveDate.toISOString());
  if (data.recurringEndDate) formData.append("recurringEndDate", data.recurringEndDate.toISOString());

  data.referenceImages.forEach((ref) => {
    formData.append("referenceImages", ref.file);
    formData.append("referenceNames", ref.name);
  });

  const res = await client.post("/task-template", formData);
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
