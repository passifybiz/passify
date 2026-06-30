import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { kycProviders, kycSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { authenticateApiKey, errorResponse } from "@/lib/auth/api-key";
import { getKycProvider } from "@/lib/providers/factory";
import { kycStartSchema, validateOr } from "@/lib/validation";
import { rateLimit } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { readLimitedJson } from "@/lib/body-limit";
import { handleApiError } from "@/lib/errors";
import { withIdempotency } from "@/lib/idempotency";
import { KYC_START_RATE_LIMIT, KYC_SESSION_EXPIRY_SECONDS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const key = await authenticateApiKey(req);

    return await withIdempotency(req, key.id, async () => {
      const { ok } = await rateLimit(`kyc_start:${key.id}`, KYC_START_RATE_LIMIT.max, KYC_START_RATE_LIMIT.windowSeconds);
      if (!ok) {
        return errorResponse(429, "rate_limited", "Too many KYC starts. Try again later.");
      }

      const body = await readLimitedJson(req);
      const { data, errorResponse: validationError } = validateOr(kycStartSchema, body);
      if (validationError) return validationError;

      if (key.isTest) {
        const { testStartSession } = await import("@/lib/test-mode");
        return NextResponse.json(testStartSession(data!.userPubkey, data!.schemaId));
      }

      const provider = await getKycProvider();
      const started = await provider.startSession({ userPubkey: data!.userPubkey, schemaId: data!.schemaId });

      const providerRow = await db.query.kycProviders.findFirst({ where: eq(kycProviders.name, started.providerName) });
      if (providerRow) {
        await db.insert(kycSessions).values({
          id: randomUUID(),
          externalSessionId: started.externalSessionId,
          providerId: providerRow.id,
          userPubkey: data!.userPubkey,
          schemaId: data!.schemaId,
          status: "pending",
          expiresAt: new Date(Date.now() + KYC_SESSION_EXPIRY_SECONDS * 1000).toISOString(),
        });
      }

      logger.info("kyc_started", { platformId: key.id, pubkey: data!.userPubkey, schemaId: data!.schemaId });

      return NextResponse.json({
        session_id: started.externalSessionId,
        session_url: started.sessionUrl,
      });
    });
  } catch (e) {
    logger.error("kyc_start_error", { error: String(e) });
    return handleApiError(e);
  }
}
