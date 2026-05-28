import { z } from "zod";

export const checkInSchema = z.object({
    latitude: z.coerce.number({ message: "Latitude is required" }),
    longitude: z.coerce.number({ message: "Longitude is required" }),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const checkOutSchema = z.object({
    latitude: z.coerce.number({ message: "Latitude is required" }),
    longitude: z.coerce.number({ message: "Longitude is required" }),
});

export type CheckOutInput = z.infer<typeof checkOutSchema>;

export const assignShiftSchema = z.object({
        shiftStart: z.coerce.date({ message: "Shift start time is required" }),
        shiftEnd: z.coerce.date({ message: "Shift end time is required" }),
    })
    .superRefine((data, ctx) => {
        const startHours = data.shiftStart.getHours() * 60 + data.shiftStart.getMinutes();
        const endHours = data.shiftEnd.getHours() * 60 + data.shiftEnd.getMinutes();

        if (startHours === endHours) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Shift start and end cannot be the same time",
                path: ["shiftEnd"],
            });
        }
    });

export type AssignShiftInput = z.infer<typeof assignShiftSchema>;
