import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { openapiSpec, OPENAPI_VERSION } from "@/lib/openapi";
import { SCHEMA_IDS } from "@/lib/schemas/registry";
import { kycStartSchema, tokenMintSchema, tokenTransferSchema } from "@/lib/validation";

// Map each documented path+method to the route file that implements it.
const ROUTE_FILES: Record<string, string> = {
  "GET /health": "src/app/api/health/route.ts",
  "POST /kyc/start": "src/app/api/kyc/start/route.ts",
  "GET /kyc/status/{pubkey}": "src/app/api/kyc/status/[pubkey]/route.ts",
  "POST /kyc/webhook": "src/app/api/kyc/webhook/route.ts",
  "GET /attestation/{id}": "src/app/api/attestation/[id]/route.ts",
  "POST /token/mint": "src/app/api/token/mint/route.ts",
  "POST /token/transfer": "src/app/api/token/transfer/route.ts",
};

function schemaProps(name: keyof typeof openapiSpec.components.schemas): string[] {
  const schema = openapiSpec.components.schemas[name] as { properties: Record<string, unknown> };
  return Object.keys(schema.properties).sort();
}

describe("OpenAPI spec", () => {
  it("declares OpenAPI 3.1", () => {
    expect(openapiSpec.openapi).toBe(OPENAPI_VERSION);
    expect(OPENAPI_VERSION.startsWith("3.1")).toBe(true);
  });

  it("documents exactly the implemented public paths, each backed by a route file", () => {
    const documented: string[] = [];
    for (const [path, methods] of Object.entries(openapiSpec.paths)) {
      for (const method of Object.keys(methods)) {
        documented.push(`${method.toUpperCase()} ${path}`);
      }
    }
    expect(documented.sort()).toEqual(Object.keys(ROUTE_FILES).sort());

    for (const [key, file] of Object.entries(ROUTE_FILES)) {
      expect(existsSync(resolve(process.cwd(), file)), `${key} -> ${file}`).toBe(true);
    }
  });

  it("request schemas match the Zod validators field-for-field", () => {
    expect(schemaProps("KycStartRequest")).toEqual(Object.keys(kycStartSchema.shape).sort());
    expect(schemaProps("TokenMintRequest")).toEqual(Object.keys(tokenMintSchema.shape).sort());
    expect(schemaProps("TokenTransferRequest")).toEqual(Object.keys(tokenTransferSchema.shape).sort());
  });

  it("schemaId enums stay in sync with the schema registry", () => {
    const startEnum = openapiSpec.components.schemas.KycStartRequest.properties.schemaId.enum;
    expect([...startEnum].sort()).toEqual([...SCHEMA_IDS].sort());
  });

  it("every endpoint declares its error responses and auth", () => {
    for (const [path, methods] of Object.entries(openapiSpec.paths)) {
      for (const [method, op] of Object.entries(methods as Record<string, unknown>)) {
        const operation = op as { responses: Record<string, unknown>; security?: unknown[] };
        // Public endpoints (health, webhook) opt out of bearer auth via security: [].
        const isPublic = path === "/health" || path === "/kyc/webhook";
        if (!isPublic) {
          expect(operation.responses["401"], `${method} ${path} should document 401`).toBeDefined();
        }
        expect(Object.keys(operation.responses).length).toBeGreaterThan(0);
      }
    }
  });

  it("declares a bearer security scheme and global security", () => {
    expect(openapiSpec.components.securitySchemes.bearerAuth.scheme).toBe("bearer");
    expect(openapiSpec.security).toEqual([{ bearerAuth: [] }]);
  });

  it("openapi.yaml on disk is present and matches the source spec", () => {
    const file = resolve(process.cwd(), "openapi.yaml");
    expect(existsSync(file), "run `npm run openapi:gen`").toBe(true);
    const parsed = parse(readFileSync(file, "utf8"));
    expect(parsed.openapi).toBe(openapiSpec.openapi);
    expect(Object.keys(parsed.paths).sort()).toEqual(Object.keys(openapiSpec.paths).sort());
  });
});
