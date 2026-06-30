// ─────────────────────────────────────────────────────────────
// Passify database schema.
// Mirrors the TRD SQL 1:1 (PostgreSQL-specific types preserved:
// JSONB, INET, NUMERIC(24,0), BIGSERIAL, gen_random_uuid).
// All timestamps are UTC. No soft deletes — use status columns.
// ─────────────────────────────────────────────────────────────

import {
  bigserial,
  boolean,
  inet,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// gen_random_uuid() default — Postgres 13+
const genUuid = uuid("id").primaryKey().defaultRandom();
const now = () => timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow();

// ── Dashboard accounts (NOT in TRD — internal only) ──────────
// Compliance officers / platform staff who log into the dashboard.
export const accounts = pgTable("accounts", {
  id: genUuid,
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("admin"), // admin | compliance | viewer
  createdAt: now(),
});

// ── KYC providers we integrate with ───────────────────────────
export const kycProviders = pgTable(
  "kyc_providers",
  {
    id: genUuid,
    name: varchar("name", { length: 100 }).notNull(), // "blockpass", "sumsub"
    apiKeyHash: varchar("api_key_hash", { length: 64 }).notNull(), // SHA-256 of actual key
    webhookSecret: varchar("webhook_secret", { length: 64 }).notNull(), // SHA-256 of webhook secret
    baseUrl: text("base_url").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: now(),
  },
  (t) => ({ nameUnique: uniqueIndex("kyc_providers_name_unique").on(t.name) }),
);

// ── KYC sessions — one per verification attempt ──────────────
export const kycSessions = pgTable(
  "kyc_sessions",
  {
    id: genUuid,
    externalSessionId: varchar("external_session_id", { length: 255 }).notNull(), // provider's session id
    providerId: uuid("provider_id")
      .notNull()
      .references(() => kycProviders.id),
    userPubkey: varchar("user_pubkey", { length: 44 }).notNull(), // Solana base58 pubkey
    schemaId: varchar("schema_id", { length: 100 }).notNull().default("kyc_individual_v1"),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending|approved|rejected|expired|error
    errorDetail: text("error_detail"),
    createdAt: now(),
    completedAt: timestamp("completed_at", { mode: "date", withTimezone: true }),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  },
  (t) => ({
    externalUnique: unique("kyc_sessions_external_unique").on(t.externalSessionId, t.providerId),
    externalIdx: uniqueIndex("idx_kyc_sessions_external").on(t.externalSessionId),
  }),
);

// ── Attestations — the onchain record ────────────────────────
export const attestations = pgTable(
  "attestations",
  {
    id: genUuid,
    attestationId: varchar("attestation_id", { length: 255 }).notNull(), // internal: "att_XXXX"
    sessionId: uuid("session_id")
      .notNull()
      .references(() => kycSessions.id),
    userPubkey: varchar("user_pubkey", { length: 44 }).notNull(),
    schemaId: varchar("schema_id", { length: 100 }).notNull(), // "kyc_individual_v1", "kyc_accredited_v1"
    dataHash: varchar("data_hash", { length: 64 }).notNull(), // SHA-256 of KYC result payload
    attesterPubkey: varchar("attester_pubkey", { length: 44 }).notNull(), // Passify onchain attester key
    onchainTx: varchar("onchain_tx", { length: 88 }).notNull(), // Solana tx signature
    onchainAccount: varchar("onchain_account", { length: 44 }).notNull(), // attestation PDA/account address
    jurisdiction: varchar("jurisdiction", { length: 8 }), // "US" — metadata, NOT PII (see schema notes)
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
    createdAt: now(),
  },
  (t) => ({
    attestationIdUnique: unique("attestations_attestation_id_unique").on(t.attestationId),
    pubkeyIdx: uniqueIndex("idx_attestations_pubkey_schema").on(t.userPubkey, t.schemaId, t.expiresAt),
  }),
);

// ── Token mint configurations — per RWA asset ────────────────
export const mintConfigs = pgTable("mint_configs", {
  id: genUuid,
  slug: varchar("slug", { length: 100 }).notNull(), // "us_real_estate_fund_v1"
  name: varchar("name", { length: 255 }).notNull(),
  mintAddress: varchar("mint_address", { length: 44 }).notNull(), // Token-2022 mint pubkey
  decimals: smallint("decimals").notNull().default(6),
  totalSupply: numeric("total_supply", { precision: 24, scale: 0 }).notNull(),
  mintedSupply: numeric("minted_supply", { precision: 24, scale: 0 }).notNull().default("0"),
  isConfidential: boolean("is_confidential").notNull().default(false), // MagicBlock for transfers
  createdAt: now(),
});

// ── Compliance rules — mutable, no onchain deployment needed ─
// Single row per mint_config. Updates overwrite; old values live in audit_log.
export const complianceRules = pgTable(
  "compliance_rules",
  {
    id: genUuid,
    mintConfigId: uuid("mint_config_id")
      .notNull()
      .references(() => mintConfigs.id),
    requiredSchema: varchar("required_schema", { length: 100 }).notNull(),
    allowedJurisdictions: jsonb("allowed_jurisdictions").notNull().default([]), // ["US","CA","GB"]
    minInvestmentUsd: numeric("min_investment_usd", { precision: 16, scale: 2 }).notNull().default("0"),
    maxHolders: integer("max_holders").notNull().default(999999),
    transferLockUntil: timestamp("transfer_lock_until", { mode: "date", withTimezone: true }),
    updatedBy: varchar("updated_by", { length: 255 }).notNull(),
    updatedAt: now(),
    createdAt: now(),
  },
  (t) => ({ mintIdx: uniqueIndex("idx_compliance_rules_mint").on(t.mintConfigId) }),
);

// ── Audit log — every rule change, attestation action ────────
export const auditLog = pgTable(
  "audit_log",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    actor: varchar("actor", { length: 255 }).notNull(), // user id or "system"
    action: varchar("action", { length: 100 }).notNull(), // "rule_updated", "attestation_issued"
    entityType: varchar("entity_type", { length: 50 }).notNull(), // compliance_rule|attestation|mint_config
    entityId: uuid("entity_id").notNull(),
    oldValue: jsonb("old_value"),
    newValue: jsonb("new_value"),
    ipAddress: inet("ip_address"),
    createdAt: now(),
  },
  (t) => ({
    entityIdx: uniqueIndex("idx_audit_log_entity").on(t.entityType, t.entityId, t.createdAt),
  }),
);

// ── API keys for platform integrations ───────────────────────
export const apiKeys = pgTable("api_keys", {
  id: genUuid,
  platformName: varchar("platform_name", { length: 100 }).notNull(),
  keyHash: varchar("key_hash", { length: 64 }).notNull().unique(), // SHA-256 of actual key
  keyPrefix: varchar("key_prefix", { length: 8 }).notNull(), // first 8 chars for identification
  tier: varchar("tier", { length: 20 }).notNull().default("free"), // free|pro|enterprise
  monthlyLimit: integer("monthly_limit").notNull().default(500),
  currentUsage: integer("current_usage").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  allowedMints: jsonb("allowed_mints").notNull().default([]), // mint_config slugs
  createdAt: now(),
  lastUsedAt: timestamp("last_used_at", { mode: "date", withTimezone: true }),
});

// ── Usage counter reset history ──────────────────────────────
export const usageResets = pgTable("usage_resets", {
  id: genUuid,
  apiKeyId: uuid("api_key_id")
    .notNull()
    .references(() => apiKeys.id),
  resetAt: now(),
  previousUsage: integer("previous_usage").notNull(),
});

// ── Platform-to-attestation read log — tracks reuse ──────────
export const attestationReads = pgTable(
  "attestation_reads",
  {
    id: genUuid,
    attestationId: varchar("attestation_id", { length: 255 })
      .notNull()
      .references(() => attestations.attestationId),
    apiKeyId: uuid("api_key_id")
      .notNull()
      .references(() => apiKeys.id),
    readAt: now(),
  },
  (t) => ({
    attIdx: uniqueIndex("idx_attestation_reads_att_key").on(t.attestationId, t.apiKeyId, t.readAt),
  }),
);

// ── Outbound webhooks ─────────────────────────────────────
// Endpoints subscribers register; events Passify emits; per-endpoint deliveries
// with attempt tracking for inline + scheduled retries.
export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: genUuid,
  url: text("url").notNull(),
  secret: varchar("secret", { length: 80 }).notNull(), // signing secret (whsec_...)
  description: varchar("description", { length: 255 }),
  events: jsonb("events").notNull().default([]), // subscribed event types ("*" = all)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id", { length: 64 }).primaryKey(), // "evt_..."
  type: varchar("type", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: genUuid,
    eventId: varchar("event_id", { length: 64 }).notNull().references(() => webhookEvents.id),
    endpointId: uuid("endpoint_id").notNull().references(() => webhookEndpoints.id),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending|success|failed
    attempts: integer("attempts").notNull().default(0),
    responseStatus: integer("response_status"),
    error: text("error"),
    nextRetryAt: timestamp("next_retry_at", { mode: "date", withTimezone: true }),
    lastAttemptAt: timestamp("last_attempt_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: uniqueIndex("idx_webhook_deliveries_status_retry").on(t.status, t.nextRetryAt, t.id),
    eventEndpointIdx: uniqueIndex("idx_webhook_deliveries_event_endpoint").on(t.eventId, t.endpointId),
  }),
);

// Convenience re-export of tables commonly iterated by seed/migrate.
export const allTables = [
  accounts,
  kycProviders,
  kycSessions,
  attestations,
  mintConfigs,
  complianceRules,
  auditLog,
  apiKeys,
  usageResets,
  attestationReads,
  webhookEndpoints,
  webhookEvents,
  webhookDeliveries,
];

// kept import to avoid tree-shaking warning when generator only needs a subset
void serial;
