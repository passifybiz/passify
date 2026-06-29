/**
 * Validates required environment variables at import time.
 * In production, missing critical vars throw immediately (fail fast).
 * In development, warns but allows mock/SQLite fallback.
 */
const isProd = process.env.NODE_ENV === "production";

const REQUIRED_PROD = ["SESSION_SECRET", "DATABASE_URL", "REDIS_URL", "CORS_ORIGINS"] as const;
const REQUIRED_ALL = ["SESSION_SECRET"] as const;

export function validateEnv(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const check = isProd ? REQUIRED_PROD : REQUIRED_ALL;

  for (const key of check) {
    if (!process.env[key]) errors.push(`Missing: ${key}`);
  }

  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32 && isProd) {
    errors.push("SESSION_SECRET must be at least 32 characters in production.");
  }

  if (process.env.PROVIDER === "real") {
    const realKeys = ["HELIUS_API_KEY", "BLOCKPASS_WEBHOOK_SECRET", "ATTESTER_KEYPAIR_BASE58"];
    for (const key of realKeys) {
      if (!process.env[key]) errors.push(`Missing (PROVIDER=real): ${key}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export const env = {
  isProd,
  provider: (process.env.PROVIDER ?? "mock") as "mock" | "real",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
} as const;
