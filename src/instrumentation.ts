import { validateEnv } from "@/lib/env";

export function register() {
  const { ok, errors } = validateEnv();
  if (!ok) {
    for (const err of errors) {
      console.error(`[env] ${err}`);
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
    }
    console.warn("[env] Continuing despite validation errors (dev mode).");
  } else if (process.env.NODE_ENV !== "production") {
    console.log("[env] All checks passed.");
  }
}

export async function onShutdown() {
  try {
    const { sql } = await import("@/lib/db/client");
    if (sql) await sql.end({ timeout: 5 });
    // @upstash/redis is stateless (HTTP REST); no disconnect needed
  } catch {
    /* shutdown cleanup is best-effort */
  }
}
