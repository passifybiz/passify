import { createHash } from "node:crypto";

/**
 * Test mode (developer sandbox).
 *
 * Test mode is encoded in the API key prefix (`passify_test_...`) rather than a
 * schema column, so it requires no migration. When an authenticated key is in
 * test mode, the public endpoints return **deterministic, clearly-marked**
 * responses synthesized from the request inputs — no mainnet, no KYC provider,
 * no database writes, and no contact with real attestation data. This lets a
 * developer build the full integration before going live.
 */

export const TEST_KEY_PREFIX = "passify_test_";
export const LIVE_KEY_PREFIX = "passify_live_";

export function isTestKeyPrefix(prefix: string | null | undefined): boolean {
  return !!prefix && prefix.startsWith("passify_test");
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function deterministicBase58(seed: string, len: number): string {
  let n = seed;
  let out = "";
  while (out.length < len) {
    n = createHash("sha256").update(n).digest("hex");
    for (const ch of n) out += BASE58[ch.charCodeAt(0) % BASE58.length];
  }
  return out.slice(0, len);
}

/** Fixed, far-future expiry so test attestations never appear expired. */
const TEST_EXPIRY = "2099-01-01T00:00:00.000Z";

function testAttestationId(pubkey: string): string {
  return `att_test_${deterministicBase58(`att::${pubkey}`, 8)}`;
}

export function testKycStatus(pubkey: string) {
  return {
    status: "verified" as const,
    attestation_id: testAttestationId(pubkey),
    schema: "kyc_individual_v1",
    expires_at: TEST_EXPIRY,
    onchain_tx: deterministicBase58(`tx::${pubkey}`, 88),
    issued_by_platform: "Passify",
    test: true,
  };
}

export function testStartSession(pubkey: string, schemaId: string) {
  const sessionId = `test_${deterministicBase58(`sess::${pubkey}::${schemaId}`, 12)}`;
  return {
    session_id: sessionId,
    session_url: `https://passify.biz/sandbox/kyc/${sessionId}`,
    test: true,
  };
}

export function testAttestation(id: string) {
  const pubkey = deterministicBase58(`pub::${id}`, 44);
  return {
    attestation_id: id,
    schema: "kyc_individual_v1",
    user_pubkey: pubkey,
    status: "verified" as const,
    issued_at: "2026-01-01T00:00:00.000Z",
    expires_at: TEST_EXPIRY,
    onchain_tx: deterministicBase58(`tx::${id}`, 88),
    data_hash: createHash("sha256").update(`hash::${id}`).digest("hex"),
    test: true,
  };
}

export function testMintResult(mintConfig: string, amount: number) {
  const payload = JSON.stringify({ kind: "mint", mintConfig, amount, test: true });
  return {
    status: "success" as const,
    unsigned_transaction_base64: Buffer.from(`test::${payload}`).toString("base64"),
    mint: deterministicBase58(`mint::${mintConfig}`, 44),
    amount,
    test: true,
  };
}

export function testTransferResult(mintConfig: string) {
  const payload = JSON.stringify({ kind: "transfer", mintConfig, test: true });
  return {
    status: "success" as const,
    unsigned_transaction_base64: Buffer.from(`test::${payload}`).toString("base64"),
    test: true,
  };
}
