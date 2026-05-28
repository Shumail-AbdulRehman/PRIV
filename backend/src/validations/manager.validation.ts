import { z } from "zod";

export const managerSignupSchema = z.object({
  companyName: z
    .string({ message: "company name is required" })
  ,
  name: z
    .string({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters"),


  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format"),


  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters"),



});

export type ManagerSignupInput = z.infer<typeof managerSignupSchema>;

export const managerLoginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required"),
});

export type ManagerLoginInput = z.infer<typeof managerLoginSchema>;