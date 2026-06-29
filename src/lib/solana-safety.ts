/**
 * Solana SDK v1.x security boundary.
 *
 * Known CVEs in transitive deps (bigint-buffer, uuid, jayson):
 * - GHSA-3gc7-fjrx-p6mg: bigint-buffer overflow via toBigIntLE()
 * - GHSA-w5hq-g745-h8pq: uuid bounds check with custom buf
 *
 * Mitigation: All Solana SDK calls receive only validated, server-controlled
 * inputs. No user-supplied buffers reach bigint-buffer. The SDK runs
 * server-side only — never in the browser bundle.
 *
 * This file is intentionally imported by providers that use @solana/web3.js
 * to document the trust boundary.
 */

/** Validates a Solana public key string before passing to SDK */
export function assertValidPubkey(pubkey: string): void {
  if (!/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(pubkey)) {
    throw new Error(`Invalid Solana public key: ${pubkey.slice(0, 8)}...`);
  }
}
