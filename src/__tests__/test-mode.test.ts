import { describe, it, expect } from "vitest";
import {
  isTestKeyPrefix,
  testKycStatus,
  testStartSession,
  testAttestation,
  testMintResult,
  testTransferResult,
} from "@/lib/test-mode";

describe("test mode", () => {
  it("detects test key prefixes", () => {
    expect(isTestKeyPrefix("passify_test_ab")).toBe(true);
    expect(isTestKeyPrefix("passify_live_ab")).toBe(false);
    expect(isTestKeyPrefix(null)).toBe(false);
    expect(isTestKeyPrefix(undefined)).toBe(false);
  });

  it("kyc status is deterministic, verified, and marked test", () => {
    const a = testKycStatus("PUBKEY1");
    const b = testKycStatus("PUBKEY1");
    expect(a).toEqual(b);
    expect(a.status).toBe("verified");
    expect(a.test).toBe(true);
    expect(a.attestation_id.startsWith("att_test_")).toBe(true);
    // Different input → different attestation id
    expect(testKycStatus("PUBKEY2").attestation_id).not.toBe(a.attestation_id);
  });

  it("start session is deterministic and sandboxed", () => {
    const s = testStartSession("PUB", "kyc_individual_v1");
    expect(s).toEqual(testStartSession("PUB", "kyc_individual_v1"));
    expect(s.session_url).toContain("/sandbox/");
    expect(s.test).toBe(true);
  });

  it("attestation detail is marked test and never expired", () => {
    const att = testAttestation("att_test_xyz");
    expect(att.test).toBe(true);
    expect(att.status).toBe("verified");
    expect(new Date(att.expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  it("token results are marked test and decode to test payloads", () => {
    const mint = testMintResult("cfg", 100);
    expect(mint.test).toBe(true);
    const decoded = Buffer.from(mint.unsigned_transaction_base64, "base64").toString();
    expect(decoded.startsWith("test::")).toBe(true);
    expect(decoded).toContain("\"kind\":\"mint\"");

    const transfer = testTransferResult("cfg");
    expect(transfer.test).toBe(true);
    expect(Buffer.from(transfer.unsigned_transaction_base64, "base64").toString()).toContain("\"kind\":\"transfer\"");
  });
});
