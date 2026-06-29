// JSON parsing helper for columns that are JSONB in Postgres but TEXT in SQLite.

export function parseJson<T>(value: unknown): T {
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return value as T; }
  }
  return value as T;
}
