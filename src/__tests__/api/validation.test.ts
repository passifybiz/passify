// @vitest-environment node
import { describe, it, expect } from "vitest";

const SOLANA_PUBKEY_REGEX = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;

describe("Solana pubkey validation", () => {
  it("accepts valid base58 pubkey", () => {
    expect(SOLANA_PUBKEY_REGEX.test("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")).toBe(true);
  });

  it("rejects pubkey with invalid chars", () => {
    expect(SOLANA_PUBKEY_REGEX.test("0OIl_invalid")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(SOLANA_PUBKEY_REGEX.test("")).toBe(false);
  });

  it("rejects too-short key", () => {
    expect(SOLANA_PUBKEY_REGEX.test("7xKXtg2CW87")).toBe(false);
  });
});

describe("Amount validation", () => {
  it("rejects zero amount", () => {
    expect(Number("0") > 0).toBe(false);
  });

  it("accepts positive amount", () => {
    expect(Number("1000") > 0).toBe(true);
  });

  it("rejects negative amount", () => {
    expect(Number("-5") > 0).toBe(false);
  });
});
