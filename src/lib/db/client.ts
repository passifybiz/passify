import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schemaPg from "../../../drizzle/schema";
import * as schemaSqlite from "../../../drizzle/schema-sqlite";

type SqliteDb = any;

let db: SqliteDb;
let schema: typeof schemaSqlite | typeof schemaPg;
let sql: ReturnType<typeof postgres> | null = null;

const DB_TYPE = process.env.DATABASE_URL ? "postgres" : "sqlite";

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

if (DB_TYPE === "postgres") {
  initPostgres();
}

export { db, schema, sql };
