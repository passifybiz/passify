// ─────────────────────────────────────────────────────────────
// Passify seed. Run after db:migrate. Idempotent-ish: clears data then reinserts.
//   npm run db:seed
// Creates: 1 admin account, 2 API keys, 2 mint configs + rules,
// 3 KYC providers, 6 attestations with reads, plus audit + activity.
// ─────────────────────────────────────────────────────────────
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import postgres from "postgres";
import {
  apiKeys,
  accounts,
  attestationReads,
  attestations,
  auditLog,
  complianceRules,
  kycProviders,
  kycSessions,
  mintConfigs,
} from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });
const db = drizzle(sql);

// Deterministic, Solana-shaped base58 pubkeys (44 chars) for display realism.
function fakeBase58(seed: string, len = 44): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let out = "";
  let n = seed;
  while (out.length < len) {
    n = createHash("sha256").update(n).digest("hex");
    for (const b of n) out += alphabet[b.charCodeAt(0) % alphabet.length];
  }
  return out.slice(0, len);
}

function sha256hex(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

// Realistic Solana tx signature (64-88 base58 chars).
function fakeTx(seed: string): string {
  return fakeBase58("tx::" + seed, 88);
}

async function main() {
  console.log("→ Clearing existing data…");
  // Order respects FK constraints.
  await sql`TRUNCATE TABLE
    attestation_reads, audit_log, usage_resets, api_keys, compliance_rules,
    attestations, kyc_sessions, mint_configs, kyc_providers, accounts
    CASCADE`;
  await sql`ALTER SEQUENCE audit_log_id_seq RESTART WITH 1`;

  // ── Accounts ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("passify-admin", 10);
  const [admin] = await db
    .insert(accounts)
    .values([
      {
        email: "sarah@passify.biz",
        passwordHash,
        name: "Sarah Chen",
        role: "admin",
      },
      {
        email: "viewer@passify.biz",
        passwordHash,
        name: "Read Only",
        role: "viewer",
      },
    ])
    .returning();
  console.log(`  ✓ accounts: ${admin.email} (password: "passify-admin")`);

  // ── KYC providers ─────────────────────────────────────────
  const [blockpass, sumsub] = await db
    .insert(kycProviders)
    .values([
      {
        name: "blockpass",
        apiKeyHash: sha256hex("seed-blockpass-key"),
        webhookSecret: sha256hex("seed-blockpass-secret"),
        baseUrl: "https://kyc.blockpass.org",
        isActive: true,
      },
      {
        name: "sumsub",
        apiKeyHash: sha256hex("seed-sumsub-key"),
        webhookSecret: sha256hex("seed-sumsub-secret"),
        baseUrl: "https://api.sumsub.com",
        isActive: true,
      },
      {
        name: "onfido",
        apiKeyHash: sha256hex("seed-onfido-key"),
        webhookSecret: sha256hex("seed-onfido-secret"),
        baseUrl: "https://api.onfido.com",
        isActive: false,
      },
    ])
    .returning();

  // ── Mint configs (RWA assets) ─────────────────────────────
  const [realEstate, invoices] = await db
    .insert(mintConfigs)
    .values([
      {
        slug: "us_real_estate_fund_v1",
        name: "US Real Estate Fund v1",
        mintAddress: fakeBase58("mint::realestate"),
        decimals: 6,
        totalSupply: "10000000",
        mintedSupply: "1840000",
        isConfidential: false,
      },
      {
        slug: "invoice_pool_v2",
        name: "Invoice Pool v2",
        mintAddress: fakeBase58("mint::invoices"),
        decimals: 6,
        totalSupply: "5000000",
        mintedSupply: "920000",
        isConfidential: true,
      },
    ])
    .returning();

  // ── Compliance rules (mutable, no redeploy) ───────────────
  const [reRules, invRules] = await db
    .insert(complianceRules)
    .values([
      {
        mintConfigId: realEstate.id,
        requiredSchema: "kyc_accredited_v1",
        allowedJurisdictions: ["US", "CA", "GB"],
        minInvestmentUsd: "100.00",
        maxHolders: 500,
        transferLockUntil: null,
        updatedBy: "sarah@passify.biz",
      },
      {
        mintConfigId: invoices.id,
        requiredSchema: "kyc_individual_v1",
        allowedJurisdictions: ["US", "CA", "GB", "DE", "SG"],
        minInvestmentUsd: "1000.00",
        maxHolders: 200,
        transferLockUntil: null,
        updatedBy: "sarah@passify.biz",
      },
    ])
    .returning();

  // ── API keys ──────────────────────────────────────────────
  // We surface the FULL plaintext once here only, for the README/secrets file.
  // In the dashboard create-key flow the plaintext is shown once and never stored.
  function makeKey(prefix: string) {
    const raw = `passify_live_${prefix}${randomBytes(20).toString("hex")}`;
    return { raw, hash: sha256hex(raw), display: raw.slice(0, 8) };
  }
  const keyA = makeKey("xK2m");
  const keyB = makeKey("pQ9r");
  const [apiKeyA, apiKeyB] = await db
    .insert(apiKeys)
    .values([
      {
        platformName: "Platform A",
        keyHash: keyA.hash,
        keyPrefix: keyA.display,
        tier: "pro",
        monthlyLimit: 10000,
        currentUsage: 3241,
        isActive: true,
        allowedMints: [realEstate.slug, invoices.slug],
        lastUsedAt: new Date(Date.now() - 1000 * 60 * 12),
      },
      {
        platformName: "Platform B",
        keyHash: keyB.hash,
        keyPrefix: keyB.display,
        tier: "free",
        monthlyLimit: 500,
        currentUsage: 112,
        isActive: true,
        allowedMints: [invoices.slug],
        lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
    ])
    .returning();

  // ── KYC sessions + attestations ───────────────────────────
  const users = [
    { seed: "alice", schema: "kyc_accredited_v1", jurisdiction: "US", issuer: "Platform A" },
    { seed: "bob", schema: "kyc_accredited_v1", jurisdiction: "CA", issuer: "Platform A" },
    { seed: "carol", schema: "kyc_individual_v1", jurisdiction: "GB", issuer: "Platform A" },
    { seed: "dave", schema: "kyc_accredited_v1", jurisdiction: "US", issuer: "Platform A" },
    { seed: "eve", schema: "kyc_individual_v1", jurisdiction: "DE", issuer: "Platform B" },
    { seed: "frank", schema: "kyc_individual_v1", jurisdiction: "SG", issuer: "Platform B" },
  ];

  const attester = fakeBase58("passify-attester");
  const minsAgo = (m: number) => new Date(Date.now() - m * 60_000);
  const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);

  const attestationRows: Array<{
    id: string;
    attestationId: string;
    userPubkey: string;
    schemaId: string;
    jurisdiction: string | null;
    issuer: string;
  }> = [];

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const pubkey = fakeBase58(u.seed);
    const externalId = `bp_sess_${u.seed}_${randomBytes(3).toString("hex")}`;
    const provider = u.issuer === "Platform A" ? blockpass : sumsub;
    const created = minsAgo(200 - i * 28);
    const completed = minsAgo(198 - i * 28);

    const [session] = await db
      .insert(kycSessions)
      .values({
        externalSessionId: externalId,
        providerId: provider.id,
        userPubkey: pubkey,
        status: "approved",
        createdAt: created,
        completedAt: completed,
        expiresAt: minsAgo(195 - i * 28),
      })
      .returning();

    const attestationId = `att_${(i + 1).toString().padStart(4, "0")}`;
    const dataHash = sha256hex(`payload::${u.seed}`);
    const [att] = await db.insert(attestations).values({
      attestationId,
      sessionId: session.id,
      userPubkey: pubkey,
      schemaId: u.schema,
      dataHash,
      attesterPubkey: attester,
      onchainTx: fakeTx(u.seed),
      onchainAccount: fakeBase58("acc::" + u.seed),
      jurisdiction: u.jurisdiction,
      expiresAt: daysFromNow(180 - i * 5),
      createdAt: completed,
    }).returning();
    attestationRows.push({ id: att.id, attestationId, userPubkey: pubkey, schemaId: u.schema, jurisdiction: u.jurisdiction, issuer: u.issuer });
  }

  // ── Attestation reads (reuse signal) ──────────────────────
  // att_0001 and att_0002 were read by both platforms → reuse.
  await db.insert(attestationReads).values([
    { attestationId: "att_0001", apiKeyId: apiKeyA.id, readAt: minsAgo(120) },
    { attestationId: "att_0001", apiKeyId: apiKeyB.id, readAt: minsAgo(90) },
    { attestationId: "att_0002", apiKeyId: apiKeyA.id, readAt: minsAgo(60) },
    { attestationId: "att_0002", apiKeyId: apiKeyB.id, readAt: minsAgo(40) },
    { attestationId: "att_0003", apiKeyId: apiKeyA.id, readAt: minsAgo(15) },
  ]);

  // ── Audit log ─────────────────────────────────────────────
  await db.insert(auditLog).values([
    {
      actor: "sarah@passify.biz",
      action: "rule_updated",
      entityType: "compliance_rule",
      entityId: reRules.id,
      oldValue: { maxHolders: 250 },
      newValue: { maxHolders: 500 },
      createdAt: minsAgo(2880),
    },
    {
      actor: "system",
      action: "attestation_issued",
      entityType: "attestation",
      entityId: attestationRows[0]!.id,
      newValue: { attestationId: "att_0001" },
      createdAt: minsAgo(198),
    },
    {
      actor: "system",
      action: "mint_config_created",
      entityType: "mint_config",
      entityId: invoices.id,
      createdAt: minsAgo(4320),
    },
  ]);

  console.log("  ✓ kyc_providers:  blockpass, sumsub, onfido");
  console.log("  ✓ mint_configs:   us_real_estate_fund_v1, invoice_pool_v2");
  console.log("  ✓ compliance_rules: 2 (mutable, no redeploy)");
  console.log("  ✓ attestations:  6 (with reuse reads)");
  console.log("  ✓ api_keys:      2");
  console.log("");
  console.log("────────────────────────────────────────");
  console.log("  Dashboard login:  sarah@passify.biz / passify-admin");
  console.log(`  API key A:        ${keyA.raw}`);
  console.log(`  API key B:        ${keyB.raw}`);
  console.log("  (Store these. They are NOT shown again anywhere.)");
  console.log("────────────────────────────────────────");

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
