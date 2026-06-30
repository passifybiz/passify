import { buildSignatureHeader, nowSeconds, SIGNATURE_HEADER } from "./signing";
import { isDeliverySuccess } from "./retry";

export interface DeliveryTarget {
  url: string;
  secret: string;
}

export interface DeliveryEvent {
  id: string;
  type: string;
  payload: unknown;
  createdAt?: string;
}

export interface AttemptResult {
  ok: boolean;
  status: number | null;
  error?: string;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/** Serialize the canonical webhook body sent to subscribers. */
export function buildDeliveryBody(event: DeliveryEvent): string {
  return JSON.stringify({
    id: event.id,
    type: event.type,
    created_at: event.createdAt ?? new Date().toISOString(),
    data: event.payload,
  });
}

/**
 * Make one HTTP delivery attempt. Signs the body, sets identifying headers, and
 * enforces a timeout. Pure with respect to the database — callers persist the
 * result. `fetchImpl` is injectable for tests.
 */
export async function attemptDelivery(
  target: DeliveryTarget,
  event: DeliveryEvent,
  opts: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<AttemptResult> {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const rawBody = buildDeliveryBody(event);
  const ts = nowSeconds();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetchImpl(target.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Passify-Webhooks/1.0",
        [SIGNATURE_HEADER]: buildSignatureHeader(target.secret, rawBody, ts),
        "Passify-Event-Id": event.id,
        "Passify-Event-Type": event.type,
        "Passify-Timestamp": String(ts),
      },
      body: rawBody,
      signal: controller.signal,
    });
    return { ok: isDeliverySuccess(res.status), status: res.status };
  } catch (err) {
    return { ok: false, status: null, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}
