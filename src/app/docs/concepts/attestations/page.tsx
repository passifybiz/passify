import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/concepts/attestations" },
  title: "Attestations",
  description: "What a Passify attestation is, the fields it contains, its lifecycle, and what it deliberately omits.",
};

const toc = [
  { id: "definition", title: "What an attestation is" },
  { id: "fields", title: "Fields" },
  { id: "lifecycle", title: "Lifecycle" },
  { id: "never", title: "What it never contains" },
  { id: "mistakes", title: "Common mistakes" },
];

export default function AttestationsPage() {
  return (
    <DocArticle
      slug="/docs/concepts/attestations"
      title="Attestations"
      lead="An attestation is the portable, on-chain proof that a wallet passed verification. It is the unit every other part of Passify reads from."
      toc={toc}
    >
      <h2 id="definition">What an attestation is</h2>
      <p>
        An attestation links a Solana wallet to a verification result without revealing the underlying data. It
        is signed by Passify&apos;s attester key and stored on-chain, so any integrated platform can confirm —
        independently and permissionlessly — that the wallet was verified under a given{" "}
        <Link href="/docs/concepts/schemas">schema</Link>.
      </p>

      <h2 id="fields">Fields</h2>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>attestation_id</code></td><td>Stable internal identifier, e.g. <code>att_5m8n</code>.</td></tr>
          <tr><td><code>user_pubkey</code></td><td>The verified wallet (base58 Solana public key).</td></tr>
          <tr><td><code>schema_id</code></td><td>What was verified, e.g. <code>kyc_accredited_v1</code>.</td></tr>
          <tr><td><code>data_hash</code></td><td>SHA-256 of the KYC result payload. One-way; never reversible.</td></tr>
          <tr><td><code>attester_pubkey</code></td><td>Passify&apos;s on-chain signing key.</td></tr>
          <tr><td><code>onchain_tx</code></td><td>Solana transaction signature for the attestation write.</td></tr>
          <tr><td><code>expires_at</code></td><td>When the attestation lapses and must be renewed.</td></tr>
        </tbody>
      </table>
      <p>Reading an attestation by ID returns these fields:</p>
      <CodeBlock
        language="json"
        title="GET /attestation/att_5m8n"
        code={`{
  "attestation_id": "att_5m8n",
  "user_pubkey": "7xKXtg2...",
  "schema": "kyc_accredited_v1",
  "status": "verified",
  "data_hash": "a1b2c3d4e5f6...",
  "onchain_tx": "3kLm...xyz",
  "expires_at": "2026-12-15T00:00:00Z"
}`}
      />

      <h2 id="lifecycle">Lifecycle</h2>
      <ul>
        <li><strong>Issued</strong> — written on-chain after the KYC provider approves.</li>
        <li><strong>Verified</strong> — active and within its validity window; reads return <code>verified</code>.</li>
        <li><strong>Expired</strong> — past <code>expires_at</code>; token operations are refused until renewal.</li>
      </ul>
      <Callout tone="note">
        Attestations are immutable once written. A renewal creates a new attestation rather than editing the
        old one, preserving a clean on-chain history.
      </Callout>

      <h2 id="never">What it never contains</h2>
      <p>
        No name, date of birth, address, government ID, document image, or country string in plaintext. Identity
        data lives only with the KYC provider. The on-chain record is a hash plus the metadata above — see{" "}
        <Link href="/docs/security">Security</Link>.
      </p>

      <h2 id="mistakes">Common mistakes</h2>
      <ul>
        <li><strong>Treating a hash as data.</strong> <code>data_hash</code> proves integrity, not contents — you cannot read identity from it.</li>
        <li><strong>Ignoring expiry.</strong> Always check <code>expires_at</code> before relying on an attestation; an expired one fails enforcement.</li>
        <li><strong>Assuming one schema fits all.</strong> A retail check does not satisfy an accredited-only asset. Match the <Link href="/docs/concepts/schemas">schema</Link> to the rule.</li>
      </ul>
    </DocArticle>
  );
}
