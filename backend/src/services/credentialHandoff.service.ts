import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "../prisma/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { isPasswordCorrect } from "../utils/auth.js";
import { writeAuditLog } from "./auditLog.service.js";
import { requireLocationAccess, type VerificationActor } from "./verification-v2/authorization.service.js";

const password = z.string().min(8, "Use at least 8 characters").refine(value => Buffer.byteLength(value, "utf8") <= 72, "Use at most 72 UTF-8 bytes");
export const ownPasswordInput = z.object({ currentPassword: z.string().min(1).max(1024), newPassword: password }).strict();
export const staffHandoffInput = z.object({ currentPassword: z.string().min(1).max(1024), reason: z.string().trim().min(1).max(1000) }).strict();
export const completeHandoffInput = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/), newPassword: password }).strict();
export const credentialTokenHash = (value: string) => createHash("sha256").update(value).digest("hex");
type Db = Pick<typeof prisma, "$transaction">;
type Transaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function currentPrincipal(tx: Transaction, actor: VerificationActor, currentPassword: string, ownSecurity = false) {
  const user = actor.role === "STAFF"
    ? await tx.staff.findFirst({ where: { id: actor.id, companyId: actor.companyId, role: "STAFF", isActive: true, ...(!ownSecurity ? {company:{isActive:true,operationalStatus:"ACTIVE" as const}} : {}) } })
    : await tx.manager.findFirst({ where: { id: actor.id, companyId: actor.companyId, role: actor.role, isActive: true, ...(!ownSecurity ? {company: { isActive: true, operationalStatus: "ACTIVE" as const }} : {}) } });
  if (!user || !await isPasswordCorrect(currentPassword, user.password)) throw new ApiError(403, "Current password is incorrect or account access changed");
  return user;
}
async function lockPrincipal(tx: Transaction, actor: Pick<VerificationActor, "id" | "role">) {
  if (actor.role === "STAFF") await tx.$queryRaw`SELECT id FROM "Staff" WHERE id=${actor.id} FOR UPDATE`;
  else await tx.$queryRaw`SELECT id FROM "Manager" WHERE id=${actor.id} FOR UPDATE`;
}
async function invalidateTokens(tx: Transaction, role: VerificationActor["role"], id: number, companyId: number, at: Date) {
  await tx.credentialToken.updateMany({ where: { companyId, ...(role === "STAFF" ? { staffId: id } : { managerId: id }), consumedAt: null }, data: { consumedAt: at } });
}

export async function changeOwnPassword(actor: VerificationActor, raw: unknown, db: Db = prisma) {
  const parsed = ownPasswordInput.safeParse(raw);
  if (!parsed.success) throw new ApiError(400, "Check your password details", parsed.error.issues.map(issue => ({ field: issue.path.join("."), message: issue.message })));
  const input = parsed.data;
  return db.$transaction(async tx => {
    await lockPrincipal(tx, actor);
    const user = await currentPrincipal(tx, actor, input.currentPassword, true);
    if (await isPasswordCorrect(input.newPassword, user.password)) throw new ApiError(400, "Choose a different new password");
    const data = { password: input.newPassword, credentialVersion: { increment: 1 }, refreshToken: null, mustChangePassword: false };
    if (actor.role === "STAFF") {
      await tx.staff.update({ where: { id: actor.id }, data });
      await tx.staffPushDevice.updateMany({ where: { staffId: actor.id, companyId: actor.companyId }, data: { enabled: false } });
    } else await tx.manager.update({ where: { id: actor.id }, data });
    await invalidateTokens(tx, actor.role, actor.id, actor.companyId, new Date());
    await writeAuditLog({ companyId: actor.companyId, actorType: actor.role, actorId: actor.id, entityType: actor.role === "STAFF" ? "STAFF" : "MANAGER", entityId: actor.id, action: "OWN_PASSWORD_CHANGED", newValue: { sessionsRevoked: true } }, tx);
    return { passwordChanged: true, signInRequired: true };
  });
}

export async function issueStaffHandoff(actor: VerificationActor, staffId: number, raw: unknown, db: Db = prisma, now = new Date()) {
  if (!["ADMIN", "MANAGER"].includes(actor.role)) throw new ApiError(403, "Owner or assigned-site manager required");
  if (!Number.isSafeInteger(staffId) || staffId < 1) throw new ApiError(400, "Invalid staff identifier");
  const parsed = staffHandoffInput.safeParse(raw);
  if (!parsed.success) throw new ApiError(400, "Enter your current password and a reason");
  return db.$transaction(async tx => {
    await lockPrincipal(tx, actor); await currentPrincipal(tx, actor, parsed.data.currentPassword);
    await lockPrincipal(tx, { id: staffId, role: "STAFF" });
    const staff = await tx.staff.findFirst({ where: { id: staffId, companyId: actor.companyId, role: "STAFF", isActive: true, company: { isActive: true } } });
    if (!staff) throw new ApiError(404, "Staff account not found");
    if (actor.role === "MANAGER") {
      if (!staff.locationId) throw new ApiError(403, "Staff member is not assigned to your site");
      await requireLocationAccess(actor, staff.locationId, tx);
    }
    const recent = await tx.credentialToken.count({ where: { companyId: actor.companyId, staffId, purpose: "STAFF_ACCESS_HANDOFF", createdAt: { gte: new Date(+now - 15 * 60_000) } } });
    if (recent >= 3) throw new ApiError(429, "Too many access handoffs. Try again later.");
    await invalidateTokens(tx, "STAFF", staffId, actor.companyId, now);
    // Invalidate the former password instead of creating a reusable temporary
    // login credential. Only the single-use handoff can set the replacement.
    await tx.staff.update({ where: { id: staffId }, data: { password: randomBytes(32).toString("base64url"), mustChangePassword: true, credentialVersion: { increment: 1 }, refreshToken: null } });
    await tx.staffPushDevice.updateMany({ where: { staffId, companyId: actor.companyId }, data: { enabled: false } });
    const token = randomBytes(32).toString("base64url"); const expiresAt = new Date(+now + 30 * 60_000);
    await tx.credentialToken.create({ data: { tokenHash: credentialTokenHash(token), purpose: "STAFF_ACCESS_HANDOFF", companyId: actor.companyId, staffId, expiresAt } });
    await writeAuditLog({ companyId: actor.companyId, actorType: actor.role, actorId: actor.id, entityType: "STAFF", entityId: staffId, action: "STAFF_ACCESS_HANDOFF_ISSUED", reason: parsed.data.reason, newValue: { sessionsRevoked: true } }, tx);
    return { token, expiresAt, oneUse: true, passwordReplacementRequired: true };
  });
}

export async function completeStaffHandoff(raw: unknown, db: Db = prisma, now = new Date()) {
  const parsed = completeHandoffInput.safeParse(raw);
  if (!parsed.success) throw new ApiError(400, "Check the access code and new password");
  const tokenHash = credentialTokenHash(parsed.data.token);
  return db.$transaction(async tx => {
    // Read target ID first for the same staff→token lock order used by issuance;
    // re-read the token after both locks before trusting its state.
    const initial = await tx.credentialToken.findUnique({ where: { tokenHash }, select: { staffId: true } });
    if (!initial?.staffId) throw new ApiError(400, "Access code is invalid or expired");
    await lockPrincipal(tx, { id: initial.staffId, role: "STAFF" });
    await tx.$queryRaw`SELECT id FROM "CredentialToken" WHERE "tokenHash"=${tokenHash} FOR UPDATE`;
    const token = await tx.credentialToken.findUnique({ where: { tokenHash } });
    if (!token || token.staffId !== initial.staffId || token.purpose !== "STAFF_ACCESS_HANDOFF" || token.consumedAt || token.expiresAt <= now)
      throw new ApiError(400, "Access code is invalid or expired");
    const staff = await tx.staff.findFirst({ where: { id: token.staffId, companyId: token.companyId, role: "STAFF", isActive: true, company: { isActive: true } } });
    if (!staff || !staff.mustChangePassword) throw new ApiError(400, "Access code is invalid or expired");
    const consumed = await tx.credentialToken.updateMany({ where: { id: token.id, consumedAt: null, expiresAt: { gt: now } }, data: { consumedAt: now } });
    if (!consumed.count) throw new ApiError(400, "Access code is invalid or expired");
    await tx.staff.update({ where: { id: staff.id }, data: { password: parsed.data.newPassword, mustChangePassword: false, credentialVersion: { increment: 1 }, refreshToken: null } });
    await tx.staffPushDevice.updateMany({ where: { staffId: staff.id, companyId: token.companyId }, data: { enabled: false } });
    await writeAuditLog({ companyId: token.companyId, actorType: "STAFF", actorId: staff.id, entityType: "STAFF", entityId: staff.id, action: "STAFF_ACCESS_HANDOFF_COMPLETED", newValue: { passwordReplaced: true } }, tx);
    return { passwordChanged: true, signInRequired: true };
  });
}
