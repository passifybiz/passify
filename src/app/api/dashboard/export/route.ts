import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { toCsv } from "@/lib/csv";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

/**
 * Export recent audit activity as CSV. Dashboard-authenticated. Exports only
 * real, collected audit-log data — no synthetic metrics.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const rows = (await db
      .select({
        ts: auditLog.createdAt,
        actor: auditLog.actor,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
      })
      .from(auditLog)
      .orderBy(sql`${auditLog.createdAt} desc`)
      .limit(1000)) as { ts: string; actor: string; action: string; entityType: string; entityId: string }[];

    const csv = toCsv(
      ["timestamp", "actor", "action", "entity_type", "entity_id"],
      rows.map((r) => [String(r.ts), r.actor, r.action, r.entityType, r.entityId]),
    );

    const filename = `passify-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
