// Schema-driven migrator: pushes the Drizzle schema directly to Postgres.
// Idempotent and dev-friendly. Run with:  npm run db:migrate
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set. Copy .env.example to .env and run `docker compose up -d`.");
  process.exit(1);
}

// enable_extension handled by the migrations folder created by drizzle-kit;
// to keep this zero-config we ensure pgcrypto (for gen_random_uuid) up front.
const bootstrap = postgres(url, { max: 1 });
await bootstrap`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
await bootstrap.end();

const sql = postgres(url, { max: 1, prepare: false });
const db = drizzle(sql);

console.log("→ Pushing Passify schema to Postgres…");
await migrate(db, { migrationsFolder: "./drizzle/migrations" });
await sql.end();
console.log("✓ Schema applied.");
