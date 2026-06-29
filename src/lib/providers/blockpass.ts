// Real Blockpass KYC adapter.
// Docs: https://docs.blockpass.org/handshake/kyc-connect
// Implements: session start (handshake), HMAC webhook verification, payload parse.
// Inert without BLOCKPASS_CLIENT_ID / BLOCKPASS_WEBHOOK_SECRET.

import { createHmac, timingSafeEqual } from "node:crypto";
import type { KycProvider, StartSessionInput, StartedSession, WebhookPayload } from "./types";

const BASE = "https://kyc.blockpass.org";

export class BlockpassKycProvider implements KycProvider {
  readonly name = "blockpass";

  private get clientId(): string {
    const id = process.env.BLOCKPASS_CLIENT_ID;
    if (!id) throw new Error("BLOCKPASS_CLIENT_ID is not set (required for PROVIDER=real).");
    return id;
  }

  async startSession({ userPubkey, schemaId }: StartSessionInput): Promise<StartedSession> {
    // Blockpass handshake: server creates a session, returns a redirect URL
    // for the user to complete KYC in Blockpass's hosted UI.
    const externalSessionId = `bp_${userPubkey.slice(0, 8)}_${Date.now().toString(36)}`;
    const sessionUrl = `${BASE}/${this.clientId}/register?session=${externalSessionId}&refId=${userPubkey}&schema=${schemaId}`;
    return { externalSessionId, sessionUrl, providerName: this.name };
  }

  async verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
    const secret = process.env.BLOCKPASS_WEBHOOK_SECRET;
    if (!secret) throw new Error("BLOCKPASS_WEBHOOK_SECRET is not set (required for webhook verification).");
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    if (expected.length !== signature.length) return false;
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  parseWebhook(body: unknown): WebhookPayload {
    const b = (body ?? {}) as Record<string, unknown>;
    // Blockpass sends events with shape:
    //   { event: "kyc-completed", data: { status: "approved", sessionId: "...", identity: {...} } }
    // or flat: { status: "approved", sessionId: "..." }
    const data = (b.data ?? {}) as Record<string, unknown>;
    const eventType = String(b.event ?? "").toLowerCase();
    const nestedStatus = String((data as Record<string, unknown>).status ?? "").toLowerCase();

    // Map Blockpass event types to internal status
    let statusRaw = nestedStatus || String(b.status ?? "").toLowerCase();
    if (!statusRaw && eventType) {
      if (eventType.includes("approved") || eventType.includes("completed")) statusRaw = "approved";
      else if (eventType.includes("rejected") || eventType.includes("denied")) statusRaw = "rejected";
      else statusRaw = "pending";
    }

    const status: WebhookPayload["status"] =
      statusRaw === "approved" ? "approved" : statusRaw === "rejected" ? "rejected" : "pending";

    const sessionId = String(data.sessionId ?? data.session_id ?? b.sessionId ?? b.session_id ?? b.refId ?? "");
    const identity = data.identity ?? b.identity;

    return {
      externalSessionId: sessionId,
      status,
      raw: JSON.stringify(b),
      jurisdiction: (identity as { country?: string } | undefined)?.country,
    };
  }
}
