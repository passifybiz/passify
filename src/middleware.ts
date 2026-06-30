import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCorsOrigin } from "@/lib/cors";
import { jwtVerify } from "jose";

const isProd = process.env.NODE_ENV === "production";
const PROTECTED_PATHS = ["/dashboard", "/kyc", "/attestation", "/rules", "/keys", "/webhooks"];

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) return new Uint8Array(0);
  return new TextEncoder().encode(secret);
}

async function isValidSession(token: string): Promise<boolean> {
  try {
    const secret = getSecret();
    if (secret.length === 0) return false;
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  if (pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      const corsOrigin = getCorsOrigin(origin);
      const headers: Record<string, string> = {
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-blockpass-signature, x-signature",
        "Access-Control-Max-Age": "86400",
      };
      if (corsOrigin) headers["Access-Control-Allow-Origin"] = corsOrigin;
      return new NextResponse(null, { status: 204, headers });
    }

    const response = NextResponse.next();
    const corsOrigin = getCorsOrigin(origin);
    if (corsOrigin) {
      response.headers.set("Access-Control-Allow-Origin", corsOrigin);
    }
    return response;
  }

  const sessionCookie =
    request.cookies.get("__Secure-passify_session")?.value ??
    request.cookies.get("passify_session")?.value;

  const validSession = sessionCookie ? await isValidSession(sessionCookie) : false;

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!validSession) {
      const login = new URL("/login", request.url);
      login.searchParams.set("redirect", pathname);
      return NextResponse.redirect(login);
    }
  }

  if (pathname === "/login" && validSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://verify.blockpass.org",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );

  if (isProd) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/kyc/:path*", "/attestation/:path*", "/rules/:path*", "/keys/:path*", "/login", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
