import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schemaPg from "../../../drizzle/schema";
import * as schemaSqlite from "../../../drizzle/schema-sqlite";

declare const __non_webpack_require__: (path: string) => unknown;

type SqliteDb = { _: never };

const DB_TYPE = process.env.DATABASE_URL ? "postgres" : "sqlite";

let db: SqliteDb;
let schema: typeof schemaSqlite | typeof schemaPg;
let sql: ReturnType<typeof postgres> | null = null;

function initPostgres() {
  const url = process.env.DATABASE_URL!;
  sql = postgres(url, {
    prepare: false,
    max: 20,
    idle_timeout: 30,
    connect_timeout: 15,
    max_lifetime: 60 * 30,
    connection: {
      application_name: "Passify",
    },
  });
  db = drizzlePg(sql, { schema: schemaPg }) as unknown as SqliteDb;
  schema = schemaPg;
}

function initSqlite() {
  type SqliteDbInst = { pragma: (s: string) => void; exec: (s: string) => void; prepare: (s: string) => { get: () => unknown }; };
  type DatabaseCtor = new (path: string) => SqliteDbInst;
  const Database = __non_webpack_require__("better-sqlite3") as unknown as DatabaseCtor;
  const drizzleSqlite = (__non_webpack_require__("drizzle-orm/better-sqlite3") as { drizzle: (...args: unknown[]) => unknown }).drizzle;
  const sqliteDb = new Database("passify-dev.db");
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.pragma("foreign_keys = ON");

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'admin', created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS kyc_providers (id TEXT PRIMARY KEY, name TEXT NOT NULL, api_key_hash TEXT NOT NULL, webhook_secret TEXT NOT NULL, base_url TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS kyc_sessions (id TEXT PRIMARY KEY, external_session_id TEXT NOT NULL, provider_id TEXT NOT NULL, user_pubkey TEXT NOT NULL, schema_id TEXT NOT NULL DEFAULT 'kyc_individual_v1', status TEXT NOT NULL DEFAULT 'pending', error_detail TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), completed_at TEXT, expires_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS attestations (id TEXT PRIMARY KEY, attestation_id TEXT NOT NULL, session_id TEXT NOT NULL, user_pubkey TEXT NOT NULL, schema_id TEXT NOT NULL, data_hash TEXT NOT NULL, attester_pubkey TEXT NOT NULL, onchain_tx TEXT NOT NULL, onchain_account TEXT NOT NULL, jurisdiction TEXT, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS mint_configs (id TEXT PRIMARY KEY, slug TEXT NOT NULL, name TEXT NOT NULL, mint_address TEXT NOT NULL, decimals INTEGER NOT NULL DEFAULT 6, total_supply TEXT NOT NULL, minted_supply TEXT NOT NULL DEFAULT '0', is_confidential INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS compliance_rules (id TEXT PRIMARY KEY, mint_config_id TEXT NOT NULL, required_schema TEXT NOT NULL, allowed_jurisdictions TEXT NOT NULL DEFAULT '[]', min_investment_usd TEXT NOT NULL DEFAULT '0', max_holders INTEGER NOT NULL DEFAULT 999999, transfer_lock_until TEXT, updated_by TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')), created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, old_value TEXT, new_value TEXT, ip_address TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS api_keys (id TEXT PRIMARY KEY, platform_name TEXT NOT NULL, key_hash TEXT NOT NULL UNIQUE, key_prefix TEXT NOT NULL, tier TEXT NOT NULL DEFAULT 'free', monthly_limit INTEGER NOT NULL DEFAULT 500, current_usage INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1, allowed_mints TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL DEFAULT (datetime('now')), last_used_at TEXT);
    CREATE TABLE IF NOT EXISTS usage_resets (id TEXT PRIMARY KEY, api_key_id TEXT NOT NULL, reset_at TEXT NOT NULL DEFAULT (datetime('now')), previous_usage INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS attestation_reads (id TEXT PRIMARY KEY, attestation_id TEXT NOT NULL, api_key_id TEXT NOT NULL, read_at TEXT NOT NULL DEFAULT (datetime('now')));
  `);

  db = drizzleSqlite(sqliteDb, { schema: schemaSqlite }) as unknown as SqliteDb;
  schema = schemaSqlite;

  const count = sqliteDb.prepare("SELECT COUNT(*) as c FROM accounts").get() as { c: number };
  if (count.c === 0) {
    try {
      // eslint-disable-next-line no-eval
      const mod = eval('require("../../../drizzle/seed-sqlite")') as { seedSqliteDb: (db: unknown) => Promise<void> };
      mod.seedSqliteDb(db).catch(() => {});
    } catch {
      /* seed is optional */
    }
  }
}

if (DB_TYPE === "postgres") {
  initPostgres();
} else {
  initSqlite();
}

export { db, schema, sql };
