import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/quickstart" },
  title: "Quickstart",
  description: "Verify an investor and read their attestation with the Passify API in about five minutes.",
};

const toc = [
  { id: "prerequisites", title: "Prerequisites" },
  { id: "1-authenticate", title: "1. Authenticate" },
  { id: "2-start-kyc", title: "2. Start a KYC session" },
  { id: "3-redirect", title: "3. Redirect the investor" },
  { id: "4-check-status", title: "4. Check attestation status" },
  { id: "next-steps", title: "Next steps" },
];

export default function QuickstartPage() {
  return (
    <DocArticle
      slug="/docs/quickstart"
      title="Quickstart"
      lead="Go from zero to a verified, portable attestation in four requests. This walkthrough uses cURL; the same calls work from any HTTP client."
      toc={toc}
    >
      <h2 id="prerequisites">Prerequisites</h2>
      <ul>
        <li>A Passify account and an API key (create one in the dashboard under <strong>Keys</strong>).</li>
        <li>The investor&apos;s Solana wallet address (a base58 public key).</li>
        <li>Any HTTP client — cURL, Postman, or your backend language of choice.</li>
      </ul>
      <Callout tone="note">
        The base URL for all requests is <code>https://passify.biz/api/v1</code>. Every endpoint except{" "}
        <code>/health</code> requires authentication.
      </Callout>

      <h2 id="1-authenticate">1. Authenticate</h2>
      <p>
        Pass your API key as a bearer token in the <code>Authorization</code> header. Keys are shown once at
        creation — store them in a secret manager, never in client-side code.
      </p>
      <CodeBlock
        language="bash"
        code={`curl https://passify.biz/api/v1/health \\
  -H "Authorization: Bearer passify_live_xxx"`}
      />

      <h2 id="2-start-kyc">2. Start a KYC session</h2>
      <p>
        Create a verification session for the investor&apos;s wallet. Choose the schema that matches what you
        need to prove — <code>kyc_individual_v1</code> for basic identity, <code>kyc_accredited_v1</code> for
        accredited-investor checks.
      </p>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://passify.biz/api/v1/kyc/start \\
  -H "Authorization: Bearer passify_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userPubkey": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "schemaId": "kyc_individual_v1"
  }'`}
      />
      <p>The response contains a hosted verification URL:</p>
      <CodeBlock
        language="json"
        title="200 OK"
        code={`{
  "session_id": "sess_9x2k",
  "session_url": "https://verify.blockpass.org/..."
}`}
      />

      <h2 id="3-redirect">3. Redirect the investor</h2>
      <p>
        Send the investor to <code>session_url</code>. They complete identity verification with our KYC partner
        — uploading documents and a selfie. That data goes to the provider, never to Passify. When verification
        finishes, the provider notifies Passify by webhook and an attestation is written on-chain.
      </p>
      <Callout tone="tip">
        You do not need to poll while the investor verifies. Check status when they return to your app, or wire
        your own callback. Median time from start to on-chain attestation is under 90 seconds.
      </Callout>

      <h2 id="4-check-status">4. Check attestation status</h2>
      <p>Read verification status for the wallet at any time:</p>
      <CodeBlock
        language="bash"
        code={`curl https://passify.biz/api/v1/kyc/status/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU \\
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
      <p>
        That attestation is now portable. Any platform integrated with Passify can read the same proof for this
        wallet — no repeat KYC.
      </p>

      <h2 id="next-steps">Next steps</h2>
      <ul>
        <li><Link href="/docs/concepts/attestations">Understand attestations</Link> — what the proof contains and how long it lasts.</li>
        <li><Link href="/docs/guides/mint-and-transfer">Mint &amp; transfer tokens</Link> — gate token operations on a valid attestation.</li>
        <li><Link href="/docs/api/kyc">KYC API reference</Link> — full request and response details.</li>
      </ul>
    </DocArticle>
  );
}
