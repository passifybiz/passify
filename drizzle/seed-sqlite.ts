import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema-sqlite";
import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "crypto";

function fakePubkey(seed: string): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let out = "";
  let n = seed;
  while (out.length < 44) {
    n = createHash("sha256").update(n).digest("hex");
    for (const b of n) out += alphabet[b.charCodeAt(0) % alphabet.length];
  }
  return out.slice(0, 44);
}

function fakeTx(seed: string): string {
  return fakePubkey("tx::" + seed).slice(0, 88);
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

function daysFromNow(d: number): string {
  return new Date(Date.now() + d * 86_400_000).toISOString();
}

export async function seedSqliteDb(db: ReturnType<typeof drizzle<typeof schema>>) {
  const passHash = await bcrypt.hash("passify-admin", 10);

  // Accounts
  db.insert(schema.accounts).values([
    { id: randomUUID(), email: "sarah@passify.biz", passwordHash: passHash, name: "Sarah Chen", role: "admin" },
    { id: randomUUID(), email: "viewer@passify.biz", passwordHash: passHash, name: "Read Only", role: "viewer" },
  ]).run();

  // KYC Providers
  const bpId = randomUUID(), ssId = randomUUID(), ofId = randomUUID();
  db.insert(schema.kycProviders).values([
    { id: bpId, name: "blockpass", apiKeyHash: sha256("key1"), webhookSecret: sha256("secret1"), baseUrl: "https://kyc.blockpass.org", isActive: true },
    { id: ssId, name: "sumsub", apiKeyHash: sha256("key2"), webhookSecret: sha256("secret2"), baseUrl: "https://api.sumsub.com", isActive: true },
    { id: ofId, name: "onfido", apiKeyHash: sha256("key3"), webhookSecret: sha256("secret3"), baseUrl: "https://api.onfido.com", isActive: false },
  ]).run();

  // Mint Configs
  const reId = randomUUID(), invId = randomUUID();
  db.insert(schema.mintConfigs).values([
    { id: reId, slug: "us_real_estate_fund_v1", name: "US Real Estate Fund v1", mintAddress: fakePubkey("mint::re"), decimals: 6, totalSupply: "10000000", mintedSupply: "1840000", isConfidential: false },
    { id: invId, slug: "invoice_pool_v2", name: "Invoice Pool v2", mintAddress: fakePubkey("mint::inv"), decimals: 6, totalSupply: "5000000", mintedSupply: "920000", isConfidential: true },
  ]).run();

  // Compliance Rules
  db.insert(schema.complianceRules).values([
    { id: randomUUID(), mintConfigId: reId, requiredSchema: "kyc_accredited_v1", allowedJurisdictions: JSON.stringify(["US","CA","GB"]), minInvestmentUsd: "100", maxHolders: 500, updatedBy: "sarah@passify.biz" },
    { id: randomUUID(), mintConfigId: invId, requiredSchema: "kyc_individual_v1", allowedJurisdictions: JSON.stringify(["US","CA","GB","DE","SG"]), minInvestmentUsd: "1000", maxHolders: 200, updatedBy: "sarah@passify.biz" },
  ]).run();

  // API Keys
  const keyAId = randomUUID(), keyBId = randomUUID();
  db.insert(schema.apiKeys).values([
    { id: keyAId, platformName: "Platform A", keyHash: sha256("passify_live_xK2m"), keyPrefix: "passify_live_xK2m", tier: "pro", monthlyLimit: 10000, currentUsage: 3241, isActive: true, allowedMints: JSON.stringify(["us_real_estate_fund_v1","invoice_pool_v2"]), lastUsedAt: hoursAgo(0.2) },
    { id: keyBId, platformName: "Platform B", keyHash: sha256("passify_live_pQ9r"), keyPrefix: "passify_live_pQ9r", tier: "free", monthlyLimit: 500, currentUsage: 112, isActive: true, allowedMints: JSON.stringify(["invoice_pool_v2"]), lastUsedAt: hoursAgo(5) },
  ]).run();

  // KYC Sessions + Attestations
  const users = [
    { seed: "alice", schema: "kyc_accredited_v1", jurisdiction: "US" },
    { seed: "bob", schema: "kyc_accredited_v1", jurisdiction: "CA" },
    { seed: "carol", schema: "kyc_individual_v1", jurisdiction: "GB" },
    { seed: "dave", schema: "kyc_accredited_v1", jurisdiction: "US" },
    { seed: "eve", schema: "kyc_individual_v1", jurisdiction: "DE" },
    { seed: "frank", schema: "kyc_individual_v1", jurisdiction: "SG" },
  ];

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const pubkey = fakePubkey(u.seed);
    const sessionId = randomUUID();
    const attester = fakePubkey("passify-attester");
    db.insert(schema.kycSessions).values({
      id: sessionId,
      externalSessionId: `bp_sess_${u.seed}`,
      providerId: bpId,
      userPubkey: pubkey,
      schemaId: u.schema,
      status: "approved",
      completedAt: hoursAgo(200 - i * 28),
      expiresAt: hoursAgo(195 - i * 28),
    }).run();
    db.insert(schema.attestations).values({
      id: randomUUID(),
      attestationId: `att_${(i + 1).toString().padStart(4, "0")}`,
      sessionId,
      userPubkey: pubkey,
      schemaId: u.schema,
      dataHash: sha256(u.seed),
      attesterPubkey: attester,
      onchainTx: fakeTx(u.seed),
      onchainAccount: fakePubkey("acc::" + u.seed),
      jurisdiction: u.jurisdiction,
      expiresAt: daysFromNow(180 - i * 5),
    }).run();
  }

  // Attestation Reads
  db.insert(schema.attestationReads).values([
    { id: randomUUID(), attestationId: "att_0001", apiKeyId: keyAId, readAt: hoursAgo(120) },
    { id: randomUUID(), attestationId: "att_0001", apiKeyId: keyBId, readAt: hoursAgo(90) },
    { id: randomUUID(), attestationId: "att_0002", apiKeyId: keyAId, readAt: hoursAgo(60) },
    { id: randomUUID(), attestationId: "att_0002", apiKeyId: keyBId, readAt: hoursAgo(40) },
    { id: randomUUID(), attestationId: "att_0003", apiKeyId: keyAId, readAt: hoursAgo(15) },
  ]).run();

  // Audit Log
  db.insert(schema.auditLog).values([
    { actor: "sarah@passify.biz", action: "rule_updated", entityType: "compliance_rule", entityId: reId, oldValue: JSON.stringify({ maxHolders: 250 }), newValue: JSON.stringify({ maxHolders: 500 }), createdAt: hoursAgo(2880) },
    { actor: "system", action: "attestation_issued", entityType: "attestation", entityId: randomUUID(), newValue: JSON.stringify({ attestationId: "att_0001" }), createdAt: hoursAgo(198) },
    { actor: "system", action: "mint_config_created", entityType: "mint_config", entityId: invId, createdAt: hoursAgo(4320) },
  ]).run();
}
