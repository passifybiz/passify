/* ─────────────────────────────────────────────────────────────
   $PASS token — single source of truth.

   The contract address is a PLACEHOLDER until the mainnet launch.
   When the final mint is deployed, change ONLY `contractAddress`
   (and set `contractAddressIsPlaceholder` to false). Every surface
   — landing, docs, footer — reads from this object, so the swap is
   a one-line change with no copy edits anywhere else.
   ───────────────────────────────────────────────────────────── */

export const TOKEN = {
  /** Display ticker. Rendered with a leading "$" by helpers below. */
  symbol: "PASS",
  /** Full token name. */
  name: "Passify Token",
  /** Network the token launches on. */
  network: "Solana",
  /** Token standard. */
  standard: "SPL Token",
  /**
   * Mainnet contract address (mint). PLACEHOLDER until launch.
   * pump.fun-style address ending in "pump".
   */
  contractAddress: ".....pump",
  /** Flip to false once the real CA is set above. Drives the "temporary" UI. */
  contractAddressIsPlaceholder: true,
  /** Proposed maximum supply. Forward-looking; subject to change before launch. */
  totalSupply: 1_000_000_000,
  /** Token decimals (SPL default for fungible launch tokens). */
  decimals: 6,
} as const;

/** Ticker with leading "$", e.g. "$PASS". */
export const TICKER = `$${TOKEN.symbol}` as const;

/** Human-formatted total supply, e.g. "1,000,000,000". */
export function formatSupply(value: number = TOKEN.totalSupply): string {
  return value.toLocaleString("en-US");
}

/** Short, copy-friendly CA for compact UI (keeps the "pump" suffix legible). */
export function shortContractAddress(addr: string = TOKEN.contractAddress): string {
  if (addr.length <= 13) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-5)}`;
}
