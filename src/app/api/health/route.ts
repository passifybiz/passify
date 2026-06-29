import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};
  const start = Date.now();

  try {
    const { db } = await import("@/lib/db/client");
    const { sql } = await import("drizzle-orm");
    await (db as any).execute(sql`SELECT 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  try {
    const { redis } = await import("@/lib/db/redis");
    if (redis) {
      await redis.ping();
      checks.redis = "ok";
    } else {
      checks.redis = process.env.NODE_ENV === "production" ? "error" : "unavailable";
    }
  } catch {
    checks.redis = "error";
  }

  checks.env = process.env.SESSION_SECRET ? "ok" : "error";

  const allOk = Object.values(checks).every((v) => v === "ok");
  const statusCode = allOk ? 200 : 503;

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    version: process.env.npm_package_version ?? "1.0.0",
    uptime: Math.floor(process.uptime()),
    latency_ms: Date.now() - start,
    timestamp: new Date().toISOString(),
    checks,
  }, { status: statusCode });
}
