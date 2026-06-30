import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/production-checklist" },
  title: "Production checklist",
  description: "Everything to confirm before taking a Passify integration live on Solana mainnet.",
};

const toc = [
  { id: "keys", title: "Keys & secrets" },
  { id: "verification", title: "Verification flow" },
  { id: "compliance", title: "Compliance rules" },
  { id: "tokens", title: "Token operations" },
  { id: "resilience", title: "Resilience & monitoring" },
];

export default function ProductionChecklistPage() {
  return (
    <DocArticle
      slug="/docs/production-checklist"
      title="Production checklist"
      lead="A pre-launch checklist for going live on mainnet. Walk through each section and confirm every item before you route real users through your integration."
      toc={toc}
    >
      <Callout tone="tip">
        Treat this as a gate, not a guideline. Each item maps to a real failure mode that is cheap to prevent now
        and expensive to fix in production.
      </Callout>

      <h2 id="keys">Keys &amp; secrets</h2>
      <ul>
        <li>Production API keys are stored in a secret manager — never in source control or client code.</li>
        <li>Separate keys per environment and per integration; each scoped to only the token configs it needs.</li>
        <li>A documented <Link href="/docs/authentication">rotation</Link> procedure exists, with an owner.</li>
      </ul>

      <h2 id="verification">Verification flow</h2>
      <ul>
        <li>You request the correct <Link href="/docs/concepts/schemas">schema</Link> for each asset&apos;s requirements.</li>
        <li>Your UI handles every status: <code>pending</code>, <code>verified</code>, <code>rejected</code>, <code>expired</code>.</li>
        <li>Wallet addresses are validated client-side before calling the API.</li>
        <li>You re-check <code>expires_at</code> rather than caching an &ldquo;eligible&rdquo; flag.</li>
      </ul>

      <h2 id="compliance">Compliance rules</h2>
      <ul>
        <li>Each token config has a reviewed <Link href="/docs/concepts/compliance-rules">rule set</Link> (schema, jurisdictions, minimum, holder cap, lock).</li>
        <li>Dashboard access is restricted to compliance staff.</li>
        <li>You verified a rule change end-to-end against a known wallet and confirmed the audit-log entry.</li>
      </ul>

      <h2 id="tokens">Token operations</h2>
      <ul>
        <li>All three <code>403</code> reasons are handled explicitly: <code>attestation_required</code>, <code>attestation_expired</code>, <code>rule_violation</code>.</li>
        <li>Unsigned transactions are signed in the user&apos;s wallet, submitted, and confirmed before you update records.</li>
        <li>You never assume eligibility — the API performs the check at build time.</li>
      </ul>

      <h2 id="resilience">Resilience &amp; monitoring</h2>
      <ul>
        <li>You log <code>request_id</code> from API responses for support and tracing.</li>
        <li>You handle <code>429</code> (quota) and back off rather than hammering the API.</li>
        <li>You monitor usage against your plan quota and alert before you hit it.</li>
        <li>You have a runbook for KYC-provider or RPC degradation.</li>
      </ul>
      <Callout tone="security">
        Re-read the <Link href="/docs/security">Security</Link> page with your team before launch. Confirm no
        personal data is logged, cached, or forwarded anywhere in your own stack.
      </Callout>
    </DocArticle>
  );
}
