import { describe, it, expect, vi } from "vitest";
import {
  buildSignatureHeader,
  computeSignature,
  verifySignatureHeader,
  nowSeconds,
  generateSigningSecret,
} from "@/lib/webhooks/signing";
import { subscriptionMatches, isWebhookEventType } from "@/lib/webhooks/events";
import { backoffSeconds, nextRetryAt, canRetry, isDeliverySuccess, MAX_ATTEMPTS } from "@/lib/webhooks/retry";
import { attemptDelivery, buildDeliveryBody } from "@/lib/webhooks/delivery";

const SECRET = "whsec_testsecret";
const BODY = JSON.stringify({ id: "evt_1", type: "attestation.issued", data: { ok: true } });

describe("webhook signing", () => {
  it("verifies a valid signature", () => {
    const t = nowSeconds();
    const header = buildSignatureHeader(SECRET, BODY, t);
    expect(verifySignatureHeader(SECRET, BODY, header, { now: t }).ok).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const t = nowSeconds();
    const header = `t=${t},v1=${"0".repeat(64)}`;
    const res = verifySignatureHeader(SECRET, BODY, header, { now: t });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("signature_mismatch");
  });

  it("rejects a tampered body", () => {
    const t = nowSeconds();
    const header = buildSignatureHeader(SECRET, BODY, t);
    expect(verifySignatureHeader(SECRET, BODY + "x", header, { now: t }).ok).toBe(false);
  });

  it("rejects timestamp drift outside tolerance (replay protection)", () => {
    const t = 1_000_000;
    const header = buildSignatureHeader(SECRET, BODY, t);
    const res = verifySignatureHeader(SECRET, BODY, header, { now: t + 600, toleranceSeconds: 300 });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("timestamp_out_of_tolerance");
  });

  it("rejects a malformed header", () => {
    expect(verifySignatureHeader(SECRET, BODY, null).reason).toBe("malformed_header");
    expect(verifySignatureHeader(SECRET, BODY, "garbage").reason).toBe("malformed_header");
  });

  it("generates prefixed secrets", () => {
    expect(generateSigningSecret("abcd").startsWith("whsec_")).toBe(true);
  });

  it("signature is deterministic for the same inputs", () => {
    expect(computeSignature(SECRET, BODY, 42)).toBe(computeSignature(SECRET, BODY, 42));
  });
});

describe("event filtering", () => {
  it("matches wildcard and exact subscriptions", () => {
    expect(subscriptionMatches(["*"], "attestation.issued")).toBe(true);
    expect(subscriptionMatches(["rule.updated"], "rule.updated")).toBe(true);
    expect(subscriptionMatches(["rule.updated"], "attestation.issued")).toBe(false);
  });
  it("validates known event types", () => {
    expect(isWebhookEventType("attestation.issued")).toBe(true);
    expect(isWebhookEventType("nope")).toBe(false);
  });
});

describe("retry scheduling", () => {
  it("uses capped exponential backoff", () => {
    expect(backoffSeconds(1)).toBe(10);
    expect(backoffSeconds(2)).toBe(20);
    expect(backoffSeconds(3)).toBe(40);
    expect(backoffSeconds(100)).toBe(3600); // capped
  });
  it("schedules next retry until attempts are exhausted", () => {
    const from = new Date("2026-01-01T00:00:00Z");
    expect(nextRetryAt(1, from)?.getTime()).toBe(from.getTime() + 10_000);
    expect(nextRetryAt(MAX_ATTEMPTS, from)).toBeNull();
  });
  it("canRetry and isDeliverySuccess", () => {
    expect(canRetry(0)).toBe(true);
    expect(canRetry(MAX_ATTEMPTS)).toBe(false);
    expect(isDeliverySuccess(200)).toBe(true);
    expect(isDeliverySuccess(204)).toBe(true);
    expect(isDeliverySuccess(500)).toBe(false);
  });
});

describe("delivery attempt", () => {
  const event = { id: "evt_1", type: "attestation.issued", payload: { ok: true } };

  it("signs the request and reports success on 2xx", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const h = init.headers as Record<string, string>;
      expect(h["Passify-Signature"]).toMatch(/^t=\d+,v1=[0-9a-f]{64}$/);
      expect(h["Passify-Event-Id"]).toBe("evt_1");
      // Body is verifiable with the same secret.
      const verify = verifySignatureHeader(SECRET, init.body as string, h["Passify-Signature"]);
      expect(verify.ok).toBe(true);
      return new Response("", { status: 200 });
    });
    const res = await attemptDelivery({ url: "https://x/hook", secret: SECRET }, event, { fetchImpl: fetchMock as unknown as typeof fetch });
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
  });

  it("reports failure on 5xx", async () => {
    const fetchMock = vi.fn(async () => new Response("", { status: 503 }));
    const res = await attemptDelivery({ url: "https://x/hook", secret: SECRET }, event, { fetchImpl: fetchMock as unknown as typeof fetch });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(503);
  });

  it("captures network errors", async () => {
    const fetchMock = vi.fn(async () => { throw new Error("boom"); });
    const res = await attemptDelivery({ url: "https://x/hook", secret: SECRET }, event, { fetchImpl: fetchMock as unknown as typeof fetch });
    expect(res.ok).toBe(false);
    expect(res.status).toBeNull();
    expect(res.error).toContain("boom");
  });

  it("builds a canonical body with id/type/data", () => {
    const body = JSON.parse(buildDeliveryBody(event));
    expect(body.id).toBe("evt_1");
    expect(body.type).toBe("attestation.issued");
    expect(body.data).toEqual({ ok: true });
  });
});
