import { NextResponse } from "next/server";

let Sentry: { captureException?: (e: unknown) => void } | null = null;
try { Sentry = require("@sentry/nextjs"); } catch { /* optional */ }

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public detail?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(statusCode: number, code: string, message: string) {
    super(statusCode, code, message);
    this.name = "AuthError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, detail?: string) {
    super(400, "validation_error", message, detail);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(404, "not_found", message);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Try again later.") {
    super(429, "rate_limited", message);
    this.name = "RateLimitError";
  }
}

type ErrorWithCode = { statusCode?: number; code?: string; message?: string };

export function handleApiError(e: unknown, fallbackMessage = "Internal server error."): NextResponse {
  const requestId = crypto.randomUUID().slice(0, 8);
  const logger = { error: (m: string, meta?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", message: m, requestId, ...meta })) };

  if (e instanceof AppError) {
    return NextResponse.json(
      { error: e.code, ...(e.detail ? { detail: e.detail } : {}), request_id: requestId },
      { status: e.statusCode },
    );
  }

  if (e && typeof e === "object" && "statusCode" in e) {
    const err = e as ErrorWithCode;
    logger.error("api_error", { code: err.code, statusCode: err.statusCode, message: err.message });
    return NextResponse.json(
      { error: err.code ?? "error", ...(err.message ? { detail: err.message } : {}), request_id: requestId },
      { status: err.statusCode ?? 500 },
    );
  }

  logger.error("unhandled_error", { error: String(e), stack: e instanceof Error ? e.stack : undefined });
  Sentry?.captureException?.(e);
  return NextResponse.json({ error: "server_error", detail: fallbackMessage, request_id: requestId }, { status: 500 });
}
