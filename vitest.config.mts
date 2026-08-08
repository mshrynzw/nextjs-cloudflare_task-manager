import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    env: {
      AUTH_SECRET: "test-secret-at-least-32-characters-long!!",
      AUTH_EMAIL_ENABLED: "true",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
});
