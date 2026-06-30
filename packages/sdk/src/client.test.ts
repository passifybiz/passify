import { describe, it, expect, vi } from "vitest";
import { Passify } from "./client";
import { PassifyError } from "./errors";

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

const KEY = "passify_test_abc";

describe("Passify SDK", () => {
  it("requires an apiKey", () => {
    // @ts-expect-error intentional
    expect(() => new Passify({})).toThrow(/apiKey/);
  });

  it("sends bearer auth and maps snake_case → camelCase on kyc.start", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
      expect(JSON.parse(init.body as string)).toEqual({ userPubkey: "PUB", schemaId: "kyc_individual_v1" });
      return jsonResponse(200, { session_id: "s1", session_url: "https://x/y" });
    });
    const passify = new Passify({ apiKey: KEY, fetch: fetchMock as unknown as typeof fetch });
    const res = await passify.kyc.start({ userPubkey: "PUB", schemaId: "kyc_individual_v1" });
    expect(res).toEqual({ sessionId: "s1", sessionUrl: "https://x/y" });
  });

  it("maps token.mint camelCase params to snake_case wire body", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect(JSON.parse(init.body as string)).toEqual({ user_pubkey: "PUB", mint_config: "cfg", amount: 100 });
      return jsonResponse(200, { status: "success", unsigned_transaction_base64: "AAA", mint: "MINT", amount: 100 });
    });
    const passify = new Passify({ apiKey: KEY, fetch: fetchMock as unknown as typeof fetch });
    const res = await passify.token.mint({ userPubkey: "PUB", mintConfig: "cfg", amount: 100 });
    expect(res.unsignedTransactionBase64).toBe("AAA");
    expect(res.mint).toBe("MINT");
  });

  it("does not send auth header on health()", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
      return jsonResponse(200, { status: "healthy", version: "1.0.0", uptime: 1, latency_ms: 2, timestamp: "t", checks: { database: "ok" } });
    });
    const passify = new Passify({ apiKey: KEY, fetch: fetchMock as unknown as typeof fetch });
    const res = await passify.health();
    expect(res.status).toBe("healthy");
    expect(res.latencyMs).toBe(2);
  });

  it("throws a typed PassifyError on 4xx and does not retry", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(400, { error: "validation_error", detail: "bad", request_id: "r1" }));
    const passify = new Passify({ apiKey: KEY, fetch: fetchMock as unknown as typeof fetch });
    await expect(passify.kyc.status("PUB")).rejects.toMatchObject({
      name: "PassifyError",
      status: 400,
      code: "validation_error",
      detail: "bad",
      requestId: "r1",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("flags auth and rate-limit errors", async () => {
    const e401 = new PassifyError(401, "invalid_api_key");
    const e429 = new PassifyError(429, "quota_exceeded");
    expect(e401.isAuthError).toBe(true);
    expect(e429.isRateLimited).toBe(true);
  });

  it("retries on 429 then succeeds", async () => {
    let calls = 0;
    const fetchMock = vi.fn(async () => {
      calls++;
      if (calls === 1) return jsonResponse(429, { error: "quota_exceeded" });
      return jsonResponse(200, { status: "unverified" });
    });
    const passify = new Passify({ apiKey: KEY, fetch: fetchMock as unknown as typeof fetch, retryBaseMs: 1 });
    const res = await passify.kyc.status("PUB");
    expect(res.status).toBe("unverified");
    expect(calls).toBe(2);
  });

  it("retries on 5xx up to maxRetries then throws", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(503, { error: "server_error" }));
    const passify = new Passify({ apiKey: KEY, fetch: fetchMock as unknown as typeof fetch, maxRetries: 2, retryBaseMs: 1 });
    await expect(passify.attestations.get("att_1")).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(3); // 1 + 2 retries
  });
});
