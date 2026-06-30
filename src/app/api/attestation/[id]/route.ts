import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { attestations, attestationReads, apiKeys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authenticateApiKey, errorResponse } from "@/lib/auth/api-key";
import { handleApiError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const key = await authenticateApiKey(req);
    const { id } = await params;

    if (key.isTest) {
      const { testAttestation } = await import("@/lib/test-mode");
      return NextResponse.json(testAttestation(id));
    }

    const att = await db.query.attestations.findFirst({
      where: eq(attestations.attestationId, id),
    });

    if (!att) {
      return NextResponse.json({ error: "not_found", detail: "Attestation not found." }, { status: 404 });
    }

    const { randomUUID } = await import("node:crypto");
    await db.insert(attestationReads).values({
      id: randomUUID(),
      attestationId: id,
      apiKeyId: key.id,
    });

    return NextResponse.json({
      attestation_id: att.attestationId,
      schema: att.schemaId,
      user_pubkey: att.userPubkey,
      status: String(att.expiresAt) > new Date().toISOString() ? "verified" : "expired",
      issued_at: String(att.createdAt),
      expires_at: String(att.expiresAt),
      onchain_tx: att.onchainTx,
      data_hash: att.dataHash,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
