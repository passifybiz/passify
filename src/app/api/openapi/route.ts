import { NextResponse } from "next/server";
import { openapiSpec } from "@/lib/openapi";

/**
 * Machine-readable OpenAPI 3.1 document for the public API.
 * Served as JSON; the same spec is published as `openapi.yaml`.
 */
export function GET() {
  return NextResponse.json(openapiSpec, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
