import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/guides/verify-investor" },
  title: "Verify an investor",
  description: "Run a complete KYC session end to end and confirm the resulting on-chain attestation.",
};

const toc = [
  { id: "scenario", title: "Scenario" },
  { id: "start", title: "Start the session" },
  { id: "hand-off", title: "Hand off to the investor" },
  { id: "confirm", title: "Confirm the attestation" },
  { id: "handle-states", title: "Handle every state" },
];

export default function VerifyInvestorGuide() {
  return (
    <DocArticle
      slug="/docs/guides/verify-investor"
      title="Verify an investor"
      lead="A complete, production-shaped walkthrough of verifying one investor — from creating the session to confirming the attestation and handling rejections."
      toc={toc}
    >
      <h2 id="scenario">Scenario</h2>
      <p>
        A new investor connects their wallet to your platform and wants to buy into an accredited-only offering.
        You need an <code>kyc_accredited_v1</code> <Link href="/docs/concepts/attestations">attestation</Link>{" "}
        before any token operation is allowed.
      </p>

      <h2 id="start">Start the session</h2>
      <p>Create a verification session for the wallet, requesting the accredited schema:</p>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://passify.biz/api/v1/kyc/start \\
  -H "Authorization: Bearer passify_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userPubkey": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "schemaId": "kyc_accredited_v1"
  }'`}
      />
      <CodeBlock
        language="json"
        title="200 OK"
        code={`{ "session_id": "sess_9x2k", "session_url": "https://verify.blockpass.org/..." }`}
      />
      <Callout tone="warning">
        Validate the wallet address before calling the API. A malformed base58 key returns <code>422</code>;
        catching it client-side gives the investor a faster, clearer error.
      </Callout>

      <h2 id="hand-off">Hand off to the investor</h2>
      <p>
        Redirect the investor to <code>session_url</code>, or open it in a new tab. They verify with the KYC
        provider directly — documents and selfie go to the provider, never to Passify or to you. On approval,
        the provider posts a signed webhook to Passify and the attestation is written on-chain automatically.
      </p>

      <h2 id="confirm">Confirm the attestation</h2>
      <p>When the investor returns, read status for the wallet:</p>
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
  "schema": "kyc_accredited_v1",
  "expires_at": "2026-12-15T00:00:00Z",
  "onchain_tx": "3kLm...xyz"
}`}
      />

      <h2 id="handle-states">Handle every state</h2>
      <p>A robust integration handles all outcomes, not just the happy path:</p>
      <table>
        <thead>
          <tr><th><code>status</code></th><th>What it means</th><th>What to do</th></tr>
        </thead>
        <tbody>
          <tr><td><code>pending</code></td><td>Verification not finished.</td><td>Ask the investor to complete it; re-check later.</td></tr>
          <tr><td><code>verified</code></td><td>Attestation issued and valid.</td><td>Proceed to <Link href="/docs/guides/mint-and-transfer">mint or transfer</Link>.</td></tr>
          <tr><td><code>rejected</code></td><td>Provider declined the check.</td><td>Inform the investor; no attestation is written.</td></tr>
          <tr><td><code>expired</code></td><td>Attestation lapsed.</td><td>Start a new session to renew.</td></tr>
        </tbody>
      </table>
      <Callout tone="tip">
        Show the investor the same state your backend sees. Surfacing &ldquo;pending&rdquo; versus
        &ldquo;rejected&rdquo; honestly avoids support tickets and re-verification loops.
      </Callout>
    </DocArticle>
  );
}
