/**
 * Webhook signature verification for receivers. Uses Web Crypto (`crypto.subtle`),
 * available in Node 18+ and modern browsers, so it has no dependencies.
 *
 * The `Passify-Signature` header has the form `t=<unix>,v1=<hex>`, where the
 * signed payload is `${t}.${rawBody}` and the key is your endpoint's signing
 * secret. Verification recomputes the HMAC, compares in constant time, and
 * rejects timestamps outside the tolerance window (replay protection).
 */
export interface VerifyWebhookParams {
  /** The endpoint's signing secret (whsec_...). */
  secret: string;
  /** The exact raw request body string (do not re-serialize). */
  payload: string;
  /** The value of the `Passify-Signature` header. */
  signature: string | null | undefined;
  /** Allowed clock skew in seconds. Default 300. */
  toleranceSeconds?: number;
  /** Override "now" (unix seconds) for testing. */
  now?: number;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Returns true if the signature is valid and within tolerance. Never throws on
 * malformed input — returns false.
 */
export async function verifySignature(params: VerifyWebhookParams): Promise<boolean> {
  const { secret, payload, signature } = params;
  if (!signature) return false;
  const parts: Record<string, string> = {};
  for (const kv of signature.split(",")) {
    const idx = kv.indexOf("=");
    if (idx === -1) continue;
    parts[kv.slice(0, idx).trim()] = kv.slice(idx + 1).trim();
  }
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) return false;

  const tolerance = params.toleranceSeconds ?? 300;
  const now = params.now ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - t) > tolerance) return false;

  const expected = await hmacHex(secret, `${t}.${payload}`);
  return timingSafeEqual(expected, v1);
}

export const webhooks = { verifySignature };
