const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"];
const ALLOWED_METHODS = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"];
const ALLOWED_HEADERS = ["Content-Type", "Authorization", "X-Requested-With", "x-blockpass-signature", "x-signature"];

export function getCorsOrigin(requestOrigin: string | null): string {
  if (!requestOrigin) return "";
  if (ALLOWED_ORIGINS.includes("*")) return "*";
  if (ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
  return "";
}

export function addCorsHeaders(response: Response, origin: string | null): Response {
  const corsOrigin = getCorsOrigin(origin);
  if (corsOrigin) {
    response.headers.set("Access-Control-Allow-Origin", corsOrigin);
    response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS.join(", "));
    response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS.join(", "));
    response.headers.set("Access-Control-Max-Age", "86400");
  }
  return response;
}

export async function handleCors(req: Request): Promise<Response | null> {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    const corsOrigin = getCorsOrigin(origin);
    const headers: Record<string, string> = {
      "Access-Control-Allow-Methods": ALLOWED_METHODS.join(", "),
      "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(", "),
      "Access-Control-Max-Age": "86400",
    };
    if (corsOrigin) headers["Access-Control-Allow-Origin"] = corsOrigin;
    return new Response(null, { status: 204, headers });
  }
  return null;
}
