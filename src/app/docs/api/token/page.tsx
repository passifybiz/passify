import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Endpoint } from "@/components/docs/endpoint";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/api/token" },
  title: "Token API",
  description: "Build compliance-checked Token-2022 mint and transfer transactions. Returns unsigned transactions for the user to sign.",
};

const toc = [
  { id: "mint", title: "Mint" },
  { id: "transfer", title: "Transfer" },
  { id: "errors", title: "Compliance errors" },
];

export default function TokenApiPage() {
  return (
    <DocArticle
      slug="/docs/api/token"
      title="Token API"
      lead="Mint and transfer endpoints run every compliance check, then return an unsigned Token-2022 transaction. Passify never signs or holds funds."
      toc={toc}
    >
      <h2 id="mint">Mint</h2>
      <Endpoint method="POST" path="/token/mint" />
      <p>Builds a mint transaction. Requires a valid <Link href="/docs/concepts/attestations">attestation</Link> that satisfies the asset&apos;s rules.</p>
      <table>
        <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>user_pubkey</code></td><td>string</td><td>Recipient wallet (base58).</td></tr>
          <tr><td><code>mint_config</code></td><td>string</td><td>Token configuration slug, e.g. <code>us_real_estate_fund_v1</code>.</td></tr>
          <tr><td><code>amount</code></td><td>string</td><td>Amount to mint.</td></tr>
        </tbody>
      </table>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://passify.biz/api/v1/token/mint \\
  -H "Authorization: Bearer passify_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{ "user_pubkey": "7xKXtg2...", "mint_config": "us_real_estate_fund_v1", "amount": "1000" }'`}
      />
      <CodeBlock language="json" title="200 OK" code={`{ "status": "success", "unsigned_transaction_base64": "AQABA..." }`} />

      <h2 id="transfer">Transfer</h2>
      <Endpoint method="POST" path="/token/transfer" />
      <p>Builds a transfer transaction after checking the sender&apos;s attestation and runtime rules.</p>
      <table>
        <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>mint_config</code></td><td>string</td><td>Token configuration slug.</td></tr>
          <tr><td><code>sender</code></td><td>string</td><td>Sending wallet (base58).</td></tr>
          <tr><td><code>recipient</code></td><td>string</td><td>Receiving wallet (base58).</td></tr>
          <tr><td><code>amount</code></td><td>string</td><td>Amount to transfer.</td></tr>
        </tbody>
      </table>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://passify.biz/api/v1/token/transfer \\
  -H "Authorization: Bearer passify_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{ "mint_config": "us_real_estate_fund_v1", "sender": "7xKXtg2...", "recipient": "4mNp...", "amount": "500" }'`}
      />
      <Callout tone="tip">
        Submit the signed transaction to the network yourself and confirm it before updating records. See the{" "}
        <Link href="/docs/guides/mint-and-transfer">mint &amp; transfer guide</Link> for the full flow.
      </Callout>

      <h2 id="errors">Compliance errors</h2>
      <p>A failed check returns <code>403</code> with a specific reason and no transaction:</p>
      <CodeBlock
        language="json"
        title="403 Forbidden"
        code={`{ "error": "rule_violation", "detail": "min_investment_usd_100", "request_id": "a1b2c3d4" }`}
      />
      <table>
        <thead><tr><th><code>error</code></th><th>Cause</th></tr></thead>
        <tbody>
          <tr><td><code>attestation_required</code></td><td>No valid attestation for the wallet.</td></tr>
          <tr><td><code>attestation_expired</code></td><td>Attestation has lapsed.</td></tr>
          <tr><td><code>rule_violation</code></td><td>A compliance rule failed; see <code>detail</code>.</td></tr>
        </tbody>
      </table>
    </DocArticle>
  );
}
