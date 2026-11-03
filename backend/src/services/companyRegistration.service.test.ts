import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
const mock = vi.hoisted(() => ({ transaction: vi.fn(), company: vi.fn(), owner: vi.fn(), session: vi.fn(), access: vi.fn(), refresh: vi.fn(), audit: vi.fn() }));
vi.mock("../prisma/prisma.js", () => ({ prisma: { $transaction: mock.transaction, manager: { updateMany: mock.session } } }));
vi.mock("../utils/auth.js", () => ({ generateAccessToken: mock.access, generateRefreshToken: mock.refresh }));
import { companyRegistrationSchema, registerCompany } from "./companyRegistration.service.js";
import { signupCompany } from "../controllers/companyRegistration.controller.js";
const input = () => ({ companyName: "Test cleaning", name: "Test owner", email: "owner@example.invalid", password: "test-password" });
const owner = { id: 2, name: "Test owner", email: "owner@example.invalid", role: "ADMIN", companyId: 3 };
beforeEach(() => {
  vi.resetAllMocks(); mock.company.mockResolvedValue({ id: 3 }); mock.owner.mockResolvedValue(owner);
  mock.transaction.mockImplementation(async work => work({ company: { create: mock.company }, manager: { create: mock.owner }, auditLog: { create: mock.audit } }));
  mock.session.mockResolvedValue({ count: 1 }); mock.access.mockReturnValue("test-access"); mock.refresh.mockReturnValue("test-refresh");
});
function response() { const res = { status: vi.fn(), cookie: vi.fn(), json: vi.fn() }; res.status.mockReturnValue(res); res.cookie.mockReturnValue(res); return res; }
describe("company registration", () => {
  it("creates company and first ADMIN inside one transaction and returns only a safe owner DTO", async () => {
    const result = await registerCompany(input());
    expect(mock.transaction).toHaveBeenCalledTimes(1);
    expect(mock.company).toHaveBeenCalledWith({ data: { name: "Test cleaning" }, select: { id: true } });
    expect(mock.owner).toHaveBeenCalledWith({ data: { name: "Test owner", email: "owner@example.invalid", password: "test-password", companyId: 3, role: "ADMIN" }, select: { id: true, name: true, email: true, role: true, companyId: true } });
    expect(mock.audit).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: "OWNER_EMAIL_ENROLLMENT_ALLOWED", actorId: owner.id, newValue: { emailHash: expect.stringMatching(/^[a-f0-9]{64}$/), source: "REGISTRATION" } }) }));
    expect(result).toEqual(owner); expect(result).not.toHaveProperty("password");
  });
  it("does not publish a signup/session when enrollment audit fails inside its transaction", async () => {
    mock.audit.mockRejectedValueOnce(new Error("synthetic enrollment audit failure"));
    await expect(registerCompany(input())).rejects.toThrow("synthetic enrollment audit failure");
    expect(mock.session).not.toHaveBeenCalled();
  });
  it("rolls back a newly created company if owner insert fails", async () => {
    const persisted: object[] = [];
    mock.transaction.mockImplementation(async work => {
      const pending: object[] = [];
      const tx = { company: { create: async () => { pending.push({ id: 3 }); return { id: 3 }; } }, manager: { create: async () => { throw new Error("owner insert failed"); } } };
      const result = await work(tx); persisted.push(...pending); return result;
    });
    await expect(registerCompany(input())).rejects.toThrow("owner insert failed"); expect(persisted).toEqual([]); expect(mock.session).not.toHaveBeenCalled();
  });
  it("maps the uniqueness error raised inside a concurrent transaction without exposing internal fields", async () => {
    mock.owner.mockRejectedValue(Object.assign(new Error("constraint internal password detail"), { code: "P2002" }));
    await expect(registerCompany(input())).rejects.toMatchObject({ statusCode: 409, message: "An account with these details already exists. Sign in or recover your account." });
  });
  it.each(["role", "companyId", "plan", "isActive", "operator"])("rejects public %s claims before DB writes", async key => {
    await expect(registerCompany({ ...input(), [key]: "ADMIN" })).rejects.toMatchObject({ statusCode: 400 }); expect(mock.transaction).not.toHaveBeenCalled();
  });
  it("rejects blank organization and bcrypt-truncated passwords while preserving the existing minimum", async () => {
    expect(companyRegistrationSchema.safeParse({ ...input(), companyName: "  " }).success).toBe(false);
    expect(companyRegistrationSchema.safeParse({ ...input(), password: "آ".repeat(40) }).success).toBe(false);
    expect(companyRegistrationSchema.safeParse({ ...input(), password: "abcdef" }).success).toBe(true);
    expect(mock.transaction).not.toHaveBeenCalled();
  });
  it("trims names while preserving the existing case-sensitive email login contract", async () => {
    await registerCompany({ ...input(), name: "  Test owner  ", email: "OWNER@example.invalid", companyName: "  Test cleaning  " });
    expect(mock.owner.mock.calls[0]![0].data.email).toBe("OWNER@example.invalid"); expect(mock.company.mock.calls[0]![0].data.name).toBe("Test cleaning");
  });
  it("sets session cookies only after the account transaction commits", async () => {
    const res = response(); await signupCompany({ body: input() } as Request, res as unknown as Response);
    expect(mock.transaction.mock.invocationCallOrder[0]).toBeLessThan(mock.session.mock.invocationCallOrder[0]!);
    expect(res.cookie).toHaveBeenCalledWith("accessToken", "test-access", expect.objectContaining({ httpOnly: true }));
    expect(res.json.mock.calls[0]![0].data).toEqual({ ...owner, sessionEstablished: true });
  });
  it("reports durable account creation explicitly if session issuing fails instead of inviting duplicate signup", async () => {
    mock.access.mockImplementation(() => { throw new Error("signing key problem must not leak"); });
    const res = response(); await signupCompany({ body: input() } as Request, res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(201); expect(res.cookie).not.toHaveBeenCalled();
    expect(res.json.mock.calls[0]![0].data).toEqual({ ...owner, sessionEstablished: false });
    expect(res.json.mock.calls[0]![0].message).toBe("Account created. Sign in to continue.");
  });
  it("does not overwrite an intervening sign-in when establishing the signup session", async () => {
    mock.session.mockResolvedValue({ count: 0 }); const res = response();
    await signupCompany({ body: input() } as Request, res as unknown as Response);
    expect(mock.session).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 2, companyId: 3, role: "ADMIN", credentialVersion: 0, isActive: true, refreshToken: null, company: { isActive: true } } }));
    expect(res.cookie).not.toHaveBeenCalled(); expect(res.json.mock.calls[0]![0].data.sessionEstablished).toBe(false);
  });
});
