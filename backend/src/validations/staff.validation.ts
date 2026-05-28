import {z} from "zod"

export const staffLoginSchema=z.object({
    email:z
        .email({message:"email is required"}),
    password:z
        .string({message:"password is required"})
});

export type staffLoginInput=z.infer< typeof staffLoginSchema>;



export const createStaffSchema = z.object({
    name: z
      .string({ message: "Name is required" })
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email format"),
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    locationId: z
      .number({ message: "Location ID must be a number" })
      .int("Location ID must be an integer")
      .positive("Location ID must be positive")
      .optional(),
   
    shiftStart: z.coerce.date({ message: "Shift start must be a valid date" }).optional(),
    shiftEnd: z.coerce.date({ message: "Shift end must be a valid date" }).optional(),
  }).superRefine((data, ctx) => {
    const hasStart = data.shiftStart !== undefined;
    const hasEnd = data.shiftEnd !== undefined;

    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Both shiftStart and shiftEnd must be provided together",
        path: hasStart ? ["shiftEnd"] : ["shiftStart"],
      });
      return;
    }

    if (hasStart && hasEnd) {
      const startMin = data.shiftStart!.getHours() * 60 + data.shiftStart!.getMinutes();
      const endMin = data.shiftEnd!.getHours() * 60 + data.shiftEnd!.getMinutes();
      if (startMin === endMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Shift start and end cannot be the same time",
          path: ["shiftEnd"],
        });
      }
    }
  });

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const editStaffSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .optional(),
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format")
    .optional(),
  shiftStart: z.coerce.date({ message: "Shift start must be a valid date" }).optional(),
  shiftEnd: z.coerce.date({ message: "Shift end must be a valid date" }).optional(),
}).superRefine((data, ctx) => {
  if (data.shiftStart !== undefined && data.shiftEnd !== undefined) {
    const startMin = data.shiftStart.getHours() * 60 + data.shiftStart.getMinutes();
    const endMin = data.shiftEnd.getHours() * 60 + data.shiftEnd.getMinutes();
    if (startMin === endMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shift start and end cannot be the same time",
        path: ["shiftEnd"],
      });
    }
  }
});

export type EditStaffInput = z.infer<typeof editStaffSchema>;
