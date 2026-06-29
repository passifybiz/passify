// @vitest-environment node
import { describe, it, expect } from "vitest";
import { assertValidPubkey } from "@/lib/solana-safety";

describe("Solana safety boundary", () => {
  it("accepts valid pubkey", () => {
    expect(() => assertValidPubkey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")).not.toThrow();
  });

  it("rejects pubkey with invalid characters", () => {
    expect(() => assertValidPubkey("0OIl_INVALID_KEY_HERE")).toThrow("Invalid Solana public key");
  });

  it("rejects empty string", () => {
    expect(() => assertValidPubkey("")).toThrow();
  });

  it("rejects too-short key", () => {
    expect(() => assertValidPubkey("7xKXtg2CW87")).toThrow();
  });

  it("rejects injection attempts", () => {
    expect(() => assertValidPubkey("'; DROP TABLE attestations; --")).toThrow();
  });
});
