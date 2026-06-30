import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Webhook signing (Stripe-style). The signature header is:
 *
 *   Passify-Signature: t=<unix-seconds>,v1=<hex-hmac-sha256>
 *
 * where the signed payload is `${t}.${rawBody}` and the key is the endpoint's
 * signing secret. Verification recomputes the HMAC, compares in constant time,
 * and rejects timestamps outside a tolerance window (replay protection).
 */
export const DEFAULT_TOLERANCE_SECONDS = 300; // 5 minutes
export const SIGNATURE_HEADER = "Passify-Signature";
export const SECRET_PREFIX = "whsec_";

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function computeSignature(secret: string, rawBody: string, timestamp: number): string {
  return createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

export function buildSignatureHeader(secret: string, rawBody: string, timestamp: number = nowSeconds()): string {
  return `t=${timestamp},v1=${computeSignature(secret, rawBody, timestamp)}`;
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export interface VerifyResult {
  ok: boolean;
  reason?: "malformed_header" | "timestamp_out_of_tolerance" | "signature_mismatch";
}

export function verifySignatureHeader(
  secret: string,
  rawBody: string,
  header: string | null | undefined,
  opts: { toleranceSeconds?: number; now?: number } = {},
): VerifyResult {
  if (!header) return { ok: false, reason: "malformed_header" };
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const idx = kv.indexOf("=");
      return [kv.slice(0, idx).trim(), kv.slice(idx + 1).trim()];
    }),
  );
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) return { ok: false, reason: "malformed_header" };

  const tolerance = opts.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  const now = opts.now ?? nowSeconds();
  if (Math.abs(now - t) > tolerance) return { ok: false, reason: "timestamp_out_of_tolerance" };

  const expected = computeSignature(secret, rawBody, t);
  if (!constantTimeEqualHex(expected, v1)) return { ok: false, reason: "signature_mismatch" };
  return { ok: true };
}

/** Generate a new signing secret. */
export function generateSigningSecret(randomHex: string): string {
  return `${SECRET_PREFIX}${randomHex}`;
}
