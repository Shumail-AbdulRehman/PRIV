import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
test("public assistance reaches real backend without a tenant session", async ({
  page,
}) => {
  const response = page.waitForResponse((r) =>
    r.url().endsWith("/api/support/contact"),
  );
  await page.goto("/help");
  expect((await response).status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Help & service information" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Support contact is unavailable. No delivery channel has been qualified.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Approved document unavailable")).toHaveCount(3);
  await expect(page.getByText(/New purchases are unavailable/)).toBeVisible();
});
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
        page.getByRole("heading", { name: "Platform sign in" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Continue with identity provider" }),
      ).toBeDisabled();
      expect(calls).toBe(0);
    },
  );
for (const width of [390, 1440])
  test(`public Urdu/RTL and keyboard assistance at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.addInitScript(() =>
      localStorage.setItem("hygene-ops.language", "ur"),
    );
    await page.goto("/help");
    await expect(
      page.getByRole("heading", { name: "مدد اور سروس کی معلومات" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const recovery = page.getByRole("link", {
      name: "مالک کا اکاؤنٹ بحال کریں",
    });
    await recovery.focus();
    await expect(recovery).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/recover-owner-account/);
  });
test("actual production bootstrap rejects unsafe config before listener/jobs", () => {
  const result = spawnSync(process.execPath, ["dist/app.js"], {
    cwd: fileURLToPath(new URL("../../backend/", import.meta.url)),
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: "0",
      COOKIE_SECURE: "false",
    },
    encoding: "utf8",
    timeout: 15000,
  });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("Unsafe production configuration");
  expect(result.stdout).not.toContain("Server is listening");
  expect(result.stderr).not.toContain(process.env.ACCESS_TOKEN_SECRET);
});
