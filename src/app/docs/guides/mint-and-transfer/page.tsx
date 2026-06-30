import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  title: "Mint & transfer tokens",
  description: "Build compliance-checked Token-2022 mint and transfer transactions and have the user sign them in their wallet.",
};

const toc = [
  { id: "model", title: "The signing model" },
  { id: "mint", title: "Mint to a verified wallet" },
  { id: "transfer", title: "Transfer between wallets" },
  { id: "errors", title: "Compliance errors" },
  { id: "checklist", title: "Integration checklist" },
];

export default function MintTransferGuide() {
  return (
    <DocArticle
      slug="/docs/guides/mint-and-transfer"
      title="Mint & transfer tokens"
      lead="Passify checks compliance, then returns an unsigned transaction. Your user signs it in their own wallet — Passify never holds keys or moves funds."
      toc={toc}
    >
      <h2 id="model">The signing model</h2>
      <p>
        Token endpoints return a base64-encoded <em>unsigned</em> transaction. Your application passes it to the
        user&apos;s wallet (Phantom, Solflare, or a wallet-as-a-service provider) for signing, then submits the
        signed transaction to the network. This keeps a hard boundary: Passify enforces policy and assembles
        instructions but can never sign on a user&apos;s behalf.
      </p>

      <h2 id="mint">Mint to a verified wallet</h2>
      <p>
        Minting requires a valid <Link href="/docs/concepts/attestations">attestation</Link> that satisfies the
        asset&apos;s <Link href="/docs/concepts/compliance-rules">compliance rules</Link>:
      </p>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://passify.biz/api/v1/token/mint \\
  -H "Authorization: Bearer passify_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_pubkey": "7xKXtg2...",
    "mint_config": "us_real_estate_fund_v1",
    "amount": "1000"
  }'`}
      />
      <CodeBlock
        language="json"
        title="200 OK"
        code={`{ "status": "success", "unsigned_transaction_base64": "AQABA..." }`}
      />

      <h2 id="transfer">Transfer between wallets</h2>
      <p>
        Transfers check the sender&apos;s attestation and any runtime rules — jurisdiction, holder caps, and
        transfer locks — before returning an unsigned transaction:
      </p>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://passify.biz/api/v1/token/transfer \\
  -H "Authorization: Bearer passify_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mint_config": "us_real_estate_fund_v1",
    "sender": "7xKXtg2...",
    "recipient": "4mNp...",
    "amount": "500"
  }'`}
      />

      <h2 id="errors">Compliance errors</h2>
      <p>If a check fails, Passify returns <code>403</code> with a specific reason and no transaction:</p>
      <table>
        <thead>
          <tr><th><code>error</code></th><th>Cause</th></tr>
        </thead>
        <tbody>
          <tr><td><code>attestation_required</code></td><td>The wallet has no valid attestation.</td></tr>
          <tr><td><code>attestation_expired</code></td><td>The attestation has lapsed; renew it.</td></tr>
          <tr><td><code>rule_violation</code></td><td>A rule failed; <code>detail</code> names which (e.g. <code>min_investment_usd_100</code>).</td></tr>
        </tbody>
      </table>
      <Callout tone="warning">
        Never assume a wallet is still eligible because it was last week. Attestations expire and rules change.
        Always let the API perform the check at build time rather than caching an &ldquo;eligible&rdquo; flag.
      </Callout>

      <h2 id="checklist">Integration checklist</h2>
      <ul>
        <li>Confirm a <code>verified</code> status before offering a mint or transfer in the UI.</li>
        <li>Handle <code>403</code> reasons explicitly so users know exactly what to fix.</li>
        <li>Submit the signed transaction and confirm it on-chain before updating your own records.</li>
        <li>For confidential assets, transfers may route through a privacy provider — the API contract is unchanged.</li>
      </ul>
    </DocArticle>
  );
}
