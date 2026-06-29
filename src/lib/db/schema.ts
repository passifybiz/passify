// Local dev uses SQLite. Postgres (production) schema lives in drizzle/schema.ts.
// The app code imports table objects — they work identically with either dialect.
export * from "../../../drizzle/schema-sqlite";
