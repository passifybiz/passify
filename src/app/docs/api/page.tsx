import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  title: "API reference",
  description: "Base URL, authentication, error format, rate limits, and conventions for the Passify REST API.",
};

const toc = [
  { id: "base-url", title: "Base URL" },
  { id: "auth", title: "Authentication" },
  { id: "errors", title: "Errors" },
  { id: "rate-limits", title: "Rate limits" },
  { id: "conventions", title: "Conventions" },
  { id: "endpoints", title: "Endpoint index" },
];

export default function ApiOverviewPage() {
  return (
    <DocArticle
      slug="/docs/api"
      title="API reference"
      lead="A small, predictable REST API. JSON in, JSON out, bearer-token auth, and a single error shape across every endpoint."
      toc={toc}
    >
      <h2 id="base-url">Base URL</h2>
      <CodeBlock language="text" code={`https://passify.biz/api/v1`} />

      <h2 id="auth">Authentication</h2>
      <p>
        Send your API key as a bearer token on every request except <code>/health</code>. See{" "}
        <Link href="/docs/authentication">Authentication</Link> for key management.
      </p>
      <CodeBlock language="bash" code={`Authorization: Bearer passify_live_xxx`} />

      <h2 id="errors">Errors</h2>
      <p>Every error uses the same shape. Include <code>request_id</code> when contacting support.</p>
      <CodeBlock
        language="json"
        code={`{
  "error": "error_code",
  "detail": "Human-readable description.",
  "request_id": "a1b2c3d4"
}`}
      />
      <table>
        <thead>
          <tr><th>Status</th><th>Meaning</th></tr>
        </thead>
        <tbody>
          <tr><td><code>400</code></td><td>Malformed request.</td></tr>
          <tr><td><code>401</code></td><td>Missing or invalid API key.</td></tr>
          <tr><td><code>403</code></td><td>Authenticated, but a compliance rule or attestation check failed.</td></tr>
          <tr><td><code>404</code></td><td>Resource not found.</td></tr>
          <tr><td><code>422</code></td><td>Validation failed (e.g. invalid public key).</td></tr>
          <tr><td><code>429</code></td><td>Monthly quota exceeded.</td></tr>
        </tbody>
      </table>

      <h2 id="rate-limits">Rate limits</h2>
      <table>
        <thead>
          <tr><th>Plan</th><th>Included attestations / month</th></tr>
        </thead>
        <tbody>
          <tr><td>Free</td><td>500</td></tr>
          <tr><td>Growth</td><td>10,000</td></tr>
          <tr><td>Enterprise</td><td>Custom</td></tr>
        </tbody>
      </table>
      <Callout tone="note">Exceeding your quota returns <code>429</code>. Usage resets monthly and is visible in the dashboard.</Callout>

      <h2 id="conventions">Conventions</h2>
      <ul>
        <li>All request and response bodies are JSON; send <code>Content-Type: application/json</code> on writes.</li>
        <li>Timestamps are UTC, ISO&nbsp;8601 (e.g. <code>2026-12-15T00:00:00Z</code>).</li>
        <li>Solana addresses and signatures are base58 strings.</li>
        <li>All traffic must use HTTPS; HSTS is enforced.</li>
      </ul>

      <h2 id="endpoints">Endpoint index</h2>
      <table>
        <thead>
          <tr><th>Group</th><th>Endpoints</th></tr>
        </thead>
        <tbody>
          <tr><td><Link href="/docs/api/kyc">KYC</Link></td><td><code>POST /kyc/start</code>, <code>GET /kyc/status/:pubkey</code>, <code>POST /kyc/webhook</code></td></tr>
          <tr><td><Link href="/docs/api/attestation">Attestation</Link></td><td><code>GET /attestation/:id</code></td></tr>
          <tr><td><Link href="/docs/api/token">Token</Link></td><td><code>POST /token/mint</code>, <code>POST /token/transfer</code></td></tr>
          <tr><td>Health</td><td><code>GET /health</code> (no auth)</td></tr>
        </tbody>
      </table>
    </DocArticle>
  );
}
