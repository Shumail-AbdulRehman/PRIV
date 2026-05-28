import {z} from "zod";


export const createLocationSchema = z.object({
  name: z
    .string({ message: "location name is required" }),
  address: z
    .string({ message: "location address is required" }),
  latitude: z.string({ message: "latitude is required" }),
  longitude: z.string({ message: "longitude is required" })

})

export type createLocationInput = z.infer<typeof createLocationSchema>;
