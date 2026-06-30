import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Endpoint } from "@/components/docs/endpoint";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/api/kyc" },
  title: "KYC API",
  description: "Start KYC sessions, read attestation status by wallet, and receive signed provider webhooks.",
};

const toc = [
  { id: "start", title: "Start a session" },
  { id: "status", title: "Get status" },
  { id: "webhook", title: "Provider webhook" },
];

export default function KycApiPage() {
  return (
    <DocArticle
      slug="/docs/api/kyc"
      title="KYC API"
      lead="Create verification sessions, read the resulting attestation status, and receive provider callbacks."
      toc={toc}
    >
      <h2 id="start">Start a session</h2>
      <Endpoint method="POST" path="/kyc/start" />
      <p>Creates a KYC session for a wallet and returns a hosted verification URL.</p>
      <h3>Request body</h3>
      <table>
        <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>userPubkey</code></td><td>string</td><td>Investor&apos;s Solana wallet (base58).</td></tr>
          <tr><td><code>schemaId</code></td><td>string</td><td><Link href="/docs/concepts/schemas">Schema</Link> to verify, e.g. <code>kyc_individual_v1</code>.</td></tr>
        </tbody>
      </table>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://passify.biz/api/v1/kyc/start \\
  -H "Authorization: Bearer passify_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{ "userPubkey": "7xKXtg2...", "schemaId": "kyc_individual_v1" }'`}
      />
      <CodeBlock
        language="json"
        title="200 OK"
        code={`{ "session_id": "sess_9x2k", "session_url": "https://verify.blockpass.org/..." }`}
      />

      <h2 id="status">Get status</h2>
      <Endpoint method="GET" path="/kyc/status/{pubkey}" />
      <p>Returns the current attestation status for a wallet.</p>
      <CodeBlock
        language="bash"
        code={`curl https://passify.biz/api/v1/kyc/status/7xKXtg2... \\
  -H "Authorization: Bearer passify_live_xxx"`}
      />
      <CodeBlock
        language="json"
        title="200 OK"
        code={`{
  "status": "verified",
  "attestation_id": "att_5m8n",
  "schema": "kyc_individual_v1",
  "expires_at": "2026-12-15T00:00:00Z",
  "onchain_tx": "3kLm...xyz"
}`}
      />
      <p><code>status</code> is one of <code>pending</code>, <code>verified</code>, <code>rejected</code>, or <code>expired</code>.</p>

      <h2 id="webhook">Provider webhook</h2>
      <Endpoint method="POST" path="/kyc/webhook" auth="HMAC signature" />
      <p>
        Called by the KYC provider when a verification completes. Passify validates the HMAC signature before
        processing — an unsigned or mismatched payload is rejected and never acted upon.
      </p>
      <Callout tone="security">
        This endpoint is for the provider, not your application. You never call it directly. Signature
        validation is mandatory; there is no unauthenticated path to write an attestation.
      </Callout>
    </DocArticle>
  );
}
