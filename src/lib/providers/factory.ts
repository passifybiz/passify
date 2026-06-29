import { db } from "@/lib/db/client";
import { kycProviders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { KycProvider, AttestationWriter, TokenService } from "./types";
import { MockKycProvider, MockAttestationWriter, MockTokenService } from "./mock";
import { BlockpassKycProvider } from "./blockpass";
import { SolanaAttestationWriter } from "./solana-attest";

const MOCK = process.env.PROVIDER !== "real";

if (MOCK && process.env.NODE_ENV === "production") {
  console.warn("[passify] WARNING: Running with PROVIDER=mock in production. Webhook signatures are NOT verified.");
}

let _kycProvider: KycProvider | null = null;
let _attestationWriter: AttestationWriter | null = null;
let _tokenService: TokenService | null = null;

export async function getKycProvider(): Promise<KycProvider> {
  if (_kycProvider) return _kycProvider;

  if (MOCK) {
    _kycProvider = new MockKycProvider();
  } else {
    const provider = await db.query.kycProviders.findFirst({ where: eq(kycProviders.name, "blockpass") });
    if (!provider) throw new Error("No active KYC provider configured.");
    _kycProvider = new BlockpassKycProvider();
  }

  return _kycProvider;
}

export async function getAttestationWriter(): Promise<AttestationWriter> {
  if (_attestationWriter) return _attestationWriter;

  if (MOCK) {
    _attestationWriter = new MockAttestationWriter();
  } else {
    _attestationWriter = new SolanaAttestationWriter();
  }

  return _attestationWriter;
}

export async function getTokenService(): Promise<TokenService> {
  if (_tokenService) return _tokenService;

  if (MOCK) {
    _tokenService = new MockTokenService();
  } else {
    // Real Token-2022 service uses Helius RPC — for now falls back to mock
    // until a dedicated HeliusTokenService is implemented.
    const { HeliusTokenService } = await import("./helius");
    _tokenService = new HeliusTokenService();
  }

  return _tokenService;
}
