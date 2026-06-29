// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Environment validation", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset module cache to re-run validation
    process.env.SESSION_SECRET = "test-secret-that-is-long-enough-for-testing-123";
    (process.env as any).NODE_ENV = "test";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("passes with valid env", async () => {
    const { validateEnv } = await import("@/lib/env");
    const { ok } = validateEnv();
    expect(ok).toBe(true);
  });

  it("fails without SESSION_SECRET", async () => {
    delete process.env.SESSION_SECRET;
    // Need fresh import
    const mod = await import("@/lib/env");
    const { ok, errors } = mod.validateEnv();
    expect(ok).toBe(false);
    expect(errors.some((e: string) => e.includes("SESSION_SECRET"))).toBe(true);
  });

  it("reports missing real-provider keys when PROVIDER=real", async () => {
    process.env.PROVIDER = "real";
    const { validateEnv } = await import("@/lib/env");
    const { ok, errors } = validateEnv();
    expect(ok).toBe(false);
    expect(errors.some((e: string) => e.includes("HELIUS_API_KEY"))).toBe(true);
  });
});
