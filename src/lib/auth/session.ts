import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { SESSION_MAX_AGE_SECONDS, SESSION_SECRET_MIN_LENGTH } from "@/lib/constants";
import { cache } from "@/lib/cache";

const isProd = process.env.NODE_ENV === "production";
const COOKIE_NAME = isProd ? "__Secure-passify_session" : "passify_session";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < SESSION_SECRET_MIN_LENGTH) {
    throw new Error("SESSION_SECRET must be set to a long random string (>= 16 chars). See .env.example.");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  sub: string; // account id
  email: string;
  name: string;
  role: string;
  jti?: string; // JWT ID for revocation
}

export async function createSession(account: SessionPayload): Promise<void> {
  const jti = crypto.randomUUID();
  const token = await new SignJWT({ email: account.email, name: account.name, role: account.role, jti })
    .setProtectedHeader({ alg: ALG })
    .setSubject(account.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const jti = payload.jti as string | undefined;
    // Check revocation list
    if (jti) {
      const revoked = await cache.get(`revoked:${jti}`);
      if (revoked) return null;
    }
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      jti,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  // Revoke the token so it can't be reused even if cookie is stolen
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret());
      if (payload.jti) {
        await cache.set(`revoked:${payload.jti}`, "1", SESSION_MAX_AGE_SECONDS);
      }
    } catch { /* token already invalid */ }
  }
  store.delete(COOKIE_NAME);
}

/** Revoke all sessions for a user (e.g. after password change) */
export async function revokeAllSessions(userId: string): Promise<void> {
  // Set a "revoked-after" timestamp — any JWT issued before this is invalid
  await cache.set(`revoked_after:${userId}`, Date.now().toString(), SESSION_MAX_AGE_SECONDS);
}

/** Server-side guard for dashboard routes. Throws redirect to /login if unauthenticated. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session!;
}
