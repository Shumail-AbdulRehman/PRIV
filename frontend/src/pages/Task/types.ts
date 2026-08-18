export type CreateTaskInput = {
  title: string;
  description?: string;
  locationId: number;
  shiftStart: Date;
  shiftEnd: Date;
  recurringType?: "DAILY" | "ONCE";
  effectiveDate: Date;
  recurringEndDate?: Date;
};

export type ReferenceImageInput = {
  file: File;
  name: string;
};

export type CreateTaskTemplateFormData = CreateTaskInput & {
  referenceImages: ReferenceImageInput[];
};


export type EditTaskInput = {
  title?: string;
  description?: string;
  locationId?: number;
  shiftStart?: Date;
  shiftEnd?: Date;
  recurringType?: "DAILY" | "ONCE";
  effectiveDate?: Date;
  recurringEndDate?: Date;
};