import { BODY_LIMIT_DEFAULT } from "@/lib/constants";

export async function readLimitedJson(req: Request, maxBytes = BODY_LIMIT_DEFAULT): Promise<unknown> {
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength > maxBytes) {
    throw new BodyLimitError(`Request body exceeds ${maxBytes} byte limit`);
  }

  const text = await req.text();
  if (text.length > maxBytes) {
    throw new BodyLimitError(`Request body exceeds ${maxBytes} byte limit`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new BodyLimitError("Invalid JSON in request body");
  }
}

export class BodyLimitError extends Error {
  public statusCode = 413;
  public code = "body_too_large";
  constructor(message: string) {
    super(message);
    this.name = "BodyLimitError";
  }
}
