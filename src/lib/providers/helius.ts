// Helius RPC + DAS API. Used by the real token service + balance query.
// Fallback to public RPC if Helius is unreachable.

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createMintToInstruction, createTransferInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import type { TokenService, TokenTxResult } from "./types";

function endpoint(): string {
  const key = process.env.HELIUS_API_KEY;
  if (key) return `https://mainnet.helius-rpc.com/?api-key=${key}`;
  return "https://api.mainnet-beta.solana.com";
}

let _conn: Connection | null = null;
export function getConnection(): Connection {
  if (!_conn) _conn = new Connection(endpoint(), "confirmed");
  return _conn;
}

export async function getTokenBalance(
  userPubkey: string,
  mintAddress: string,
): Promise<{ amount: number; decimals: number } | null> {
  const key = process.env.HELIUS_API_KEY;
  if (key) {
    try {
      const url = `https://mainnet.helius-rpc.com/?api-key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "Passify",
          method: "getAsset",
          params: { id: mintAddress },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.result?.token_info?.balance) {
          return { amount: data.result.token_info.balance, decimals: data.result.token_info.decimals ?? 6 };
        }
      }
    } catch {
      /* fall through to RPC */
    }
  }

  try {
    const conn = getConnection();
    const ata = getAssociatedTokenAddressSync(new PublicKey(mintAddress), new PublicKey(userPubkey));
    const { getAccount } = await import("@solana/spl-token");
    const account = await getAccount(conn, ata);
    return { amount: Number(account.amount), decimals: 6 };
  } catch {
    return null;
  }
}

// ── Real Token-2022 service via Helius RPC ───────────────────
export class HeliusTokenService implements TokenService {
  async buildMint({ mintAddress, decimals, recipient, amount }: { mintAddress: string; decimals: number; recipient: string; amount: number }): Promise<TokenTxResult> {
    const conn = getConnection();
    const mint = new PublicKey(mintAddress);
    const dest = getAssociatedTokenAddressSync(mint, new PublicKey(recipient));
    const rawAmount = BigInt(Math.round(amount * 10 ** decimals));

    const tx = new Transaction();
    tx.add(createMintToInstruction(mint, dest, new PublicKey(recipient), rawAmount));
    tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
    tx.feePayer = new PublicKey(recipient);

    return { unsignedTransactionBase64: tx.serialize({ requireAllSignatures: false }).toString("base64") };
  }

  async buildTransfer({ mintAddress, decimals, sender, recipient, amount }: { mintAddress: string; decimals: number; sender: string; recipient: string; amount: number }): Promise<TokenTxResult> {
    const conn = getConnection();
    const mint = new PublicKey(mintAddress);
    const srcAta = getAssociatedTokenAddressSync(mint, new PublicKey(sender));
    const destAta = getAssociatedTokenAddressSync(mint, new PublicKey(recipient));
    const rawAmount = BigInt(Math.round(amount * 10 ** decimals));

    const tx = new Transaction();
    tx.add(createTransferInstruction(srcAta, destAta, new PublicKey(sender), rawAmount));
    tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
    tx.feePayer = new PublicKey(sender);

    return { unsignedTransactionBase64: tx.serialize({ requireAllSignatures: false }).toString("base64") };
  }
}
