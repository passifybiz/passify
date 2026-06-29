import { cache } from "@/lib/cache";
import { logger } from "@/lib/logger";

const LOCKOUT_THRESHOLD = 10; // attempts before lockout
const LOCKOUT_DURATION_SECONDS = 900; // 15 minutes

export type SecurityEvent = "login_success" | "login_failed" | "account_locked" | "password_changed" | "session_revoked" | "api_key_created" | "api_key_revoked" | "suspicious_activity";

export function logSecurityEvent(event: SecurityEvent, meta: Record<string, unknown>) {
  logger.info(`[security] ${event}`, { event, ...meta });
}

/** Returns true if the account is currently locked out */
export async function isAccountLocked(email: string): Promise<boolean> {
  const locked = await cache.get(`lockout:${email}`);
  return locked === "1";
}

/** Track a failed login attempt. Returns true if the account is now locked. */
export async function trackFailedLogin(email: string, ip: string): Promise<boolean> {
  const key = `login_failures:${email}`;
  // Simple counter via cache get/set (not atomic, but acceptable for lockout)
  const current = await cache.get(key);
  const count = (parseInt(current ?? "0", 10) || 0) + 1;
  await cache.set(key, String(count), LOCKOUT_DURATION_SECONDS);

  if (count >= LOCKOUT_THRESHOLD) {
    await cache.set(`lockout:${email}`, "1", LOCKOUT_DURATION_SECONDS);
    logSecurityEvent("account_locked", { email, ip, attempts: count });
    return true;
  }
  logSecurityEvent("login_failed", { email, ip, attempts: count });
  return false;
}

/** Reset failure counter on successful login */
export async function clearFailedLogins(email: string): Promise<void> {
  await cache.set(`login_failures:${email}`, "0", 1); // expire immediately
}
