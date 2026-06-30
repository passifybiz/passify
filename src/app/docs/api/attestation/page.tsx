import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Endpoint } from "@/components/docs/endpoint";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/api/attestation" },
  title: "Attestation API",
  description: "Read full attestation details by ID, including schema, hash, on-chain transaction, and expiry.",
};

const toc = [
  { id: "get", title: "Get an attestation" },
  { id: "fields", title: "Response fields" },
  { id: "errors", title: "Errors" },
];

export default function AttestationApiPage() {
  return (
    <DocArticle
      slug="/docs/api/attestation"
      title="Attestation API"
      lead="Retrieve the full record for a single attestation by its identifier."
      toc={toc}
    >
      <h2 id="get">Get an attestation</h2>
      <Endpoint method="GET" path="/attestation/{id}" />
      <p>Returns the complete <Link href="/docs/concepts/attestations">attestation</Link> record.</p>
      <CodeBlock
        language="bash"
        code={`curl https://passify.biz/api/v1/attestation/att_5m8n \\
  -H "Authorization: Bearer passify_live_xxx"`}
      />
      <CodeBlock
        language="json"
        title="200 OK"
        code={`{
  "attestation_id": "att_5m8n",
  "user_pubkey": "7xKXtg2...",
  "schema": "kyc_accredited_v1",
  "status": "verified",
  "data_hash": "a1b2c3d4e5f6...",
  "attester_pubkey": "Att3st...",
  "onchain_tx": "3kLm...xyz",
  "expires_at": "2026-12-15T00:00:00Z"
}`}
      />

      <h2 id="fields">Response fields</h2>
      <table>
        <thead><tr><th>Field</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>attestation_id</code></td><td>Stable internal identifier.</td></tr>
          <tr><td><code>user_pubkey</code></td><td>The verified wallet.</td></tr>
          <tr><td><code>schema</code></td><td>The schema the attestation was issued under.</td></tr>
          <tr><td><code>status</code></td><td><code>verified</code> or <code>expired</code>.</td></tr>
          <tr><td><code>data_hash</code></td><td>SHA-256 of the KYC result. One-way — never reversible to PII.</td></tr>
          <tr><td><code>attester_pubkey</code></td><td>Passify&apos;s on-chain signing key.</td></tr>
          <tr><td><code>onchain_tx</code></td><td>Solana signature for the attestation write (verifiable on an explorer).</td></tr>
          <tr><td><code>expires_at</code></td><td>Expiry timestamp (UTC).</td></tr>
        </tbody>
      </table>

      <h2 id="errors">Errors</h2>
      <p>An unknown ID returns <code>404</code>:</p>
      <CodeBlock
        language="json"
        title="404 Not Found"
        code={`{ "error": "not_found", "detail": "No attestation with that ID.", "request_id": "a1b2c3d4" }`}
      />
    </DocArticle>
  );
}
