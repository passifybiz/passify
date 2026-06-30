import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";
import { EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Troubleshooting",
  description: "Common Passify API errors and how to resolve them, from 401s to compliance 403s.",
};

const toc = [
  { id: "auth", title: "Authentication" },
  { id: "validation", title: "Validation" },
  { id: "compliance", title: "Compliance" },
  { id: "limits", title: "Rate limits" },
  { id: "support", title: "Still stuck?" },
];

export default function TroubleshootingPage() {
  return (
    <DocArticle
      slug="/docs/troubleshooting"
      title="Troubleshooting"
      lead="The fastest fixes for the errors you are most likely to hit. Every API error includes a request_id — keep it; it makes support instant."
      toc={toc}
    >
      <h2 id="auth">Authentication</h2>
      <table>
        <thead><tr><th>Symptom</th><th>Likely cause &amp; fix</th></tr></thead>
        <tbody>
          <tr><td><code>401 unauthorized</code></td><td>Missing, malformed, or revoked key. Confirm the <code>Authorization: Bearer …</code> header and that the key is active in the dashboard.</td></tr>
          <tr><td>Worked, then stopped</td><td>The key may have been rotated or revoked. Check <em>last used</em> and deploy the current key.</td></tr>
        </tbody>
      </table>

      <h2 id="validation">Validation</h2>
      <table>
        <thead><tr><th>Symptom</th><th>Likely cause &amp; fix</th></tr></thead>
        <tbody>
          <tr><td><code>422</code> on <code>/kyc/start</code></td><td>Invalid <code>userPubkey</code>. Validate it is a correct base58 Solana address before calling.</td></tr>
          <tr><td><code>400</code></td><td>Malformed JSON or missing field. Send <code>Content-Type: application/json</code> and check the body shape in the <Link href="/docs/api">API reference</Link>.</td></tr>
          <tr><td><code>404</code> on attestation</td><td>Unknown ID, or the wallet was never verified. Confirm with <code>GET /kyc/status/:pubkey</code> first.</td></tr>
        </tbody>
      </table>

      <h2 id="compliance">Compliance</h2>
      <table>
        <thead><tr><th>Error</th><th>Resolution</th></tr></thead>
        <tbody>
          <tr><td><code>attestation_required</code></td><td>The wallet has no valid attestation. Run <Link href="/docs/guides/verify-investor">verification</Link> first.</td></tr>
          <tr><td><code>attestation_expired</code></td><td>Start a new KYC session to renew the attestation.</td></tr>
          <tr><td><code>rule_violation</code></td><td>Read <code>detail</code> — it names the failed rule (e.g. <code>min_investment_usd_100</code>) — and adjust the request or the <Link href="/docs/concepts/compliance-rules">rule</Link>.</td></tr>
        </tbody>
      </table>

      <h2 id="limits">Rate limits</h2>
      <p>
        A <code>429</code> means you exceeded your monthly quota. Back off, check usage in the dashboard, and
        upgrade your plan if you need more headroom. See <Link href="/docs/api">rate limits</Link>.
      </p>

      <h2 id="support">Still stuck?</h2>
      <Callout tone="note">
        Email <a href={`mailto:${EMAIL.support}`}>{EMAIL.support}</a> with the <code>request_id</code> from the
        failing response and a short description. The request ID lets us trace the exact call without you sharing
        any sensitive data.
      </Callout>
    </DocArticle>
  );
}
