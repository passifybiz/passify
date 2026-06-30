import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";

/**
 * Idempotency for write endpoints, backed by the existing Redis/cache layer
 * (no new tables, consistent with current infra).
 *
 * Clients send an `Idempotency-Key` header. The first request for a key runs
 * the handler and the final response (status < 500) is cached for 24h keyed by
 * `{scope}:{key}` (scope = API key id, so keys are isolated per integration).
 * A replay returns the stored response with `Idempotent-Replayed: true`. While
 * the first request is in flight, concurrent replays get `409 conflict`.
 *
 * 5xx responses are NOT cached, so a failed write can be safely retried.
 */
const LOCK_TTL_SECONDS = 60;
const RESULT_TTL_SECONDS = 60 * 60 * 24;
const MAX_KEY_LENGTH = 255;

export async function withIdempotency(
  req: Request,
  scope: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  const idemKey = req.headers.get("idempotency-key");
  if (!idemKey) return handler();

  if (idemKey.length > MAX_KEY_LENGTH) {
    return NextResponse.json(
      { error: "invalid_idempotency_key", detail: `Idempotency-Key must be \u2264 ${MAX_KEY_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const cacheKey = `idem:${scope}:${idemKey}`;
  const raw = (await cache.get(cacheKey)) as unknown;
  if (raw) {
    // The in-memory cache returns the stored string; Upstash auto-parses JSON
    // and returns an object. Tolerate both.
    const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as
      | { state: "processing" }
      | { state: "done"; status: number; body: unknown };
    if (parsed.state === "processing") {
      return NextResponse.json(
        { error: "idempotency_conflict", detail: "A request with this Idempotency-Key is already in progress." },
        { status: 409 },
      );
    }
    return NextResponse.json(parsed.body, { status: parsed.status, headers: { "Idempotent-Replayed": "true" } });
  }

  // Acquire a short-lived processing lock.
  await cache.set(cacheKey, JSON.stringify({ state: "processing" }), LOCK_TTL_SECONDS);

  let res: Response;
  try {
    res = await handler();
  } catch (err) {
    // Release the lock (empty string reads as falsy on both backends) and rethrow.
    await cache.set(cacheKey, "", 1);
    throw err;
  }

  if (res.status < 500) {
    const body = await res.clone().json().catch(() => ({}));
    await cache.set(cacheKey, JSON.stringify({ state: "done", status: res.status, body }), RESULT_TTL_SECONDS);
  } else {
    // Don't cache server errors; release the lock so the client can retry.
    await cache.set(cacheKey, "", 1);
  }

  return res;
}
