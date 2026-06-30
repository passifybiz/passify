import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { webhookEndpoints, webhookDeliveries } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { parseJson } from "@/lib/db/json";
import { WEBHOOK_EVENT_TYPES } from "@/lib/webhooks/events";
import { WebhooksClient, type EndpointRow, type DeliveryRow } from "./client";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  await requireUser();

  let endpoints: EndpointRow[] = [];
  let deliveries: DeliveryRow[] = [];
  let tablesReady = true;

  try {
    const eps = await db.select().from(webhookEndpoints).orderBy(sql`${webhookEndpoints.createdAt} desc`);
    endpoints = eps.map((e: Record<string, unknown>) => ({
      id: String(e.id),
      url: String(e.url),
      description: e.description ? String(e.description) : null,
      events: parseJson<string[]>(e.events as string) ?? [],
      isActive: Boolean(e.isActive),
      createdAt: String(e.createdAt),
    }));
    const dels = await db.select().from(webhookDeliveries).orderBy(sql`${webhookDeliveries.createdAt} desc`).limit(50);
    deliveries = dels.map((d: Record<string, unknown>) => ({
      id: String(d.id),
      eventId: String(d.eventId),
      endpointId: String(d.endpointId),
      status: String(d.status),
      attempts: Number(d.attempts),
      responseStatus: d.responseStatus == null ? null : Number(d.responseStatus),
      error: d.error ? String(d.error) : null,
      createdAt: String(d.createdAt),
    }));
  } catch {
    // Tables not migrated yet in this environment.
    tablesReady = false;
  }

  return (
    <WebhooksClient
      endpoints={endpoints}
      deliveries={deliveries}
      eventTypes={[...WEBHOOK_EVENT_TYPES]}
      tablesReady={tablesReady}
    />
  );
}
