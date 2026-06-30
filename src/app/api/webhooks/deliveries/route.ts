import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { webhookDeliveries } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const rows = await db
      .select()
      .from(webhookDeliveries)
      .orderBy(sql`${webhookDeliveries.createdAt} desc`)
      .limit(100);
    return NextResponse.json(rows);
  } catch (e) {
    return handleApiError(e);
  }
}
