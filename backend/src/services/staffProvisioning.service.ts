import { ApiError } from "../utils/ApiError.js";
import type { VerificationTransaction } from './verification-v2/transaction.js';
import type { CreateStaffInput } from '../validations/staff.validation.js';

/** Caller owns authorization and capacity transaction; Prisma create hashes passwords. */
export async function insertStaff(tx: VerificationTransaction, companyId: number, input: CreateStaffInput, mustChangePassword = false) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(lower(${input.email}), 1542))::text`;
  if (await tx.staff.findFirst({where:{email:{equals:input.email,mode:'insensitive'}},select:{id:true}})) throw new ApiError(409, 'Email is already in use.');
  return tx.staff.create({ data: {
    name: input.name, email: input.email, phone: input.phone, password: input.password,
    companyId, locationId: input.locationId ?? null, shiftStart: input.shiftStart ?? null,
    shiftEnd: input.shiftEnd ?? null, mustChangePassword,
  } });
}
