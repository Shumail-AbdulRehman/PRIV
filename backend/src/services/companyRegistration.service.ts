import { prisma } from "../prisma/prisma.js";
import { managerSignupSchema } from "../validations/manager.validation.js";
import { ApiError } from "../utils/ApiError.js";

export const companyRegistrationSchema = managerSignupSchema.extend({
  companyName: managerSignupSchema.shape.companyName.trim().min(2).max(160),
  name: managerSignupSchema.shape.name.trim().min(2).max(120),
  email: managerSignupSchema.shape.email.trim().max(254),
  password: managerSignupSchema.shape.password.refine(value => Buffer.byteLength(value, "utf8") <= 72, "Password must be at most 72 UTF-8 bytes"),
}).strict();

export type RegisteredOwner = { id: number; name: string; email: string; role: "ADMIN"; companyId: number };
type RegistrationDb = Pick<typeof prisma, "$transaction">;

export async function registerCompany(input: unknown, db: RegistrationDb = prisma): Promise<RegisteredOwner> {
  const parsed = companyRegistrationSchema.safeParse(input);
  if (!parsed.success) throw new ApiError(400, "Check your registration details", parsed.error.issues.map(issue => ({ field: issue.path.join("."), message: issue.message })));
  const { companyName, name, email, password } = parsed.data;
  try {
    const owner = await db.$transaction(async tx => {
      const company = await tx.company.create({ data: { name: companyName }, select: { id: true } });
      // The existing extended Prisma client hashes manager.create passwords,
      // including its transaction client. Do not hash again before this call.
      return tx.manager.create({
        data: { name, email, password, companyId: company.id, role: "ADMIN" },
        select: { id: true, name: true, email: true, role: true, companyId: true },
      });
    });
    if (owner.role !== "ADMIN") throw new ApiError(500, "Account creation could not be confirmed");
    return { id: owner.id, name: owner.name, email: owner.email, role: "ADMIN", companyId: owner.companyId };
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002")
      throw new ApiError(409, "An account with these details already exists. Sign in or recover your account.");
    throw error;
  }
}
