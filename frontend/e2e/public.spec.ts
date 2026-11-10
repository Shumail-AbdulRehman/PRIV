import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
for (const path of [
  "/platform/companies",
  "/platform/service",
  "/platform/inquiries",
  "/platform/audit",
])
  test(
    "operator browser boundary stays unavailable: " + path,
    async ({ page }) => {
      let calls = 0;
      page.on("request", (request) => {
        if (request.url().includes("/api/platform/")) calls++;
      });
      await page.goto(path);
      await expect(
        page.getByRole("heading", { name: "Platform operator sign-in" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Continue with identity provider" }),
      ).toBeDisabled();
      expect(calls).toBe(0);
    },
  );
test("actual production bootstrap rejects unsafe config before listener/jobs", () => {
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL("../../backend/dist/app.js", import.meta.url))],
    {
      cwd: process.env.HYGENE_E2E_RUNTIME_DIR!,
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: "0",
        COOKIE_SECURE: "false",
      },
      encoding: "utf8",
      timeout: 15000,
    },
  );
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("Unsafe production configuration");
  expect(result.stdout).not.toContain("Server is listening");
  expect(result.stderr).not.toContain(process.env.ACCESS_TOKEN_SECRET);
});
