// Mock providers. Full working UX with zero keys, zero SOL. Generates
// realistic-shaped base58 pubkeys, tx signatures, and PDA accounts so the
// dashboard renders identically to the real path.

import { createHash, randomBytes } from "node:crypto";
import type {
  AttestationWriter,
  BalanceQuery,
  KycProvider,
  StartSessionInput,
  StartedSession,
  TokenService,
  TokenTxResult,
  WebhookPayload,
} from "./types";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function fakeBase58(seed: string, len = 44): string {
  let n = seed;
  let out = "";
  while (out.length < len) {
    n = createHash("sha256").update(n).digest("hex");
    for (const b of n) out += BASE58[b.charCodeAt(0) % BASE58.length];
  }
  return out.slice(0, len);
}

// ── Mock KYC provider (Blockpass-shaped) ─────────────────────
export class MockKycProvider implements KycProvider {
  readonly name = "blockpass";

  async startSession({ userPubkey, schemaId }: StartSessionInput): Promise<StartedSession> {
    const externalSessionId = `bp_mock_${randomBytes(4).toString("hex")}`;
    return {
      externalSessionId,
      sessionUrl: `https://verify.blockpass.org/mock/${externalSessionId}?ref=${userPubkey}&schema=${schemaId}`,
      providerName: this.name,
    };
  }

  // Mock mode trusts the body's declared signature. Real mode checks HMAC.
  async verifyWebhookSignature(_rawBody: string, _signature: string): Promise<boolean> {
    return true;
  }

  parseWebhook(body: unknown): WebhookPayload {
    const b = (body ?? {}) as Record<string, unknown>;
    return {
      externalSessionId: String(b.externalSessionId ?? b.session_id ?? ""),
      status: (b.status as WebhookPayload["status"]) ?? "pending",
      raw: JSON.stringify(b),
      jurisdiction: b.jurisdiction ? String(b.jurisdiction) : undefined,
    };
  }
}

// ── Mock attestation writer ──────────────────────────────────
export class MockAttestationWriter implements AttestationWriter {
  async writeAttestation({ userPubkey, schemaId, dataHash }: { userPubkey: string; schemaId: string; dataHash: string }): Promise<{ txSignature: string; onchainAccount: string }> {
    // Deterministic-ish, realistic-looking onchain artefacts.
    const txSignature = fakeBase58(`tx::${userPubkey}::${schemaId}::${dataHash}`, 88);
    const onchainAccount = fakeBase58(`pda::${userPubkey}::${schemaId}`, 44);
    return { txSignature, onchainAccount };
  }
}

// ── Mock token service ───────────────────────────────────────
// Returns a base64 blob that LOOKS like an unsigned tx (placeholder bytes).
// Real mode builds a genuine Token-2022 instruction via @solana/web3.js.
export class MockTokenService implements TokenService {
  async buildMint({ mintAddress, recipient, amount }: { mintAddress: string; decimals: number; recipient: string; amount: number }): Promise<TokenTxResult> {
    const payload = JSON.stringify({ kind: "mint", mintAddress, recipient, amount });
    return { unsignedTransactionBase64: Buffer.from(`mock::${payload}`).toString("base64") };
  }
  async buildTransfer({ mintAddress, sender, recipient, amount }: { mintAddress: string; decimals: number; sender: string; recipient: string; amount: number }): Promise<TokenTxResult> {
    const payload = JSON.stringify({ kind: "transfer", mintAddress, sender, recipient, amount });
    return { unsignedTransactionBase64: Buffer.from(`mock::${payload}`).toString("base64") };
  }
}

export class MockBalanceQuery implements BalanceQuery {
  async getTokenBalance(userPubkey: string, mintAddress: string) {
    // Deterministic pseudo-balance derived from pubkey+mint.
    const seed = `${userPubkey}::${mintAddress}`;
    const h = createHash("sha256").update(seed).digest();
    const amount = (h[0]! * 65536 + h[1]! * 256 + h[2]!) * 1000;
    return { amount, decimals: 6 };
  }
}
