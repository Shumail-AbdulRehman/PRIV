import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import express from "express";
import type { ErrorRequestHandler } from "express";
import type { AddressInfo } from "node:net";
import { getCookieOptions } from "../utils/cookies.js";
import { verifySessionToken } from "../utils/auth.js";

const database = vi.hoisted(() => ({
  manager: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  staff: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
}));
vi.mock("../prisma/prisma.js", () => ({ prisma: database }));

import { login } from "./login.service.js";
import commonRouter from "../routes/common.route.js";

const credentials = { email: "person@example.invalid", password: "test-password" };
let passwordHash: string;
let otherHash: string;
let server: ReturnType<express.Express["listen"]>;
let origin: string;

function account(role: "ADMIN" | "MANAGER" | "STAFF" = "MANAGER", changes = {}) {
  return {
    id: role === "STAFF" ? 12 : 7, companyId: role === "STAFF" ? 22 : 11,
    name: "Test person", email: credentials.email, password: passwordHash,
    role, isActive: true, credentialVersion: 3,
    ...(role === "STAFF" ? { locationId: 9 } : {}), ...changes,
  };
}
type Account = ReturnType<typeof account>;
function model(rows: Account[] = []) {
  return {
    findUnique: vi.fn(async ({ where }: { where: { email: string } }) => rows.find(row => row.email === where.email) ?? null),
    findMany: vi.fn(async ({ where, take }: { where: { email: { equals: string; mode: "insensitive" } }; take: number }) =>
      rows.filter(row => row.email.toLowerCase() === where.email.equals.toLowerCase()).slice(0, take)),
    update: vi.fn(async (_args: { where: { id: number }; data: { refreshToken: string } }) => ({})),
  };
}
function db(managers: Account[] = [], staff: Account[] = []) {
  return { manager: model(managers), staff: model(staff) };
}
function useRouteDb(managers: Account[] = [], staff: Account[] = []) {
  const fake = db(managers, staff);
  for (const kind of ["manager", "staff"] as const) {
    database[kind].findUnique.mockImplementation(fake[kind].findUnique);
    database[kind].findMany.mockImplementation(fake[kind].findMany);
    database[kind].update.mockImplementation(fake[kind].update);
  }
}
async function post(body: unknown) {
  return fetch(`${origin}/common/login`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
}
beforeAll(async () => {
  [passwordHash, otherHash] = await Promise.all([bcrypt.hash(credentials.password, 10), bcrypt.hash("different-password", 10)]);
  // Exercise the actual common route on local HTTP with only an in-memory DB.
  const app = express();
  app.use(express.json());
  app.use("/common", commonRouter);
  const errors: ErrorRequestHandler = (error, _req, res, _next) => {
    res.status(error.statusCode ?? 500).json({ success: false, message: error.message, errors: error.errors ?? [] });
  };
  app.use(errors);
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ACCESS_TOKEN_SECRET", "unified-login-test-access-key");
  vi.stubEnv("REFRESH_TOKEN_SECRET", "unified-login-test-refresh-key");
  vi.stubEnv("ACCESS_TOKEN_EXPIRY", "15m");
  vi.stubEnv("REFRESH_TOKEN_EXPIRY", "7d");
  vi.stubEnv("STAFF_REFRESH_TOKEN_EXPIRY", "30d");
  vi.stubEnv("COOKIE_SECURE", "true");
  vi.stubEnv("COOKIE_SAME_SITE", "none");
  vi.spyOn(bcrypt, "compare");
  useRouteDb();
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("unified login credentials", () => {
  it.each(["ADMIN", "MANAGER"] as const)("%s wins when manager and staff passwords both match", async role => {
    const fake = db([account(role)], [account("STAFF")]);
    const session = await login(credentials, fake);
    expect(session.user).toEqual({ id: 7, companyId: 11, name: "Test person", email: credentials.email, role });
    expect(fake.staff.findUnique).not.toHaveBeenCalled();
    expect(fake.staff.update).not.toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalledExactlyOnceWith(credentials.password, passwordHash);
  });
  it("tries staff when the manager's password does not match", async () => {
    const fake = db([account("MANAGER", { password: otherHash })], [account("STAFF")]);
    const session = await login(credentials, fake);
    expect(session.user).toMatchObject({ id: 12, companyId: 22, role: "STAFF", locationId: 9 });
    expect(bcrypt.compare).toHaveBeenCalledTimes(2);
    expect(fake.manager.update).not.toHaveBeenCalled();
    expect(fake.staff.update).toHaveBeenCalledWith({ where: { id: 12 }, data: { refreshToken: session.refreshToken } });
  });
  it("tries staff when a deactivated manager has the wrong password", async () => {
    const fake = db([account("MANAGER", { password: otherHash, isActive: false })], [account("STAFF")]);
    expect((await login(credentials, fake)).user.role).toBe("STAFF");
  });
  it.each(["ADMIN", "MANAGER", "STAFF"] as const)("signs in a mixed-case legacy %s email without changing it", async role => {
    const legacy = account(role, { email: "Person@Example.Invalid" });
    const fake = role === "STAFF" ? db([], [legacy]) : db([legacy]);
    const session = await login(credentials, fake);
    const selected = role === "STAFF" ? fake.staff : fake.manager;
    expect(session.user.email).toBe(legacy.email);
    expect(selected.findUnique).toHaveBeenCalledWith({ where: { email: credentials.email } });
    expect(selected.findMany).toHaveBeenCalledWith({ where: { email: { equals: credentials.email, mode: "insensitive" } }, take: 2 });
  });
  it.each(["MANAGER", "STAFF"] as const)("prefers an exact %s email even when another case variant exists", async role => {
    const exact = account(role);
    const variant = account(role, { id: 99, email: "Person@Example.Invalid", password: otherHash });
    const fake = role === "STAFF" ? db([], [variant, exact]) : db([variant, exact]);
    expect((await login(credentials, fake)).user.id).toBe(exact.id);
    expect((role === "STAFF" ? fake.staff : fake.manager).findMany).not.toHaveBeenCalled();
  });
  it.each(["MANAGER", "STAFF"] as const)("rejects ambiguous case-insensitive %s matches generically with bcrypt work", async role => {
    const rows = [account(role, { email: "Person@Example.Invalid" }), account(role, { id: 99, email: "PERSON@example.invalid" })];
    const fake = role === "STAFF" ? db([], rows) : db(rows, [account("STAFF")]);
    await expect(login(credentials, fake)).rejects.toMatchObject({ statusCode: 401, message: "Invalid email or password", errors: [] });
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(fake.manager.update).not.toHaveBeenCalled();
    expect(fake.staff.update).not.toHaveBeenCalled();
  });
  it("manager case-insensitive match still takes precedence over exact staff credentials", async () => {
    const fake = db([account("ADMIN", { email: "Person@Example.Invalid" })], [account("STAFF")]);
    expect((await login(credentials, fake)).user.role).toBe("ADMIN");
    expect(fake.staff.findUnique).not.toHaveBeenCalled();
  });
  it.each(["MANAGER", "STAFF"] as const)("unknown email and wrong %s password have identical failures and one real bcrypt comparison", async role => {
    const missing = await login(credentials, db()).catch(error => error);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenLastCalledWith(credentials.password, expect.stringMatching(/^\$2b\$10\$.{53}$/));
    vi.mocked(bcrypt.compare).mockClear();
    const wrong = account(role, { password: otherHash });
    const fake = role === "STAFF" ? db([], [wrong]) : db([wrong]);
    const rejected = await login(credentials, fake).catch(error => error);
    expect(rejected).toMatchObject({ statusCode: 401, message: "Invalid email or password", errors: [], success: false, data: null });
    expect({ ...missing, message: missing.message }).toEqual({ ...rejected, message: rejected.message });
    expect(bcrypt.compare).toHaveBeenCalledExactlyOnceWith(credentials.password, otherHash);
    expect(fake.manager.update).not.toHaveBeenCalled();
    expect(fake.staff.update).not.toHaveBeenCalled();
  });
  it("rejects two same-email accounts with incorrect passwords without issuing a session", async () => {
    const fake = db([account("MANAGER", { password: otherHash })], [account("STAFF", { password: otherHash })]);
    await expect(login(credentials, fake)).rejects.toMatchObject({ statusCode: 401 });
    expect(bcrypt.compare).toHaveBeenCalledTimes(2);
    expect(fake.manager.update).not.toHaveBeenCalled();
    expect(fake.staff.update).not.toHaveBeenCalled();
  });
  it.each(["ADMIN", "MANAGER", "STAFF"] as const)("reveals a deactivated %s only after the correct password", async role => {
    const inactive = account(role, { isActive: false });
    const fake = role === "STAFF" ? db([], [inactive]) : db([inactive], [account("STAFF")]);
    const wrong = await login({ ...credentials, password: "incorrect" }, fake).catch(error => error);
    expect(wrong).toMatchObject({ statusCode: 401, message: "Invalid email or password" });
    await expect(login(credentials, fake)).rejects.toMatchObject({ statusCode: 403, message: role === "STAFF" ? "Your account has been deactivated" : "Account is deactivated" });
    expect(fake.manager.update).not.toHaveBeenCalled();
    expect(fake.staff.update).not.toHaveBeenCalled();
  });
  it.each([
    null, [], {}, { email: credentials.email }, { password: credentials.password },
    { ...credentials, email: "invalid" }, { ...credentials, email: 1 },
    { ...credentials, password: "" }, { ...credentials, password: 12 },
    { ...credentials, role: "ADMIN" }, { ...credentials, companyId: 2 },
    { ...credentials, accountType: "manager" },
  ])("rejects malformed or extra fields before DB or bcrypt work: %j", async input => {
    const fake = db();
    await expect(login(input, fake)).rejects.toMatchObject({ statusCode: 400, message: "Validation failed" });
    expect(fake.manager.findUnique).not.toHaveBeenCalled();
    expect(fake.staff.findUnique).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
  it("compares passwords as supplied, including spaces", async () => {
    const fake = db([account()]);
    await expect(login({ ...credentials, password: ` ${credentials.password} ` }, fake)).rejects.toMatchObject({ statusCode: 401 });
    expect(bcrypt.compare).toHaveBeenCalledExactlyOnceWith(` ${credentials.password} `, passwordHash);
  });
  it.each(["ADMIN", "MANAGER", "STAFF"] as const)("issues existing token claims and persists the %s refresh token", async role => {
    const user = account(role);
    const fake = role === "STAFF" ? db([], [user]) : db([user]);
    const session = await login(credentials, fake);
    const access = verifySessionToken(session.accessToken, "access");
    const refresh = verifySessionToken(session.refreshToken, "refresh");
    expect(access).toMatchObject({ id: user.id, role, email: user.email, name: user.name, credentialVersion: 3, tokenUse: "access" });
    expect(refresh).toMatchObject({ id: user.id, role, credentialVersion: 3, tokenUse: "refresh", jti: expect.any(String) });
    expect(refresh.exp! - refresh.iat!).toBe(role === "STAFF" ? 30 * 86400 : 7 * 86400);
    expect((role === "STAFF" ? fake.staff : fake.manager).update).toHaveBeenCalledWith({ where: { id: user.id }, data: { refreshToken: session.refreshToken } });
    expect(session.user).not.toHaveProperty("password");
    expect(session.user).not.toHaveProperty("credentialVersion");
    expect(session.user).not.toHaveProperty("isActive");
  });
  it("propagates lookup failures without attempting to authenticate another account", async () => {
    const fake = db();
    fake.manager.findUnique.mockRejectedValueOnce(new Error("synthetic read failure"));
    await expect(login(credentials, fake)).rejects.toThrow("synthetic read failure");
    expect(fake.staff.findUnique).not.toHaveBeenCalled();
  });
});

describe("POST /common/login", () => {
  it.each(["ADMIN", "MANAGER", "STAFF"] as const)("returns the existing %s login response and cookie options", async role => {
    const user = account(role);
    useRouteDb(role === "STAFF" ? [] : [user], role === "STAFF" ? [user] : []);
    const result = await post(credentials);
    expect(result.status).toBe(200);
    expect(result.headers.get("cache-control")).toContain("no-store");
    const cookies = result.headers.getSetCookie();
    const options = getCookieOptions();
    expect(options).toEqual({ httpOnly: true, secure: true, path: "/", sameSite: "none" });
    expect(cookies).toHaveLength(2);
    for (const cookie of cookies) {
      expect(cookie).toContain("HttpOnly"); expect(cookie).toContain("Secure");
      expect(cookie).toContain("Path=/"); expect(cookie).toContain("SameSite=None");
    }
    const access = cookies.find(value => value.startsWith("accessToken="))!.split(";")[0]!.slice("accessToken=".length);
    const refresh = cookies.find(value => value.startsWith("refreshToken="))!.split(";")[0]!.slice("refreshToken=".length);
    const payload = await result.json();
    expect(payload).toEqual({ statusCode: 200, success: true, message: "Login successful", data: {
      id: user.id, name: user.name, email: user.email, role, companyId: user.companyId,
      ...(role === "STAFF" ? { locationId: 9, accessToken: access, refreshToken: refresh } : {}),
    } });
    expect(verifySessionToken(access, "access").role).toBe(role);
    expect(database[role === "STAFF" ? "staff" : "manager"].update).toHaveBeenCalledWith({ where: { id: user.id }, data: { refreshToken: refresh } });
  });
  it("returns identical public errors for unknown email and incorrect password without cookies", async () => {
    const missing = await post(credentials);
    useRouteDb([account("MANAGER", { password: otherHash })]);
    const wrong = await post(credentials);
    expect(missing.status).toBe(401); expect(wrong.status).toBe(401);
    expect(await missing.json()).toEqual(await wrong.json());
    expect(missing.headers.getSetCookie()).toEqual([]); expect(wrong.headers.getSetCookie()).toEqual([]);
    expect(bcrypt.compare).toHaveBeenCalledTimes(2);
  });
  it("does not issue cookies or a success response when session persistence fails", async () => {
    useRouteDb([account()]);
    database.manager.update.mockRejectedValueOnce(new Error("synthetic session write failure"));
    const result = await post(credentials);
    expect(result.status).toBe(500);
    expect(result.headers.getSetCookie()).toEqual([]);
  });
  it("validates the strict public body through the actual route", async () => {
    const result = await post({ ...credentials, role: "ADMIN" });
    expect(result.status).toBe(400);
    expect(database.manager.findUnique).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
  it("applies the shared limiter before validation, database access and bcrypt", async () => {
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    const body = { email: "rate-limited@example.invalid", password: "" };
    for (let i = 0; i < 10; i++) expect((await post(body)).status).toBe(400);
    const result = await post(body);
    expect(result.status).toBe(429);
    expect(Number(result.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(result.headers.get("cache-control")).toContain("no-store");
    expect(await result.json()).toEqual({ success: false, code: "AUTH_RATE_LIMITED", message: "Too many attempts. Try again later." });
    expect(database.manager.findUnique).not.toHaveBeenCalled();
    expect(database.staff.findUnique).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledOnce();
  });
});
