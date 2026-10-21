import { defineConfig, devices } from "@playwright/test";
if (process.env.HYGENE_E2E_MANAGED !== "true")
  throw new Error(
    "Run npm run test:e2e with the explicit isolated bootstrap; do not attach to an existing application.",
  );
const backend = process.env.HYGENE_E2E_BACKEND_ORIGIN!;
const web = process.env.HYGENE_E2E_WEB_ORIGIN!;
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 20000,
  reporter: [["list"], ["json", { outputFile: "e2e/.artifacts/results.json" }]],
  outputDir: "e2e/.artifacts/failures",
  use: {
    baseURL: web,
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    launchOptions: {
      ...(process.env.HYGENE_E2E_BROWSER_PATH
        ? { executablePath: process.env.HYGENE_E2E_BROWSER_PATH }
        : {}),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  webServer: [
    {
      command: "node dist/app.js",
      cwd: "../backend",
      url: backend + "/api/support/contact",
      reuseExistingServer: false,
      timeout: 20000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${new URL(web).port} --strictPort`,
      url: web + "/help",
      reuseExistingServer: false,
      timeout: 20000,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
