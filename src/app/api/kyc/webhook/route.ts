import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { kycSessions, attestations, auditLog } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createHash, randomUUID } from "node:crypto";
import { getKycProvider, getAttestationWriter } from "@/lib/providers/factory";
import { readLimitedJson } from "@/lib/body-limit";
import { handleApiError } from "@/lib/errors";
import { cache } from "@/lib/cache";
import { ATTESTATION_EXPIRY_DAYS, BODY_LIMIT_WEBHOOK } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Rate limit webhook endpoint to prevent abuse
    const { rateLimit } = await import("@/lib/cache");
    const ip = (req.headers.get("x-forwarded-for") ?? "webhook").split(",")[0].trim();
    const { ok } = await rateLimit(`webhook:${ip}`, 60, 60); // 60 requests/minute
    if (!ok) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const rawBody = await req.text();
    if (rawBody.length > BODY_LIMIT_WEBHOOK) {
      return NextResponse.json({ error: "body_too_large", detail: "Request body too large." }, { status: 413 });
    }
    const signature = req.headers.get("x-blockpass-signature") ?? req.headers.get("x-signature") ?? "";

    const provider = await getKycProvider();
    const valid = await provider.verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      return NextResponse.json({ error: "invalid_signature", detail: "Invalid webhook signature." }, { status: 401 });
    }

    let body: unknown;
    try { body = JSON.parse(rawBody); } catch { body = {}; }
    const payload = provider.parseWebhook(body);

    if (!payload.externalSessionId) {
      return NextResponse.json({ error: "validation_error", detail: "Missing session ID in webhook payload." }, { status: 400 });
    }

    // Idempotency: reject duplicate webhook deliveries for the same session
    const idempotencyKey = `webhook_lock:${payload.externalSessionId}`;
    const alreadyProcessing = await cache.get(idempotencyKey);
    if (alreadyProcessing) {
      return NextResponse.json({ status: "already_processing" });
    }
    await cache.set(idempotencyKey, "1", 60); // 60s lock

    const session = await db.query.kycSessions.findFirst({
      where: and(eq(kycSessions.externalSessionId, payload.externalSessionId)),
    });
    if (!session) {
      return NextResponse.json({ error: "not_found", detail: "Session not found." }, { status: 404 });
    }

    if (session.status === "approved") {
      return NextResponse.json({ status: "already_approved" });
    }

    if (payload.status !== "approved") {
      await db.update(kycSessions)
        .set({ status: payload.status, completedAt: new Date().toISOString() })
        .where(eq(kycSessions.id, session.id));
      return NextResponse.json({ status: payload.status });
    }

    const dataHash = createHash("sha256").update(payload.raw).digest("hex");
    const schemaId = session.schemaId ?? "kyc_individual_v1";
    const expiration = new Date(Date.now() + ATTESTATION_EXPIRY_DAYS * 86_400_000);

    const writer = await getAttestationWriter();
    const onchain = await writer.writeAttestation({
      userPubkey: session.userPubkey,
      schemaId,
      dataHash,
      expiration,
    });

    const attestationId = `att_${Date.now().toString(36)}_${dataHash.slice(0, 4)}`;

    const { Keypair, PublicKey } = await import("@solana/web3.js");
    let attesterPubkey: string;
    try {
      const b58 = process.env.ATTESTER_KEYPAIR_BASE58;
      attesterPubkey = b58
        ? Keypair.fromSecretKey(Buffer.from(b58, "base64")).publicKey.toBase58()
        : "00000000000000000000000000000000000000000000";
    } catch {
      attesterPubkey = "00000000000000000000000000000000000000000000";
    }

    const now = new Date().toISOString();

    await db.insert(attestations).values({
      id: randomUUID(),
      attestationId,
      sessionId: session.id,
      userPubkey: session.userPubkey,
      schemaId,
      dataHash,
      attesterPubkey,
      onchainTx: onchain.txSignature,
      onchainAccount: onchain.onchainAccount,
      jurisdiction: payload.jurisdiction ?? null,
      expiresAt: expiration.toISOString(),
    });

    await db.update(kycSessions)
      .set({ status: "approved", completedAt: now })
      .where(eq(kycSessions.id, session.id));

    await db.insert(auditLog).values({
      actor: "system",
      action: "attestation_issued",
      entityType: "attestation",
      entityId: session.id,
      newValue: JSON.stringify({ attestationId, userPubkey: session.userPubkey }),
    });

    return NextResponse.json({ status: "approved", attestation_id: attestationId });
  } catch (e) {
    return handleApiError(e);
  }
}
