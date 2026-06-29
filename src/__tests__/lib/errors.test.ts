// @vitest-environment node
import { describe, it, expect } from "vitest";
import { AppError, AuthError, ValidationError, NotFoundError, RateLimitError, handleApiError } from "@/lib/errors";

describe("Error classes", () => {
  it("AppError has correct properties", () => {
    const e = new AppError(400, "bad_request", "test", "detail");
    expect(e.statusCode).toBe(400);
    expect(e.code).toBe("bad_request");
    expect(e.message).toBe("test");
    expect(e.detail).toBe("detail");
  });

  it("AuthError extends AppError", () => {
    const e = new AuthError(401, "unauthorized", "nope");
    expect(e).toBeInstanceOf(AppError);
    expect(e.statusCode).toBe(401);
  });

  it("ValidationError defaults to 400", () => {
    const e = new ValidationError("bad input");
    expect(e.statusCode).toBe(400);
    expect(e.code).toBe("validation_error");
  });

  it("NotFoundError defaults to 404", () => {
    const e = new NotFoundError();
    expect(e.statusCode).toBe(404);
  });

  it("RateLimitError defaults to 429", () => {
    const e = new RateLimitError();
    expect(e.statusCode).toBe(429);
  });
});

describe("handleApiError", () => {
  it("handles AppError with correct status", async () => {
    const res = handleApiError(new AuthError(403, "forbidden", "no access"));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("forbidden");
    expect(data.request_id).toBeDefined();
  });

  it("handles unknown errors as 500", async () => {
    const res = handleApiError(new Error("oops"));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("server_error");
    expect(data.request_id).toHaveLength(8);
  });

  it("handles non-Error objects", async () => {
    const res = handleApiError("string error");
    expect(res.status).toBe(500);
  });
});
