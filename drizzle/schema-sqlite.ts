// ─────────────────────────────────────────────────────────────
// Passify SQLite database schema.
// Used for local development when DATABASE_URL is not set.
// Mirrors the production Postgres schema with SQLite-compatible types.
// ─────────────────────────────────────────────────────────────

import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

const genId = () => text("id").primaryKey();

// ── Dashboard accounts ─────────────────────────────────────
export const accounts = sqliteTable("accounts", {
  id: genId(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// ── KYC providers ─────────────────────────────────────────
export const kycProviders = sqliteTable(
  "kyc_providers",
  {
    id: genId(),
    name: text("name").notNull(),
    apiKeyHash: text("api_key_hash").notNull(),
    webhookSecret: text("webhook_secret").notNull(),
    baseUrl: text("base_url").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default("(datetime('now'))"),
  },
  (t) => ({ nameUnique: uniqueIndex("kyc_providers_name_unique").on(t.name) }),
);

// ── KYC sessions ──────────────────────────────────────────
export const kycSessions = sqliteTable(
  "kyc_sessions",
  {
    id: genId(),
    externalSessionId: text("external_session_id").notNull(),
    providerId: text("provider_id").notNull(),
    userPubkey: text("user_pubkey").notNull(),
    schemaId: text("schema_id").notNull().default("kyc_individual_v1"),
    status: text("status").notNull().default("pending"),
    errorDetail: text("error_detail"),
    createdAt: text("created_at").notNull().default("(datetime('now'))"),
    completedAt: text("completed_at"),
    expiresAt: text("expires_at").notNull(),
  },
  (t) => ({
    externalIdx: uniqueIndex("idx_kyc_sessions_external").on(t.externalSessionId),
    pubkeyIdx: uniqueIndex("idx_kyc_sessions_pubkey").on(t.userPubkey),
    statusIdx: uniqueIndex("idx_kyc_sessions_status").on(t.status),
  }),
);

// ── Attestations ──────────────────────────────────────────
export const attestations = sqliteTable(
  "attestations",
  {
    id: genId(),
    attestationId: text("attestation_id").notNull(),
    sessionId: text("session_id").notNull(),
    userPubkey: text("user_pubkey").notNull(),
    schemaId: text("schema_id").notNull(),
    dataHash: text("data_hash").notNull(),
    attesterPubkey: text("attester_pubkey").notNull(),
    onchainTx: text("onchain_tx").notNull(),
    onchainAccount: text("onchain_account").notNull(),
    jurisdiction: text("jurisdiction"),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default("(datetime('now'))"),
  },
  (t) => ({
    attestationIdUnique: uniqueIndex("attestations_attestation_id_unique").on(t.attestationId),
    pubkeyIdx: uniqueIndex("idx_attestations_pubkey").on(t.userPubkey),
    pubkeyExpiryIdx: uniqueIndex("idx_attestations_pubkey_expiry").on(t.userPubkey, t.expiresAt),
    schemaIdx: uniqueIndex("idx_attestations_schema").on(t.schemaId),
  }),
);

// ── Mint configs ──────────────────────────────────────────
export const mintConfigs = sqliteTable("mint_configs", {
  id: genId(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  mintAddress: text("mint_address").notNull(),
  decimals: integer("decimals").notNull().default(6),
  totalSupply: text("total_supply").notNull(),
  mintedSupply: text("minted_supply").notNull().default("0"),
  isConfidential: integer("is_confidential", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// ── Compliance rules ──────────────────────────────────────
export const complianceRules = sqliteTable(
  "compliance_rules",
  {
    id: genId(),
    mintConfigId: text("mint_config_id").notNull(),
    requiredSchema: text("required_schema").notNull(),
    allowedJurisdictions: text("allowed_jurisdictions").notNull().default("[]"),
    minInvestmentUsd: text("min_investment_usd").notNull().default("0"),
    maxHolders: integer("max_holders").notNull().default(999999),
    transferLockUntil: text("transfer_lock_until"),
    updatedBy: text("updated_by").notNull(),
    updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
    createdAt: text("created_at").notNull().default("(datetime('now'))"),
  },
  (t) => ({ mintIdx: uniqueIndex("idx_compliance_rules_mint").on(t.mintConfigId) }),
);

// ── Audit log ─────────────────────────────────────────────
export const auditLog = sqliteTable(
  "audit_log",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    ipAddress: text("ip_address"),
    createdAt: text("created_at").notNull().default("(datetime('now'))"),
  },
  (t) => ({
    entityIdx: uniqueIndex("idx_audit_log_entity").on(t.entityType, t.entityId),
    createdIdx: uniqueIndex("idx_audit_log_created").on(t.createdAt),
  }),
);

// ── API keys ──────────────────────────────────────────────
export const apiKeys = sqliteTable("api_keys", {
  id: genId(),
  platformName: text("platform_name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  keyPrefix: text("key_prefix").notNull(),
  tier: text("tier").notNull().default("free"),
  monthlyLimit: integer("monthly_limit").notNull().default(500),
  currentUsage: integer("current_usage").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  allowedMints: text("allowed_mints").notNull().default("[]"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  lastUsedAt: text("last_used_at"),
});

// ── Usage resets ──────────────────────────────────────────
export const usageResets = sqliteTable("usage_resets", {
  id: genId(),
  apiKeyId: text("api_key_id").notNull(),
  resetAt: text("reset_at").notNull().default("(datetime('now'))"),
  previousUsage: integer("previous_usage").notNull(),
});

// ── Attestation reads ─────────────────────────────────────
export const attestationReads = sqliteTable(
  "attestation_reads",
  {
    id: genId(),
    attestationId: text("attestation_id").notNull(),
    apiKeyId: text("api_key_id").notNull(),
    readAt: text("read_at").notNull().default("(datetime('now'))"),
  },
  (t) => ({
    attIdx: uniqueIndex("idx_attestation_reads_att").on(t.attestationId),
    keyIdx: uniqueIndex("idx_attestation_reads_key").on(t.apiKeyId),
  }),
);


// ── Outbound webhooks ─────────────────────────────────────
export const webhookEndpoints = sqliteTable("webhook_endpoints", {
  id: genId(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  description: text("description"),
  events: text("events").notNull().default("[]"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  payload: text("payload").notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const webhookDeliveries = sqliteTable(
  "webhook_deliveries",
  {
    id: genId(),
    eventId: text("event_id").notNull(),
    endpointId: text("endpoint_id").notNull(),
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    responseStatus: integer("response_status"),
    error: text("error"),
    nextRetryAt: text("next_retry_at"),
    lastAttemptAt: text("last_attempt_at"),
    createdAt: text("created_at").notNull().default("(datetime('now'))"),
  },
  (t) => ({
    statusIdx: uniqueIndex("idx_webhook_deliveries_status_retry").on(t.status, t.nextRetryAt),
    eventEndpointIdx: uniqueIndex("idx_webhook_deliveries_event_endpoint").on(t.eventId, t.endpointId),
  }),
);
