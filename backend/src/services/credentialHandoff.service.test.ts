import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ transaction: vi.fn(), raw: vi.fn(), managerFind: vi.fn(), staffFind: vi.fn(), managerUpdate: vi.fn(), staffUpdate: vi.fn(), push: vi.fn(), tokens: vi.fn(), createToken: vi.fn(), count: vi.fn(), token: vi.fn(), password: vi.fn(), audit: vi.fn(), location: vi.fn() }));
vi.mock("../prisma/prisma.js", () => ({ prisma: { $transaction: mock.transaction } }));
vi.mock("../utils/auth.js", () => ({ isPasswordCorrect: mock.password }));
vi.mock("./auditLog.service.js", () => ({ writeAuditLog: mock.audit }));
vi.mock("./verification-v2/authorization.service.js", () => ({ requireLocationAccess: mock.location }));
import { changeOwnPassword, issueStaffHandoff, completeStaffHandoff, credentialTokenHash } from "./credentialHandoff.service.js";
const actor = { id: 1, companyId: 42, role: "ADMIN" as const };
const tx = { $queryRaw: mock.raw, manager: { findFirst: mock.managerFind, update: mock.managerUpdate }, staff: { findFirst: mock.staffFind, update: mock.staffUpdate }, staffPushDevice: { updateMany: mock.push }, credentialToken: { updateMany: mock.tokens, create: mock.createToken, count: mock.count, findUnique: mock.token } };
const now = new Date("2026-10-20T12:00:00Z");
const rawToken = "t".repeat(43);
beforeEach(() => {
  vi.resetAllMocks(); mock.transaction.mockImplementation(async work => work(tx));
  mock.managerFind.mockResolvedValue({ id: 1, companyId: 42, password: "stored-hash", role: "ADMIN" });
  mock.staffFind.mockResolvedValue({ id: 7, companyId: 42, password: "stored-hash", locationId: 20, mustChangePassword: true });
  mock.password.mockImplementation(async plain => plain === "correct-current" || plain === "same-password");
  mock.count.mockResolvedValue(0); mock.tokens.mockResolvedValue({ count: 1 }); mock.raw.mockResolvedValue([]); mock.location.mockResolvedValue({});
  mock.token.mockResolvedValue({ id: "token-id", staffId: 7, companyId: 42, purpose: "STAFF_ACCESS_HANDOFF", consumedAt: null, expiresAt: new Date(+now+60_000) });
});
describe("self password change", () => {
  it.each(["ADMIN", "MANAGER", "STAFF"] as const)("requires current password and revokes %s credentials without leaking them to audit", async role => {
    const principal = { ...actor, role, id: role === "STAFF" ? 7 : 1 };
    expect(await changeOwnPassword(principal, { currentPassword: "correct-current", newPassword: "new-test-password" })).toEqual({ passwordChanged: true, signInRequired: true });
    expect(role === "STAFF" ? mock.staffUpdate : mock.managerUpdate).toHaveBeenCalledWith({ where: { id: principal.id }, data: { password: "new-test-password", refreshToken: null, credentialVersion: { increment: 1 }, mustChangePassword: false } });
    expect(mock.push).toHaveBeenCalledTimes(role === "STAFF" ? 1 : 0);
    expect(JSON.stringify(mock.audit.mock.calls)).not.toContain("new-test-password"); expect(JSON.stringify(mock.audit.mock.calls)).not.toContain("correct-current");
  });
  it("denies wrong current password or changed tenant/role before any writes", async () => {
    await expect(changeOwnPassword(actor, { currentPassword: "wrong", newPassword: "new-test-password" })).rejects.toMatchObject({ statusCode: 403 });
    mock.managerFind.mockResolvedValue(null);
    await expect(changeOwnPassword(actor, { currentPassword: "correct-current", newPassword: "new-test-password" })).rejects.toMatchObject({ statusCode: 403 });
    expect(mock.managerUpdate).not.toHaveBeenCalled(); expect(mock.tokens).not.toHaveBeenCalled();
  });
  it("rejects same/new weak passwords and unsolicited company or role claims", async () => {
    await expect(changeOwnPassword(actor, { currentPassword: "correct-current", newPassword: "same-password" })).rejects.toMatchObject({ statusCode: 400 });
    for (const input of [{ currentPassword: "correct-current", newPassword: "short" }, { currentPassword: "correct-current", newPassword: "new-test-password", companyId: 99 }])
      await expect(changeOwnPassword(actor, input)).rejects.toMatchObject({ statusCode: 400 });
    expect(mock.managerUpdate).not.toHaveBeenCalled();
  });
});
describe("assisted staff access handoff", () => {
  it("persists only a one-use token hash, invalidates former password/sessions and returns the code once", async () => {
    const result = await issueStaffHandoff(actor, 7, { currentPassword: "correct-current", reason: "Worker requested access recovery" }, undefined, now);
    expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/); expect(result.expiresAt).toEqual(new Date(+now+30*60_000));
    expect(mock.createToken).toHaveBeenCalledWith({ data: { tokenHash: credentialTokenHash(result.token), companyId: 42, staffId: 7, purpose: "STAFF_ACCESS_HANDOFF", expiresAt: result.expiresAt } });
    expect(JSON.stringify(mock.createToken.mock.calls)).not.toContain(result.token); expect(JSON.stringify(mock.audit.mock.calls)).not.toContain(result.token);
    const changed = mock.staffUpdate.mock.calls[0]![0].data;
    expect(changed).toMatchObject({ refreshToken: null, credentialVersion: { increment: 1 }, mustChangePassword: true });
    expect(changed.password).not.toBe(result.token); expect(changed.password).not.toBe("correct-current"); expect(mock.push).toHaveBeenCalledOnce();
  });
  it("checks the issuer's own current password and manager's current site scope", async () => {
    await issueStaffHandoff({ ...actor, role: "MANAGER" }, 7, { currentPassword: "correct-current", reason: "Reset requested" }, undefined, now);
    expect(mock.managerFind).toHaveBeenCalledWith({ where: { id: 1, companyId: 42, role: "MANAGER", isActive: true, company: { isActive: true } } });
    expect(mock.location).toHaveBeenCalledWith({ ...actor, role: "MANAGER" }, 20, tx);
  });
  it("denies cross-tenant/staff/owner targeting and sibling-site reset without changing credentials", async () => {
    await expect(issueStaffHandoff({ ...actor, role: "STAFF" }, 7, { currentPassword: "correct-current", reason: "x" })).rejects.toMatchObject({ statusCode: 403 });
    mock.staffFind.mockResolvedValueOnce(null);
    await expect(issueStaffHandoff(actor, 99, { currentPassword: "correct-current", reason: "x" })).rejects.toMatchObject({ statusCode: 404 });
    mock.location.mockRejectedValue({ statusCode: 403 });
    await expect(issueStaffHandoff({ ...actor, role: "MANAGER" }, 7, { currentPassword: "correct-current", reason: "x" })).rejects.toMatchObject({ statusCode: 403 });
    expect(mock.staffUpdate).not.toHaveBeenCalled(); expect(mock.createToken).not.toHaveBeenCalled();
  });
  it("bounds repeated issued handoffs before invalidating the current credentials", async () => {
    mock.count.mockResolvedValue(3);
    await expect(issueStaffHandoff(actor, 7, { currentPassword: "correct-current", reason: "x" }, undefined, now)).rejects.toMatchObject({ statusCode: 429 });
    expect(mock.staffUpdate).not.toHaveBeenCalled(); expect(mock.createToken).not.toHaveBeenCalled();
  });
});
describe("one-use handoff completion", () => {
  it("consumes a live correct-purpose token and sets the required new password with revocation", async () => {
    expect(await completeStaffHandoff({ token: rawToken, newPassword: "replacement-password" }, undefined, now)).toEqual({ passwordChanged: true, signInRequired: true });
    expect(mock.token).toHaveBeenCalledWith(expect.objectContaining({ where: { tokenHash: credentialTokenHash(rawToken) } }));
    expect(mock.tokens).toHaveBeenCalledWith({ where: { id: "token-id", consumedAt: null, expiresAt: { gt: now } }, data: { consumedAt: now } });
    expect(mock.staffUpdate).toHaveBeenCalledWith({ where: { id: 7 }, data: { password: "replacement-password", mustChangePassword: false, credentialVersion: { increment: 1 }, refreshToken: null } });
    expect(JSON.stringify(mock.audit.mock.calls)).not.toContain(rawToken);
  });
  it.each([{ consumedAt: now }, { expiresAt: now }, { purpose: "RESET_OWNER_PASSWORD" }, { staffId: null }])("denies used/expired/wrong-purpose/wrong-target token %j", async extra => {
    mock.token.mockResolvedValue({ id: "token-id", staffId: 7, companyId: 42, purpose: "STAFF_ACCESS_HANDOFF", consumedAt: null, expiresAt: new Date(+now+60_000), ...extra });
    await expect(completeStaffHandoff({ token: rawToken, newPassword: "replacement-password" }, undefined, now)).rejects.toMatchObject({ statusCode: 400 });
    expect(mock.staffUpdate).not.toHaveBeenCalled();
  });
  it("rejects a changed/deactivated target and never accepts caller-selected identity", async () => {
    mock.staffFind.mockResolvedValue(null);
    await expect(completeStaffHandoff({ token: rawToken, newPassword: "replacement-password" }, undefined, now)).rejects.toMatchObject({ statusCode: 400 });
    await expect(completeStaffHandoff({ token: rawToken, newPassword: "replacement-password", staffId: 99 }, undefined, now)).rejects.toMatchObject({ statusCode: 400 });
    expect(mock.staffUpdate).not.toHaveBeenCalled();
  });
  it("has one credential-changing winner under competing consumption requests", async () => {
    let used = false; mock.tokens.mockImplementation(async () => { if (used) return { count: 0 }; used = true; return { count: 1 }; });
    const outcomes = await Promise.allSettled([completeStaffHandoff({ token: rawToken, newPassword: "replacement-password" }, undefined, now), completeStaffHandoff({ token: rawToken, newPassword: "replacement-password" }, undefined, now)]);
    expect(outcomes.filter(r => r.status === "fulfilled")).toHaveLength(1); expect(mock.staffUpdate).toHaveBeenCalledTimes(1);
  });
});
