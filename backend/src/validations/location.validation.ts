import {z} from "zod";
import { isValidTimeZone } from "../utils/dateTime.js";


export const createLocationSchema = z.object({
  name: z
    .string({ message: "location name is required" }),
  address: z
    .string({ message: "location address is required" }),
  latitude: z.string({ message: "latitude is required" }),
  longitude: z.string({ message: "longitude is required" }),
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
