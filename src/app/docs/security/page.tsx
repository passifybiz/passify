import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";
import { EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/security" },
  title: "Security",
  description: "Passify's data architecture, the zero-PII guarantee, infrastructure controls, and how to report a vulnerability.",
};

const toc = [
  { id: "zero-pii", title: "The zero-PII guarantee" },
  { id: "data-flow", title: "Data flow" },
  { id: "store", title: "What we store" },
  { id: "controls", title: "Controls" },
  { id: "report", title: "Reporting a vulnerability" },
];

export default function DocsSecurityPage() {
  return (
    <DocArticle
      slug="/docs/security"
      title="Security"
      lead="Passify is built so that the most sensitive data simply never reaches it. This page explains the architecture that makes that true and the controls around everything else."
      toc={toc}
    >
      <h2 id="zero-pii">The zero-PII guarantee</h2>
      <p>
        Passify never stores, processes, or transmits personal identity data. Your KYC provider verifies
        identity and retains the underlying documents; Passify records only a one-way hash and the metadata
        needed to enforce policy. There is no PII to leak because there is no PII to begin with.
      </p>

      <h2 id="data-flow">Data flow</h2>
      <CodeBlock
        language="text"
        title="where data lives"
        code={`Investor ──▶ KYC provider ──▶ provider's database   (PII lives here, not at Passify)
                  │ webhook (approved/rejected)
                  ▼
              Passify ──▶ Solana (on-chain)   stores ONLY:
                                              • SHA-256 hash of the KYC result
                                              • wallet public key
                                              • schema + expiration
                                              • attester public key`}
      />

      <h2 id="store">What we store</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <div>
          <p><strong style={{ color: "var(--success)" }}>We store</strong></p>
          <ul>
            <li>Solana public keys</li>
            <li>SHA-256 attestation hashes</li>
            <li>On-chain transaction signatures</li>
            <li>Compliance rule configurations</li>
            <li>Audit logs of every action</li>
          </ul>
        </div>
        <div>
          <p><strong style={{ color: "var(--error)" }}>We never store</strong></p>
          <ul>
            <li>Names, addresses, dates of birth</li>
            <li>Government IDs or tax numbers</li>
            <li>Biometric data</li>
            <li>Bank details</li>
            <li>Document scans or photos</li>
          </ul>
        </div>
      </div>

      <h2 id="controls">Controls</h2>
      <table>
        <thead><tr><th>Area</th><th>Control</th></tr></thead>
        <tbody>
          <tr><td>Transport</td><td>HTTPS only, HSTS enforced.</td></tr>
          <tr><td>API keys</td><td>SHA-256 hashed at rest; shown once; per-integration scoping.</td></tr>
          <tr><td>Webhooks</td><td>HMAC signature required — unsigned payloads are rejected.</td></tr>
          <tr><td>Key custody</td><td>User private keys never touch Passify; only unsigned transactions are returned.</td></tr>
          <tr><td>Rate limiting</td><td>Redis-backed; fails closed in production.</td></tr>
          <tr><td>Audit</td><td>Every privileged action logged with actor, timestamp, and before/after values.</td></tr>
          <tr><td>Headers</td><td>CSP, X-Frame-Options, and Permissions-Policy set at the edge.</td></tr>
        </tbody>
      </table>
      <Callout tone="security">
        Because Passify returns only unsigned transactions and never holds keys, a compromise of Passify cannot
        move user funds. This boundary is structural, not a policy that can be toggled off.
      </Callout>

      <h2 id="report">Reporting a vulnerability</h2>
      <p>
        Report security issues to <a href={`mailto:${EMAIL.security}`}>{EMAIL.security}</a>. Include reproduction
        steps and the request ID from any relevant response. Please give us a reasonable window to remediate
        before public disclosure. See also the <Link href="/docs/production-checklist">production checklist</Link>.
      </p>
    </DocArticle>
  );
}
