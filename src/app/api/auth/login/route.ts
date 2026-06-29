import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { accounts } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/cache";
import { loginSchema, validateOr } from "@/lib/validation";
import { readLimitedJson } from "@/lib/body-limit";
import { handleApiError } from "@/lib/errors";
import { LOGIN_RATE_LIMIT } from "@/lib/constants";
import { isAccountLocked, trackFailedLogin, clearFailedLogins, logSecurityEvent } from "@/lib/auth/security-events";

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown").split(",")[0].trim();
    const { ok } = await rateLimit(`login:${ip}`, LOGIN_RATE_LIMIT.max, LOGIN_RATE_LIMIT.windowSeconds);
    if (!ok) {
      return NextResponse.json({ error: "rate_limited", detail: "Too many attempts. Try again later." }, { status: 429 });
    }

    const body = await readLimitedJson(req);
    const { data, errorResponse } = validateOr(loginSchema, body);
    if (errorResponse) return errorResponse;

    const email = data!.email.toLowerCase();

    // Check account lockout
    if (await isAccountLocked(email)) {
      return NextResponse.json({ error: "account_locked", detail: "Account temporarily locked. Try again in 15 minutes." }, { status: 423 });
    }

    const account = await db.query.accounts.findFirst({ where: eq(accounts.email, email) });
    if (!account) {
      await trackFailedLogin(email, ip);
      return NextResponse.json({ error: "invalid_credentials", detail: "Invalid credentials." }, { status: 401 });
    }

    const valid = await verifyPassword(data!.password, account.passwordHash);
    if (!valid) {
      await trackFailedLogin(email, ip);
      return NextResponse.json({ error: "invalid_credentials", detail: "Invalid credentials." }, { status: 401 });
    }

    await clearFailedLogins(email);
    await createSession({ sub: account.id, email: account.email, name: account.name, role: account.role });
    logSecurityEvent("login_success", { email, ip });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
