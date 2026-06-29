// Display formatters. Kept pure (no React) so they're usable on server + client.

/** Truncate a long string in the middle: "7xKXtg2CW87...abc" */
export function truncateMiddle(value: string, head = 8, tail = 4): string {
  if (!value) return "";
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Format an ISO/Date as "2026-06-14 09:32 UTC" — no locale gymnastics. */
export function formatDateTime(input: Date | string | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
  );
}

/** Format an ISO/Date as "2026-06-14" */
export function formatDate(input: Date | string | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Relative-ish label for recent activity: "2026-06-14 09:32" */
export function formatShortTime(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** Whole-number formatting with thousands separators. */
export function formatNumber(n: number | bigint | string): string {
  return Number(n).toLocaleString("en-US");
}

/** Percent with no decimals: 0.62 -> "62%" */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** USD with thousands separators and 2 decimals when needed. */
export function formatUsd(n: number | string): string {
  const num = typeof n === "string" ? Number(n) : n;
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Solscan explorer links. */
export function solscanAccount(address: string): string {
  return `https://solscan.io/account/${address}`;
}
export function solscanTx(signature: string): string {
  return `https://solscan.io/tx/${signature}`;
}
