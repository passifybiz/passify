/**
 * Example: verify an investor, then build a compliance-checked mint.
 *
 *   PASSIFY_API_KEY=passify_live_... npx tsx examples/verify-and-mint.ts
 *
 * This file is illustrative; it imports the SDK from source for the monorepo.
 * In a real project: `import { Passify } from "@passify/sdk";`
 */
import { Passify, PassifyError } from "../src/index";

async function main() {
  const apiKey = process.env.PASSIFY_API_KEY;
  if (!apiKey) throw new Error("Set PASSIFY_API_KEY");

  const passify = new Passify({ apiKey });
  const userPubkey = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

  try {
    const { sessionUrl } = await passify.kyc.start({ userPubkey, schemaId: "kyc_individual_v1" });
    console.log("Redirect the investor to:", sessionUrl);

    const status = await passify.kyc.status(userPubkey);
    console.log("Status:", status.status);

    if (status.status === "verified") {
      const mint = await passify.token.mint({
        userPubkey,
        mintConfig: "us_real_estate_fund_v1",
        amount: 1000,
      });
      console.log("Unsigned tx (base64):", mint.unsignedTransactionBase64.slice(0, 24), "…");
    }
  } catch (err) {
    if (err instanceof PassifyError) {
      console.error(`Passify error ${err.status} ${err.code}: ${err.detail ?? ""} (request ${err.requestId ?? "?"})`);
      process.exitCode = 1;
    } else {
      throw err;
    }
  }
}

main();
