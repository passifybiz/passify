import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { webhookEndpoints } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes, randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth/session";
import { requireWriteAccess } from "@/lib/auth/rbac";
import { createWebhookSchema, patchWebhookSchema, deleteWebhookSchema, validateOr } from "@/lib/validation";
import { isWebhookEventType } from "@/lib/webhooks/events";
import { generateSigningSecret } from "@/lib/webhooks/signing";
import { readLimitedJson } from "@/lib/body-limit";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

function newSecret(): string {
  return generateSigningSecret(randomBytes(24).toString("hex"));
}

function validateEvents(events: string[]): string | null {
  for (const e of events) {
    if (e !== "*" && !isWebhookEventType(e)) return `Unknown event type: ${e}`;
  }
  return null;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db.select().from(webhookEndpoints).orderBy(webhookEndpoints.createdAt);
  // Never return the signing secret in list responses.
  const safe = rows.map((row: Record<string, unknown>) => {
    const { secret, ...rest } = row as { secret: string } & Record<string, unknown>;
    return { ...rest, secretSet: !!secret };
  });
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const { errorResponse: authError } = await requireWriteAccess();
  if (authError) return authError;
  try {
    const body = await readLimitedJson(req);
    const { data, errorResponse } = validateOr(createWebhookSchema, body);
    if (errorResponse) return errorResponse;

    const eventError = validateEvents(data!.events);
    if (eventError) return NextResponse.json({ error: "validation_error", detail: eventError }, { status: 400 });

    const secret = newSecret();
    const [row] = await db.insert(webhookEndpoints).values({
      id: randomUUID(),
      url: data!.url,
      secret,
      description: data!.description ?? null,
      events: JSON.stringify(data!.events),
      isActive: true,
    }).returning();

    logger.info("webhook_endpoint_created", { id: row.id, url: data!.url });
    // Show the signing secret once, at creation.
    return NextResponse.json({ id: row.id, secret });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  const { errorResponse: authError } = await requireWriteAccess();
  if (authError) return authError;
  try {
    const body = await readLimitedJson(req);
    const { data, errorResponse } = validateOr(patchWebhookSchema, body);
    if (errorResponse) return errorResponse;

    const existing = await db.query.webhookEndpoints.findFirst({ where: eq(webhookEndpoints.id, data!.id) });
    if (!existing) return NextResponse.json({ error: "not_found", detail: "Endpoint not found." }, { status: 404 });

    const patch: Record<string, unknown> = {};
    if (typeof data!.isActive === "boolean") patch.isActive = data!.isActive;
    if (data!.events) {
      const eventError = validateEvents(data!.events);
      if (eventError) return NextResponse.json({ error: "validation_error", detail: eventError }, { status: 400 });
      patch.events = JSON.stringify(data!.events);
    }

    let rotatedSecret: string | undefined;
    if (data!.rotateSecret) {
      rotatedSecret = newSecret();
      patch.secret = rotatedSecret;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "validation_error", detail: "No changes provided." }, { status: 400 });
    }

    await db.update(webhookEndpoints).set(patch).where(eq(webhookEndpoints.id, data!.id));
    logger.info("webhook_endpoint_updated", { id: data!.id, rotated: !!rotatedSecret });
    return NextResponse.json(rotatedSecret ? { ok: true, secret: rotatedSecret } : { ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  const { errorResponse: authError } = await requireWriteAccess();
  if (authError) return authError;
  try {
    const body = await readLimitedJson(req);
    const { data, errorResponse } = validateOr(deleteWebhookSchema, body);
    if (errorResponse) return errorResponse;
    await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, data!.id));
    logger.info("webhook_endpoint_deleted", { id: data!.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
