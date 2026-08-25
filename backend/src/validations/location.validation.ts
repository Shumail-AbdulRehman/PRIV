import {z} from "zod";
import { isValidTimeZone } from "../utils/dateTime.js";


export const createLocationSchema = z.object({
  name: z
    .string({ message: "location name is required" }),
  address: z
    .string({ message: "location address is required" }),
  latitude: z
    .string({ message: "latitude is required" })
    .refine((v) => {
      const n = Number(v);
      return !isNaN(n) && n >= -90 && n <= 90;
    }, "Latitude must be a number between -90 and 90"),
  longitude: z
    .string({ message: "longitude is required" })
    .refine((v) => {
      const n = Number(v);
      return !isNaN(n) && n >= -180 && n <= 180;
    }, "Longitude must be a number between -180 and 180"),
  timezone: z
    .string()
    .refine(isValidTimeZone, "Invalid timezone")
    .optional()

})

export const editLocationSchema = createLocationSchema.extend({
  timezone: createLocationSchema.shape.timezone.optional()
})

export type createLocationInput = z.infer<typeof createLocationSchema>;
export type editLocationInput = z.infer<typeof editLocationSchema>;
