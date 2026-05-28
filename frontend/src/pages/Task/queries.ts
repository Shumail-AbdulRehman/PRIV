import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTaskTemplate,
  editTaskTemplate,
  deleteTaskTemplate,
  type CreateTaskInput,
  type EditTaskTemplateInput,
} from "./api";

export const useCreateTaskTemplate = (autoInvalidate = true) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTaskTemplate(data),
    onSuccess: () => {
      if (autoInvalidate) {
        qc.invalidateQueries({ queryKey: ["location"] });
      }
    },
  });
};

export const useEditTaskTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditTaskTemplateInput }) =>
      editTaskTemplate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["location"] });
    },
  });
};

export const useDeleteTaskTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTaskTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["location"] });
    },
  });
};
