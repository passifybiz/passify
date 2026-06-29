import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { readLimitedJson } from "@/lib/body-limit";
import { handleApiError, ValidationError, AuthError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthError(401, "unauthorized", "You must be logged in.");
    }

    const body = await readLimitedJson(req) as Record<string, string | undefined>;
    const current = body?.current;
    const password = body?.password;
    const confirm = body?.confirm;

    if (!current || !password || !confirm) {
      throw new ValidationError("All fields are required.");
    }

    if (password.length < 8) {
      throw new ValidationError("New password must be at least 8 characters.");
    }

    if (password !== confirm) {
      throw new ValidationError("Passwords do not match.");
    }

    const account = await db.query.accounts.findFirst({ where: eq(accounts.id, session.sub) });
    if (!account) {
      throw new AuthError(404, "not_found", "Account not found.");
    }

    const valid = await verifyPassword(current, account.passwordHash);
    if (!valid) {
      throw new AuthError(403, "invalid_password", "Current password is incorrect.");
    }

    const newHash = await hashPassword(password);
    await db.update(accounts).set({ passwordHash: newHash }).where(eq(accounts.id, session.sub));

    // Revoke all existing sessions after password change
    const { revokeAllSessions } = await import("@/lib/auth/session");
    await revokeAllSessions(session.sub);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
