import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:5173";
// E2E_PROD=1 testa o build minificado (vite preview), onde o CSS pode diferir do dev server.
const command = process.env.E2E_PROD
  ? "npm run build && npx vite preview --host 127.0.0.1 --port 5173 --strictPort"
  : "npm run dev -- --host 127.0.0.1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  expect: { timeout: 15_000 },
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1440, height: 1000 },
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: process.env.E2E_PROD ? 180_000 : 30_000,
  },
});
