// @vitest-environment node
import { describe, it, expect } from "vitest";

describe("Password hashing", () => {
  it("hashes and verifies correctly", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/auth/password");
    const hash = await hashPassword("my-secure-password");
    expect(hash).not.toBe("my-secure-password");
    expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix

    const valid = await verifyPassword("my-secure-password", hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword("wrong-password", hash);
    expect(invalid).toBe(false);
  });

  it("produces different hashes for same input (salt)", async () => {
    const { hashPassword } = await import("@/lib/auth/password");
    const h1 = await hashPassword("test");
    const h2 = await hashPassword("test");
    expect(h1).not.toBe(h2); // bcrypt uses random salt
  });
});
