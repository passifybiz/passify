// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";

describe("Environment validation", () => {
  it("validates SESSION_SECRET presence", async () => {
    const original = process.env.SESSION_SECRET;
    delete process.env.SESSION_SECRET;
    const { validateEnv } = await import("@/lib/env");
    const { ok, errors } = validateEnv();
    expect(ok).toBe(false);
    expect(errors.some((e: string) => e.includes("SESSION_SECRET"))).toBe(true);
    process.env.SESSION_SECRET = original;
  });
});

describe("API key hashing", () => {
  it("produces consistent SHA-256 hash", () => {
    const hash = (s: string) => createHash("sha256").update(s).digest("hex");
    const h1 = hash("passify_test123");
    const h2 = hash("passify_test123");
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it("produces different hashes for different keys", () => {
    const hash = (s: string) => createHash("sha256").update(s).digest("hex");
    expect(hash("passify_key_a")).not.toBe(hash("passify_key_b"));
  });
});
