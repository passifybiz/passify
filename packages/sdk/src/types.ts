/**
 * Public types for the Passify SDK. These mirror the OpenAPI 3.1 contract
 * (see `openapi.yaml` / `GET /api/openapi`). The SDK exposes camelCase inputs
 * and maps them to the API's wire format internally.
 */

export type SchemaId = "kyc_individual_v1" | "kyc_accredited_v1" | "kyc_entity_v1";

export interface StartKycParams {
  userPubkey: string;
  schemaId: SchemaId;
}

export interface StartKycResult {
  sessionId: string;
  sessionUrl: string;
}

export type KycStatus = "verified" | "unverified";

export interface KycStatusResult {
  status: KycStatus;
  attestationId?: string;
  schema?: SchemaId;
  expiresAt?: string;
  onchainTx?: string;
  issuedByPlatform?: string;
}

export interface Attestation {
  attestationId: string;
  schema: SchemaId;
  userPubkey: string;
  status: "verified" | "expired";
  issuedAt: string;
  expiresAt: string;
  onchainTx: string;
  dataHash: string;
}

export interface MintParams {
  userPubkey: string;
  mintConfig: string;
  amount: number | string;
}

export interface MintResult {
  status: string;
  unsignedTransactionBase64: string;
  mint: string;
  amount: number;
}

export interface TransferParams {
  mintConfig: string;
  sender: string;
  recipient: string;
  amount: number | string;
}

export interface TransferResult {
  status: string;
  unsignedTransactionBase64: string;
}

export interface HealthResult {
  status: "healthy" | "degraded";
  version: string;
  uptime: number;
  latencyMs: number;
  timestamp: string;
  checks: Record<string, string>;
}

export interface PassifyOptions {
  /** API key, e.g. `passify_live_...`. */
  apiKey: string;
  /** Override the base URL. Defaults to the production API. */
  baseUrl?: string;
  /** Custom fetch implementation (for testing or non-standard runtimes). */
  fetch?: typeof fetch;
  /** Max automatic retries on 429/5xx. Default 2. */
  maxRetries?: number;
  /** Base backoff in ms (exponential). Default 300. */
  retryBaseMs?: number;
  /** Per-request timeout in ms. Default 30000. */
  timeoutMs?: number;
}
