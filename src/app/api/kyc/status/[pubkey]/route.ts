import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { attestations, attestationReads } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { authenticateApiKey, errorResponse } from "@/lib/auth/api-key";
import { handleApiError } from "@/lib/errors";
import { cache } from "@/lib/cache";
import { randomUUID } from "node:crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pubkey: string }> }
) {
  try {
    const key = await authenticateApiKey(req);
    const { pubkey } = await params;

    // Cache attestation lookups (60s TTL) — hottest path for platforms
    const cacheKey = `att:${pubkey}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      // Still log the read
      await db.insert(attestationReads).values({ id: randomUUID(), attestationId: data.attestation_id, apiKeyId: key.id }).catch(() => {});
      return NextResponse.json(data);
    }

    const att = await db.query.attestations.findFirst({
      where: and(
        eq(attestations.userPubkey, pubkey),
        sql`${attestations.expiresAt} > ${new Date().toISOString()}`
      ),
      orderBy: sql`${attestations.createdAt} desc`,
    });

    if (!att) {
      await cache.set(cacheKey, JSON.stringify({ status: "unverified" }), 30);
      return NextResponse.json({ status: "unverified" });
    }

    const response = {
      status: "verified",
      attestation_id: att.attestationId,
      schema: att.schemaId,
      expires_at: String(att.expiresAt),
      onchain_tx: att.onchainTx,
      issued_by_platform: "passify",
    };

    await cache.set(cacheKey, JSON.stringify(response), 60);
    await db.insert(attestationReads).values({ id: randomUUID(), attestationId: att.attestationId, apiKeyId: key.id }).catch(() => {});

    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
