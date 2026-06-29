// Provider interfaces. The 4 services depend on these, not on concrete
// providers. Switching between mock and real is one env var (PROVIDER).

export interface StartSessionInput {
  userPubkey: string;
  schemaId: string;
}

export interface StartedSession {
  externalSessionId: string;
  sessionUrl: string;
  providerName: string;
}

export interface WebhookPayload {
  externalSessionId: string;
  status: "approved" | "rejected" | "pending";
  /** Opaque provider payload — we only ever hash it, never inspect/store PII. */
  raw: string;
  /** Jurisdiction code extracted by the provider's metadata (NOT PII onchain). */
  jurisdiction?: string;
}

export interface KycProvider {
  name: string;
  startSession(input: StartSessionInput): Promise<StartedSession>;
  /** Verify the provider's HMAC signature on an inbound webhook. */
  verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean>;
  /** Parse the provider's webhook body into our normalized shape. */
  parseWebhook(body: unknown): WebhookPayload;
}

export interface AttestationWriteResult {
  txSignature: string;
  onchainAccount: string;
}

export interface AttestationWriter {
  /** Build + send the onchain attestation. Real impl needs ATTESTATION_PROGRAM_ID + funded wallet. */
  writeAttestation(input: {
    userPubkey: string;
    schemaId: string;
    dataHash: string;
    expiration: Date;
  }): Promise<AttestationWriteResult>;
}

export interface TokenTxResult {
  /** Unsigned base64 transaction for the platform to relay to the user's wallet. */
  unsignedTransactionBase64: string;
}

export interface TokenService {
  /** Build a Token-2022 mint-to instruction. Returns unsigned tx for relay. */
  buildMint(input: {
    mintAddress: string;
    decimals: number;
    recipient: string;
    amount: number;
  }): Promise<TokenTxResult>;

  /** Build a Token-2022 transfer instruction. */
  buildTransfer(input: {
    mintAddress: string;
    decimals: number;
    sender: string;
    recipient: string;
    amount: number;
  }): Promise<TokenTxResult>;
}

export interface BalanceQuery {
  getTokenBalance(userPubkey: string, mintAddress: string): Promise<{ amount: number; decimals: number } | null>;
}
