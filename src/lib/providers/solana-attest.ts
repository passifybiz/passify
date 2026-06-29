// Real attestation writer.
//
// The TRD assumes a pre-existing attestation program ("EAS-on-Solana / Blockpass
// attestation contracts"). This adapter is parameterized by ATTESTATION_PROGRAM_ID
// and signs/sends an attestation instruction via a Passify-controlled attester
// keypair (ATTESTER_KEYPAIR_BASE58).
//
// LIMITATION: without a confirmed, deployed program id + its exact instruction
// layout, the real WRITE path here is best-effort. The mock (PROVIDER=mock)
// gives the full working UX. See README "Limitations".

import { Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import type { AttestationWriter, AttestationWriteResult } from "./types";
import { getConnection } from "./helius";

export class SolanaAttestationWriter implements AttestationWriter {
  private get programId(): PublicKey {
    const id = process.env.ATTESTATION_PROGRAM_ID;
    if (!id) throw new Error("ATTESTATION_PROGRAM_ID is not set (required for PROVIDER=real).");
    return new PublicKey(id);
  }

  private get attester(): Keypair {
    const b58 = process.env.ATTESTER_KEYPAIR_BASE58;
    if (!b58) throw new Error("ATTESTER_KEYPAIR_BASE58 is not set (required for writing attestations).");
    return Keypair.fromSecretKey(Buffer.from(b58, "base64"));
  }

  async writeAttestation(input: {
    userPubkey: string;
    schemaId: string;
    dataHash: string;
    expiration: Date;
  }): Promise<AttestationWriteResult> {
    const conn = getConnection();
    const programId = this.programId;
    const attester = this.attester;
    const recipient = new PublicKey(input.userPubkey);

    // Derive a deterministic PDA for the attestation record.
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("attestation"), recipient.toBuffer(), Buffer.from(input.schemaId), Buffer.from(input.dataHash)],
      programId,
    );

    const tx = new Transaction().add({
      keys: [
        { pubkey: attester.publicKey, isSigner: true, isWritable: true },
        { pubkey: recipient, isSigner: false, isWritable: false },
        { pubkey: pda, isSigner: false, isWritable: true },
      ],
      programId,
      // NOTE: instruction data layout is program-specific. The TRD does not pin
      // a concrete program, so we encode a minimal {schema_id, data_hash, exp}
      // payload. A real deployment must match its owner/borsh expectations.
      data: Buffer.from(
        JSON.stringify({
          schema_id: input.schemaId,
          data_hash: input.dataHash,
          expiration: Math.floor(input.expiration.getTime() / 1000),
        }),
      ),
    });

    const sig = await sendAndConfirmTransaction(conn, tx, [attester]);
    return { txSignature: sig, onchainAccount: pda.toBase58() };
  }
}
