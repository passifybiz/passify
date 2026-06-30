import { NextRequest, NextResponse } from "next/server";
import { processDueRetries } from "@/lib/webhooks/dispatch";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled retry worker. Processes webhook deliveries whose `next_retry_at` is
 * due. Intended to be invoked by a scheduler (Vercel Cron) — see vercel.json and
 * WEBHOOKS_IMPLEMENTATION.md. Until a scheduler is configured, background retries
 * do NOT run automatically; this endpoint can also be triggered manually.
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>` (or `?key=<CRON_SECRET>`).
 * Vercel Cron sends the configured secret automatically.
 */
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const auth = req.headers.get("authorization");
      const keyParam = req.nextUrl.searchParams.get("key");
      const provided = auth?.replace(/^Bearer\s+/i, "") ?? keyParam;
      if (provided !== secret) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
      // Fail closed in production if no secret is configured.
      return NextResponse.json({ error: "cron_not_configured", detail: "CRON_SECRET is not set." }, { status: 503 });
    }

    const processed = await processDueRetries(50);
    return NextResponse.json({ ok: true, processed });
  } catch (e) {
    return handleApiError(e);
  }
}
