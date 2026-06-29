// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the cache module
vi.mock("@/lib/cache", () => {
  const store = new Map<string, string>();
  return {
    cache: {
      get: vi.fn(async (key: string) => store.get(key) ?? null),
      set: vi.fn(async (key: string, value: string) => { store.set(key, value); }),
    },
    rateLimit: vi.fn(async () => ({ ok: true, remaining: 5, limit: 10 })),
  };
});

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

describe("Security Events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trackFailedLogin increments counter", async () => {
    const { trackFailedLogin } = await import("@/lib/auth/security-events");
    const { cache } = await import("@/lib/cache");

    const locked = await trackFailedLogin("test@example.com", "1.2.3.4");
    expect(locked).toBe(false);
    expect(cache.set).toHaveBeenCalled();
  });

  it("isAccountLocked returns false when not locked", async () => {
    const { isAccountLocked } = await import("@/lib/auth/security-events");
    const locked = await isAccountLocked("test@example.com");
    expect(locked).toBe(false);
  });

  it("clearFailedLogins resets counter", async () => {
    const { clearFailedLogins } = await import("@/lib/auth/security-events");
    const { cache } = await import("@/lib/cache");

    await clearFailedLogins("test@example.com");
    expect(cache.set).toHaveBeenCalledWith("login_failures:test@example.com", "0", 1);
  });

  it("logSecurityEvent calls logger", async () => {
    const { logSecurityEvent } = await import("@/lib/auth/security-events");
    const { logger } = await import("@/lib/logger");

    logSecurityEvent("login_success", { email: "test@test.com", ip: "1.1.1.1" });
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("login_success"),
      expect.objectContaining({ event: "login_success", email: "test@test.com" }),
    );
  });
});
