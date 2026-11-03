import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  test as base,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
const require = createRequire(
  new URL("../../backend/package.json", import.meta.url),
);
const { Client } = require("pg");
export type Fixture = {
  password: string;
  review: { id: number; taskId: number };
  company: Record<string, number>;
  site: Record<string, number>;
  users: Record<string, { id: number; email: string }>;
  staff: Record<string, { id: number; email: string }>;
  attendance: Record<string, number>;
  task: Record<string, number>;
};
export const fixture: Fixture = JSON.parse(
  readFileSync(process.env.HYGENE_E2E_MANIFEST!, "utf8"),
);
export const backend = process.env.HYGENE_E2E_BACKEND_ORIGIN!;
export async function sql(text: string, values: unknown[] = []) {
  const db = new Client({
    connectionString: process.env.HYGENE_E2E_DATABASE_URL,
  });
  await db.connect();
  try {
    return (await db.query(text, values)).rows;
  } finally {
    await db.end();
  }
}
export async function login(request: APIRequestContext, who = "ownerA") {
  const person = fixture.users[who] ?? fixture.staff[who];
  const response = await request.post(
    `${backend}/api/${fixture.users[who] ? "manager/manager-login" : "staff/staff-login"}`,
    { data: { email: person.email, password: fixture.password } },
  );
  expect(response.status()).toBe(200);
}
export async function enter(
  page: Page,
  path: string,
  who = "ownerA",
  language = "en",
) {
  await login(page.request, who);
  await page.addInitScript(
    (value) => localStorage.setItem("hygene-ops.language", value),
    language,
  );
  await page.goto(path);
}
// Credential-bearing flows intentionally do not persist traces, videos, screenshots or auth state.
export const test = base.extend({});
export { expect };
