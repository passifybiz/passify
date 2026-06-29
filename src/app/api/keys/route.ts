import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { apiKeys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { requireWriteAccess } from "@/lib/auth/rbac";
import { hashApiKey } from "@/lib/auth/api-key";
import { randomBytes, randomUUID } from "node:crypto";
import { createApiKeySchema, patchApiKeySchema, validateOr } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { readLimitedJson } from "@/lib/body-limit";
import { handleApiError } from "@/lib/errors";
import { TIER_LIMITS } from "@/lib/constants";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized", detail: "Authentication required." }, { status: 401 });
  }
  const keys = await db.select().from(apiKeys).orderBy(apiKeys.createdAt);
  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  const { session, errorResponse: authError } = await requireWriteAccess();
  if (authError) return authError;

  try {
    const body = await readLimitedJson(req);
    const { data, errorResponse: validationError } = validateOr(createApiKeySchema, body);
    if (validationError) return validationError;

    const prefix = `passify_live_${randomBytes(3).toString("hex")}`;
    const secret = `${prefix}${randomBytes(20).toString("hex")}`;

    const [key] = await db.insert(apiKeys).values({
      id: randomUUID(),
      platformName: data!.platformName,
      keyHash: hashApiKey(secret),
      keyPrefix: prefix.slice(0, 16),
      tier: data!.tier,
      monthlyLimit: TIER_LIMITS[data!.tier],
      currentUsage: 0,
      isActive: true,
      allowedMints: JSON.stringify(data!.allowedMints),
    }).returning();

    logger.info("api_key_created", { platformName: data!.platformName, tier: data!.tier });

    return NextResponse.json({ id: key.id, plain_key: secret });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  const { session, errorResponse: authError } = await requireWriteAccess();
  if (authError) return authError;

  try {
    const body = await readLimitedJson(req);
    const { data, errorResponse: validationError } = validateOr(patchApiKeySchema, body);
    if (validationError) return validationError;

    const existing = await db.query.apiKeys.findFirst({ where: eq(apiKeys.id, data!.id) });
    if (!existing) {
      return NextResponse.json({ error: "not_found", detail: "API key not found." }, { status: 404 });
    }

    await db.update(apiKeys).set({ isActive: data!.isActive }).where(eq(apiKeys.id, data!.id));

    const { logSecurityEvent } = await import("@/lib/auth/security-events");
    logSecurityEvent(data!.isActive ? "api_key_created" : "api_key_revoked", { keyId: data!.id, actor: session.email });
    logger.info("api_key_updated", { id: data!.id, isActive: data!.isActive, actor: session.email });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
