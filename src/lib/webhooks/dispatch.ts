import { db } from "@/lib/db/client";
import { webhookEndpoints, webhookEvents, webhookDeliveries } from "@/lib/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { parseJson } from "@/lib/db/json";
import { subscriptionMatches } from "./events";
import { attemptDelivery, type DeliveryEvent } from "./delivery";
import { INLINE_ATTEMPTS, MAX_ATTEMPTS, nextRetryAt } from "./retry";
import { logger } from "@/lib/logger";

/**
 * Persist + deliver an event. Creates the event row, fans out to every active,
 * subscribed endpoint, and makes up to INLINE_ATTEMPTS synchronous attempts.
 * Failures are left scheduled (`next_retry_at`) for the cron worker.
 *
 * Best-effort: never throws into the caller's request path.
 */
export async function dispatchWebhookEvent(type: string, payload: unknown): Promise<void> {
  try {
    const eventId = `evt_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`;
    const createdAt = new Date().toISOString();
    await db.insert(webhookEvents).values({ id: eventId, type, payload: JSON.stringify(payload) });

    const endpoints = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.isActive, true));
    const event: DeliveryEvent = { id: eventId, type, payload, createdAt };

    for (const ep of endpoints) {
      const subscribed = parseJson<string[]>(ep.events as unknown as string) ?? [];
      if (!subscriptionMatches(subscribed, type)) continue;

      const deliveryId = randomUUID();
      await db.insert(webhookDeliveries).values({
        id: deliveryId,
        eventId,
        endpointId: ep.id,
        status: "pending",
        attempts: 0,
      });

      await runAttempts(deliveryId, { url: ep.url, secret: ep.secret }, event, INLINE_ATTEMPTS);
    }
  } catch (e) {
    logger.error("webhook_dispatch_error", { error: String(e), type });
  }
}

/** Make up to `maxAttempts` attempts on a delivery, persisting the outcome. */
async function runAttempts(
  deliveryId: string,
  target: { url: string; secret: string },
  event: DeliveryEvent,
  maxAttempts: number,
): Promise<void> {
  const current = await db.query.webhookDeliveries.findFirst({ where: eq(webhookDeliveries.id, deliveryId) });
  let attempts = current?.attempts ?? 0;

  for (let i = 0; i < maxAttempts && attempts < MAX_ATTEMPTS; i++) {
    const result = await attemptDelivery(target, event);
    attempts += 1;
    const lastAttemptAt = new Date().toISOString();

    if (result.ok) {
      await db.update(webhookDeliveries)
        .set({ status: "success", attempts, responseStatus: result.status, error: null, nextRetryAt: null, lastAttemptAt })
        .where(eq(webhookDeliveries.id, deliveryId));
      return;
    }

    const due = nextRetryAt(attempts);
    await db.update(webhookDeliveries)
      .set({
        status: due ? "pending" : "failed",
        attempts,
        responseStatus: result.status ?? null,
        error: result.error ?? `HTTP ${result.status}`,
        nextRetryAt: due ? due.toISOString() : null,
        lastAttemptAt,
      })
      .where(eq(webhookDeliveries.id, deliveryId));

    if (!due) return; // exhausted
  }
}

/**
 * Process deliveries whose retry is due. Invoked by the cron endpoint. Returns
 * the number processed. Requires a scheduler (e.g. Vercel Cron) to run
 * automatically — see WEBHOOKS_IMPLEMENTATION.md.
 */
export async function processDueRetries(limit = 50, now: Date = new Date()): Promise<number> {
  const due = await db
    .select()
    .from(webhookDeliveries)
    .where(and(eq(webhookDeliveries.status, "pending"), lte(webhookDeliveries.nextRetryAt, now.toISOString())))
    .limit(limit);

  let processed = 0;
  for (const d of due) {
    const ep = await db.query.webhookEndpoints.findFirst({ where: eq(webhookEndpoints.id, d.endpointId) });
    if (!ep || !ep.isActive) {
      // Endpoint gone or disabled — stop retrying.
      await db.update(webhookDeliveries).set({ status: "failed", error: "endpoint_disabled", nextRetryAt: null }).where(eq(webhookDeliveries.id, d.id));
      continue;
    }
    const eventRow = await db.query.webhookEvents.findFirst({ where: eq(webhookEvents.id, d.eventId) });
    if (!eventRow) continue;
    const event: DeliveryEvent = { id: eventRow.id, type: eventRow.type, payload: parseJson(eventRow.payload as unknown as string), createdAt: String(eventRow.createdAt) };
    await runAttempts(d.id, { url: ep.url, secret: ep.secret }, event, 1);
    processed += 1;
  }
  return processed;
}

/** Re-queue a delivery for immediate retry (manual replay). */
export async function replayDelivery(deliveryId: string): Promise<boolean> {
  const d = await db.query.webhookDeliveries.findFirst({ where: eq(webhookDeliveries.id, deliveryId) });
  if (!d) return false;
  await db.update(webhookDeliveries)
    .set({ status: "pending", nextRetryAt: new Date().toISOString(), error: null })
    .where(eq(webhookDeliveries.id, deliveryId));
  return true;
}
