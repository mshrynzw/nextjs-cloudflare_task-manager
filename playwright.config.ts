import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "./lib/db/seed";

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;
const e2eDbPath = path.join(process.cwd(), ".data", "e2e.sqlite");
const e2eDistDir = ".next-e2e";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Use production server + separate distDir so local `pnpm dev` can keep running.
    command: `pnpm exec tsx scripts/seed-e2e.ts && pnpm exec next build && pnpm exec next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      ...process.env,
      SQLITE_DB_PATH: e2eDbPath,
      NEXT_DIST_DIR: e2eDistDir,
      AUTH_SECRET:
        process.env.AUTH_SECRET ?? "playwright-dev-secret-at-least-32-chars!!",
      AUTH_EMAIL_ENABLED: "true",
      AUTH_URL: baseURL,
      NEXT_PUBLIC_APP_URL: baseURL,
      E2E_USER_EMAIL: DEMO_USER_EMAIL,
      E2E_USER_PASSWORD: DEMO_USER_PASSWORD,
    },
  },
});
