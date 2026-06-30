import { SCHEMA_IDS } from "./schemas/registry";

/**
 * OpenAPI 3.1 specification for the public Passify REST API.
 *
 * This object is the single source of truth: it is served live at
 * `GET /api/openapi`, serialized to `openapi.yaml` by `scripts/gen-openapi.ts`,
 * and validated against the real Zod schemas + route files in
 * `src/__tests__/openapi.test.ts`. Keep it in sync with the route handlers.
 */
export const OPENAPI_VERSION = "3.1.0";

const errorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string", description: "Machine-readable error code.", example: "validation_error" },
    detail: { type: "string", description: "Human-readable description." },
    request_id: { type: "string", description: "Correlation id; include when contacting support." },
  },
} as const;

const solanaPubkey = {
  type: "string",
  pattern: "^[1-9A-HJ-NP-Za-km-z]{43,44}$",
  description: "Base58-encoded Solana public key.",
  example: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
} as const;

const responses = {
  Unauthorized: {
    description: "Missing or invalid API key.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { error: "invalid_api_key", detail: "API key is invalid or revoked.", request_id: "a1b2c3d4" } } },
  },
  ValidationError: {
    description: "Malformed request or failed validation.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { error: "validation_error", detail: "userPubkey: Invalid Solana public key" } } },
  },
  RateLimited: {
    description: "Rate limit or monthly quota exceeded.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { error: "quota_exceeded", detail: "Monthly attestation quota exceeded." } } },
  },
  Forbidden: {
    description: "Authenticated, but a compliance rule or attestation check failed.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { error: "attestation_required", detail: "User has no valid attestation." } } },
  },
  NotFound: {
    description: "Resource not found.",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { error: "not_found", detail: "Attestation not found." } } },
  },
} as const;

export const openapiSpec = {
  openapi: OPENAPI_VERSION,
  info: {
    title: "Passify API",
    version: "1.0.0",
    summary: "Identity & compliance API for Solana real-world-asset platforms.",
    description: [
      "API-first identity verification and compliance for Solana RWA platforms.",
      "",
      "**Authentication.** Send your API key as a bearer token on every endpoint",
      "except `/health` and `/kyc/webhook`: `Authorization: Bearer passify_live_...`.",
      "Keys are created in the dashboard and shown once.",
      "",
      "**Test mode.** Keys with the `passify_test_` prefix return deterministic",
      "sandbox responses (each marked `\"test\": true`) — no KYC provider, no mainnet,",
      "and no real attestation data. Use them to build before going live.",
      "",
      "**Rate limits.** A per-key monthly attestation quota applies by tier",
      "(free 500, pro 10,000, enterprise custom) and returns `429 quota_exceeded`.",
      "`POST /kyc/start` is additionally limited to 20 requests per 60s per key.",
      "",
      "**Errors.** Every error uses one shape: `{ error, detail?, request_id? }`.",
      "",
      "**Conventions.** JSON in/out; send `Content-Type: application/json` on writes.",
      "Timestamps are UTC ISO-8601. Solana addresses and signatures are base58.",
    ].join("\n"),
    contact: { name: "Passify Support", email: "support@passify.biz", url: "https://passify.biz/docs" },
    license: { name: "Proprietary" },
  },
  servers: [{ url: "https://passify.biz/api/v1", description: "Production" }],
  tags: [
    { name: "KYC", description: "Start verification sessions, read status, receive provider webhooks." },
    { name: "Attestation", description: "Read attestation details." },
    { name: "Token", description: "Build compliance-checked Token-2022 transactions." },
    { name: "System", description: "Service health." },
  ],
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Service health",
        description: "Liveness/readiness probe. No authentication required.",
        security: [],
        operationId: "getHealth",
        responses: {
          "200": {
            description: "Service healthy.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Health" } } },
          },
          "503": { description: "One or more dependencies are degraded.", content: { "application/json": { schema: { $ref: "#/components/schemas/Health" } } } },
        },
      },
    },
    "/kyc/start": {
      post: {
        tags: ["KYC"],
        summary: "Start a KYC session",
        description: "Creates a verification session with the configured KYC provider and returns a hosted session URL to redirect the investor to.",
        operationId: "startKyc",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/KycStartRequest" }, example: { userPubkey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", schemaId: "kyc_individual_v1" } } },
        },
        responses: {
          "200": { description: "Session created.", content: { "application/json": { schema: { $ref: "#/components/schemas/KycStartResponse" }, example: { session_id: "bp_mock_1a2b3c4d", session_url: "https://verify.blockpass.org/..." } } } },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/kyc/status/{pubkey}": {
      get: {
        tags: ["KYC"],
        summary: "Get attestation status for a wallet",
        description: "Returns the current verification status for a Solana public key. Responses are cached for up to 60 seconds.",
        operationId: "getKycStatus",
        parameters: [{ name: "pubkey", in: "path", required: true, schema: solanaPubkey, description: "Investor Solana public key." }],
        responses: {
          "200": { description: "Status resolved.", content: { "application/json": { schema: { $ref: "#/components/schemas/KycStatusResponse" }, examples: { verified: { value: { status: "verified", attestation_id: "att_lm3k_9f2a", schema: "kyc_individual_v1", expires_at: "2027-01-15T00:00:00.000Z", onchain_tx: "5x...", issued_by_platform: "Passify" } }, unverified: { value: { status: "unverified" } } } } } },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/kyc/webhook": {
      post: {
        tags: ["KYC"],
        summary: "KYC provider webhook (inbound)",
        description: "Called by the KYC provider on verification completion. Authenticated by HMAC signature header (`x-blockpass-signature` or `x-signature`), not by an API key. On approval, Passify writes an on-chain attestation. Idempotent per session.",
        security: [],
        operationId: "kycWebhook",
        parameters: [{ name: "x-signature", in: "header", required: false, schema: { type: "string" }, description: "HMAC signature of the raw body." }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/WebhookPayload" } } } },
        responses: {
          "200": { description: "Processed.", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "approved" }, attestation_id: { type: "string" } } } } } },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { description: "Invalid webhook signature.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { $ref: "#/components/responses/NotFound" },
          "413": { description: "Body too large.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/attestation/{id}": {
      get: {
        tags: ["Attestation"],
        summary: "Get attestation by id",
        description: "Returns the full detail of an attestation by its internal id (`att_...`).",
        operationId: "getAttestation",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", example: "att_lm3k_9f2a" }, description: "Internal attestation id." }],
        responses: {
          "200": { description: "Attestation found.", content: { "application/json": { schema: { $ref: "#/components/schemas/Attestation" } } } },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/token/mint": {
      post: {
        tags: ["Token"],
        summary: "Build a compliance-checked mint transaction",
        description: "Verifies the recipient holds a valid attestation satisfying the asset's compliance rules, then returns an unsigned Token-2022 mint transaction (base64). The caller signs and submits it.",
        operationId: "buildMint",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TokenMintRequest" }, example: { user_pubkey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", mint_config: "us_real_estate_fund_v1", amount: 1000 } } } },
        responses: {
          "200": { description: "Unsigned transaction built.", content: { "application/json": { schema: { $ref: "#/components/schemas/TokenMintResponse" } } } },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/token/transfer": {
      post: {
        tags: ["Token"],
        summary: "Build a compliance-checked transfer transaction",
        description: "Verifies the sender holds a valid attestation satisfying the asset's compliance rules, then returns an unsigned Token-2022 transfer transaction (base64).",
        operationId: "buildTransfer",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TokenTransferRequest" }, example: { mint_config: "us_real_estate_fund_v1", sender: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", recipient: "9yQp...", amount: 500 } } } },
        responses: {
          "200": { description: "Unsigned transaction built.", content: { "application/json": { schema: { $ref: "#/components/schemas/TokenTransferResponse" } } } },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "API key (passify_...)", description: "API key as a bearer token." },
    },
    responses,
    schemas: {
      Error: errorSchema,
      Health: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["healthy", "degraded"] },
          version: { type: "string" },
          uptime: { type: "integer", description: "Process uptime in seconds." },
          latency_ms: { type: "integer" },
          timestamp: { type: "string", format: "date-time" },
          checks: { type: "object", additionalProperties: { type: "string" }, example: { database: "ok", redis: "ok", env: "ok" } },
        },
      },
      KycStartRequest: {
        type: "object",
        required: ["userPubkey", "schemaId"],
        properties: {
          userPubkey: solanaPubkey,
          schemaId: { type: "string", enum: SCHEMA_IDS, description: "Attestation schema to verify against." },
        },
      },
      KycStartResponse: {
        type: "object",
        required: ["session_id", "session_url"],
        properties: {
          session_id: { type: "string", description: "Provider session id." },
          session_url: { type: "string", format: "uri", description: "Hosted KYC URL to redirect the investor to." },
        },
      },
      KycStatusResponse: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["verified", "unverified"] },
          attestation_id: { type: "string" },
          schema: { type: "string", enum: SCHEMA_IDS },
          expires_at: { type: "string", format: "date-time" },
          onchain_tx: { type: "string" },
          issued_by_platform: { type: "string" },
        },
      },
      WebhookPayload: {
        type: "object",
        description: "Provider-shaped payload; fields vary by provider.",
        properties: {
          session_id: { type: "string" },
          status: { type: "string", enum: ["pending", "approved", "rejected", "expired", "error"] },
          jurisdiction: { type: "string", description: "ISO country code (metadata, not PII)." },
        },
      },
      Attestation: {
        type: "object",
        properties: {
          attestation_id: { type: "string" },
          schema: { type: "string", enum: SCHEMA_IDS },
          user_pubkey: solanaPubkey,
          status: { type: "string", enum: ["verified", "expired"] },
          issued_at: { type: "string", format: "date-time" },
          expires_at: { type: "string", format: "date-time" },
          onchain_tx: { type: "string" },
          data_hash: { type: "string", description: "SHA-256 of the KYC result payload." },
        },
      },
      TokenMintRequest: {
        type: "object",
        required: ["user_pubkey", "mint_config", "amount"],
        properties: {
          user_pubkey: solanaPubkey,
          mint_config: { type: "string", minLength: 1, maxLength: 100, description: "Mint configuration slug." },
          amount: { oneOf: [{ type: "number" }, { type: "string" }], description: "Positive amount (number or numeric string)." },
        },
      },
      TokenMintResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          unsigned_transaction_base64: { type: "string" },
          mint: solanaPubkey,
          amount: { type: "number" },
        },
      },
      TokenTransferRequest: {
        type: "object",
        required: ["mint_config", "sender", "recipient", "amount"],
        properties: {
          mint_config: { type: "string", minLength: 1, maxLength: 100 },
          sender: solanaPubkey,
          recipient: solanaPubkey,
          amount: { oneOf: [{ type: "number" }, { type: "string" }], description: "Positive amount." },
        },
      },
      TokenTransferResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          unsigned_transaction_base64: { type: "string" },
        },
      },
    },
  },
} as const;

export type OpenApiSpec = typeof openapiSpec;
