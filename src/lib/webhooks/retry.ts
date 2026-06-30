/**
 * Retry policy for webhook deliveries.
 *
 * Inline attempts happen synchronously at dispatch time. If those are
 * exhausted, the delivery is left `pending` with a `next_retry_at`, and a
 * scheduled worker (cron) picks it up later. Both paths share this policy.
 */
export const MAX_ATTEMPTS = 6;
export const INLINE_ATTEMPTS = 2; // attempts made synchronously before scheduling

/** Exponential backoff (seconds) for the Nth attempt (1-indexed), capped. */
export function backoffSeconds(attempt: number): number {
  const base = 10; // 10s, 20s, 40s, 80s, 160s, ...
  const delay = base * 2 ** Math.max(0, attempt - 1);
  return Math.min(delay, 3600); // cap at 1h
}

/**
 * Given the number of attempts already made, return when the next retry is due,
 * or null if the delivery has exhausted MAX_ATTEMPTS (terminal failure).
 */
export function nextRetryAt(attemptsMade: number, from: Date = new Date()): Date | null {
  if (attemptsMade >= MAX_ATTEMPTS) return null;
  return new Date(from.getTime() + backoffSeconds(attemptsMade) * 1000);
}

/** Whether a delivery with this many attempts may still be retried. */
export function canRetry(attemptsMade: number): boolean {
  return attemptsMade < MAX_ATTEMPTS;
}

/** Should an HTTP response status be treated as a successful delivery? */
export function isDeliverySuccess(status: number): boolean {
  return status >= 200 && status < 300;
}
