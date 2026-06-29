import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    testTimeout: 10000,
    env: {
      NODE_ENV: "test",
      PROVIDER: "mock",
      SESSION_SECRET: "test-secret-that-is-long-enough-123",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
