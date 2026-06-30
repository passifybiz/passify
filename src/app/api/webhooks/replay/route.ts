import { NextRequest, NextResponse } from "next/server";
import { requireWriteAccess } from "@/lib/auth/rbac";
import { replayWebhookSchema, validateOr } from "@/lib/validation";
import { replayDelivery, processDueRetries } from "@/lib/webhooks/dispatch";
import { readLimitedJson } from "@/lib/body-limit";
import { handleApiError } from "@/lib/errors";

/**
 * Re-queue a delivery and immediately attempt it. Manual replay does not depend
 * on the scheduler — it runs inline.
 */
export async function POST(req: NextRequest) {
  const { errorResponse: authError } = await requireWriteAccess();
  if (authError) return authError;
  try {
    const body = await readLimitedJson(req);
    const { data, errorResponse } = validateOr(replayWebhookSchema, body);
    if (errorResponse) return errorResponse;

    const ok = await replayDelivery(data!.deliveryId);
    if (!ok) return NextResponse.json({ error: "not_found", detail: "Delivery not found." }, { status: 404 });

    // Attempt it right away (inline), independent of the cron worker.
    await processDueRetries(1);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
