/**
 * A structured error thrown by the SDK for any non-2xx response. Mirrors the
 * API's single error shape: `{ error, detail?, request_id? }`.
 */
export class PassifyError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail?: string;
  readonly requestId?: string;

  constructor(status: number, code: string, detail?: string, requestId?: string) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "PassifyError";
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.requestId = requestId;
  }

  /** True for 401/403 auth/authorization failures. */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** True for 429 quota/rate-limit responses. */
  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

export function errorFromResponse(status: number, body: unknown): PassifyError {
  const b = (body ?? {}) as { error?: string; detail?: string; request_id?: string };
  return new PassifyError(status, b.error ?? `http_${status}`, b.detail, b.request_id);
}
