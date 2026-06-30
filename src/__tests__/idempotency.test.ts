import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { withIdempotency } from "@/lib/idempotency";

function reqWith(key?: string): Request {
  const headers = new Headers();
  if (key) headers.set("idempotency-key", key);
  return new Request("https://x/api/v1/token/mint", { method: "POST", headers });
}

// Unique per assertion so the suite is hermetic even against a persistent
// Redis backend (the cache may be real Upstash in CI).
const uniq = () => `test-${randomUUID()}`;

describe("withIdempotency", () => {
  it("does not cache when no Idempotency-Key is present", async () => {
    const handler = vi.fn(async () => NextResponse.json({ n: Math.random() }));
    const scope = uniq();
    await withIdempotency(reqWith(), scope, handler);
    await withIdempotency(reqWith(), scope, handler);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("replays the cached response for the same key and marks it replayed", async () => {
    let calls = 0;
    const handler = vi.fn(async () => NextResponse.json({ id: ++calls }));
    const key = uniq();
    const first = await withIdempotency(reqWith(key), "scopeB", handler);
    const second = await withIdempotency(reqWith(key), "scopeB", handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(second.headers.get("Idempotent-Replayed")).toBe("true");
    expect(await first.clone().json()).toEqual({ id: 1 });
    expect(await second.json()).toEqual({ id: 1 });
  });

  it("isolates keys by scope and by key value", async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));
    const a = uniq();
    await withIdempotency(reqWith(a), `scopeC-${a}`, handler);
    await withIdempotency(reqWith(a), `scopeD-${a}`, handler); // different scope
    await withIdempotency(reqWith(uniq()), `scopeC-${a}`, handler); // different key
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it("does not cache 5xx responses (retry stays possible)", async () => {
    let calls = 0;
    const handler = vi.fn(async () => {
      calls++;
      return calls === 1
        ? NextResponse.json({ error: "server_error" }, { status: 500 })
        : NextResponse.json({ ok: true }, { status: 200 });
    });
    const key = uniq();
    const first = await withIdempotency(reqWith(key), "scopeE", handler);
    expect(first.status).toBe(500);
    const second = await withIdempotency(reqWith(key), "scopeE", handler);
    expect(second.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("rejects an over-long Idempotency-Key", async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));
    const res = await withIdempotency(reqWith("x".repeat(300)), "scopeF", handler);
    expect(res.status).toBe(400);
    expect(handler).not.toHaveBeenCalled();
  });
});
