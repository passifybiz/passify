import { createHash } from "node:crypto";
import { db } from "@/lib/db/client";
import { apiKeys, mintConfigs } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { AuthError } from "@/lib/errors";
import { rateLimit } from "@/lib/cache";
import { parseJson } from "@/lib/db/json";
import { API_KEY_PREFIX } from "@/lib/constants";
import { isTestKeyPrefix } from "@/lib/test-mode";

// Public API auth: `Authorization: Bearer <key>`.
// Keys are stored as SHA-256 hashes; the plaintext is shown once at creation.
export function hashApiKey(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export interface AuthenticatedApiKey {
  id: string;
  platformName: string;
  tier: string;
  allowedMints: string[];
  quotaRemaining: number;
  isTest: boolean;
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() ?? null;
}

/**
 * Authenticate an incoming platform request by API key.
 * Returns the key record on success; throws AuthError (401/403/429) otherwise.
 * Side effects: increments current_usage (enforced by rate-limit counter),
 * updates last_used_at.
 */
export async function authenticateApiKey(req: Request): Promise<AuthenticatedApiKey> {
  const token = getBearerToken(req);
  if (!token || !token.startsWith(API_KEY_PREFIX)) {
    throw new AuthError(401, "missing_api_key", "Missing or malformed API key.");
  }
  const hash = hashApiKey(token);

  const key = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, hash), eq(apiKeys.isActive, true)),
  });
  if (!key) {
    throw new AuthError(401, "invalid_api_key", "API key is invalid or revoked.");
  }

  // Monthly quota is a fixed-window counter keyed by key + calendar month.
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { ok, remaining } = await rateLimit(`quota:${key.id}:${month}`, key.monthlyLimit, 60 * 60 * 24 * 31);
  if (!ok) {
    throw new AuthError(429, "quota_exceeded", "Monthly attestation quota exceeded.");
  }

  // Best-effort usage + last-used update. Don't fail the request if it errors.
  db.update(apiKeys)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(apiKeys.id, key.id))
    .execute()
    .catch((err: unknown) => console.error("[api-key] failed to update lastUsedAt", err));

  return {
    id: key.id,
    platformName: key.platformName,
    tier: key.tier,
    allowedMints: parseJson<string[]>(key.allowedMints) ?? [],
    quotaRemaining: remaining,
    isTest: isTestKeyPrefix(key.keyPrefix),
  };
}

/** Resolve a mint_config slug to its row, enforcing the API key's allowed_mints. */
export async function resolveAllowedMint(slug: string, key: AuthenticatedApiKey) {
  const config = await db.query.mintConfigs.findFirst({ where: eq(mintConfigs.slug, slug) });
  if (!config) {
    throw new AuthError(404, "mint_config_not_found", `No mint config for slug "${slug}".`);
  }
  if (key.tier !== "enterprise" && !key.allowedMints.includes(slug)) {
    throw new AuthError(403, "mint_not_allowed", `This API key is not allowed to access "${slug}".`);
  }
  return config;
}

/** Standard JSON error response shape, matching the PRD error examples. */
export function errorResponse(status: number, code: string, detail?: string): Response {
  return Response.json({ error: code, ...(detail ? { detail } : {}) }, { status });
}
