import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { webhooks, verifySignature } from "./webhooks";

const SECRET = "whsec_sdk_test";
const PAYLOAD = JSON.stringify({ id: "evt_42", type: "rule.updated", data: { mint_config: "x" } });

function header(secret: string, payload: string, t: number): string {
  const v1 = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return `t=${t},v1=${v1}`;
}

describe("SDK webhooks.verifySignature", () => {
  it("verifies a valid signature (interop with HMAC-SHA256)", async () => {
    const t = 1_000_000;
    const ok = await verifySignature({ secret: SECRET, payload: PAYLOAD, signature: header(SECRET, PAYLOAD, t), now: t });
    expect(ok).toBe(true);
  });

  it("is exposed on the webhooks namespace", async () => {
    const t = 1_000_000;
    const ok = await webhooks.verifySignature({ secret: SECRET, payload: PAYLOAD, signature: header(SECRET, PAYLOAD, t), now: t });
    expect(ok).toBe(true);
  });

  it("rejects a wrong secret", async () => {
    const t = 1_000_000;
    const ok = await verifySignature({ secret: "whsec_wrong", payload: PAYLOAD, signature: header(SECRET, PAYLOAD, t), now: t });
    expect(ok).toBe(false);
  });

  it("rejects a tampered payload", async () => {
    const t = 1_000_000;
    const ok = await verifySignature({ secret: SECRET, payload: PAYLOAD + "x", signature: header(SECRET, PAYLOAD, t), now: t });
    expect(ok).toBe(false);
  });

  it("rejects timestamp drift (replay protection)", async () => {
    const t = 1_000_000;
    const ok = await verifySignature({ secret: SECRET, payload: PAYLOAD, signature: header(SECRET, PAYLOAD, t), now: t + 600, toleranceSeconds: 300 });
    expect(ok).toBe(false);
  });

  it("rejects malformed or missing signatures", async () => {
    expect(await verifySignature({ secret: SECRET, payload: PAYLOAD, signature: null })).toBe(false);
    expect(await verifySignature({ secret: SECRET, payload: PAYLOAD, signature: "garbage" })).toBe(false);
  });

  it("is idempotent — verifying the same delivery twice yields the same result", async () => {
    const t = 1_000_000;
    const sig = header(SECRET, PAYLOAD, t);
    const a = await verifySignature({ secret: SECRET, payload: PAYLOAD, signature: sig, now: t });
    const b = await verifySignature({ secret: SECRET, payload: PAYLOAD, signature: sig, now: t });
    expect(a).toBe(true);
    expect(b).toBe(true);
  });
});
