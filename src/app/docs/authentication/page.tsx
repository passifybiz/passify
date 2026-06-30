import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/authentication" },
  title: "Authentication",
  description: "How to authenticate with the Passify API using bearer API keys, plus key rotation and hygiene.",
};

const toc = [
  { id: "api-keys", title: "API keys" },
  { id: "making-requests", title: "Making authenticated requests" },
  { id: "key-prefixes", title: "Key prefixes & identification" },
  { id: "rotation", title: "Rotation & revocation" },
  { id: "best-practices", title: "Best practices" },
];

export default function AuthenticationPage() {
  return (
    <DocArticle
      slug="/docs/authentication"
      title="Authentication"
      lead="Every request to the Passify API — except the public health check — is authenticated with an API key passed as a bearer token."
      toc={toc}
    >
      <h2 id="api-keys">API keys</h2>
      <p>
        Create and manage keys in the dashboard under <strong>Keys</strong>. Each key is scoped to a plan tier
        (Free, Pro, or Enterprise) and a monthly quota. A key can also be restricted to specific token
        configurations, so an integration only touches the assets it should.
      </p>
      <Callout tone="security">
        The full key is shown <strong>once</strong>, at creation. Passify stores only a SHA-256 hash of the key
        — we cannot recover or re-display it. If you lose a key, revoke it and create a new one.
      </Callout>

      <h2 id="making-requests">Making authenticated requests</h2>
      <p>
        Send the key in the <code>Authorization</code> header using the <code>Bearer</code> scheme. All traffic
        must use HTTPS.
      </p>
      <CodeBlock
        language="bash"
        code={`curl https://passify.biz/api/v1/kyc/status/7xKXtg2... \\
  -H "Authorization: Bearer passify_live_xxx"`}
      />
      <p>A missing or invalid key returns <code>401</code>:</p>
      <CodeBlock
        language="json"
        title="401 Unauthorized"
        code={`{
  "error": "unauthorized",
  "detail": "Missing or invalid API key.",
  "request_id": "a1b2c3d4"
}`}
      />

      <h2 id="key-prefixes">Key prefixes &amp; identification</h2>
      <p>
        Keys follow the pattern <code>passify_live_…</code>. The dashboard displays only the first characters
        (for example <code>passify_live_xK2m••••</code>) so you can identify a key without exposing it. The
        prefix is safe to log; the full key is not.
      </p>

      <h2 id="rotation">Rotation &amp; revocation</h2>
      <p>
        Rotate keys on a schedule and immediately whenever one may have leaked. Because each integration uses
        its own key, you can revoke a single compromised key without disrupting the others.
      </p>
      <ol>
        <li>Create a new key in the dashboard.</li>
        <li>Deploy it to the affected integration.</li>
        <li>Confirm traffic has moved to the new key (check <em>last used</em> in the dashboard).</li>
        <li>Revoke the old key.</li>
      </ol>

      <h2 id="best-practices">Best practices</h2>
      <ul>
        <li>Store keys in a secret manager or environment variables — never in source control or client code.</li>
        <li>Use a distinct key per environment (development, staging, production) and per integration.</li>
        <li>Scope keys to only the token configurations they need.</li>
        <li>Watch usage against your monthly quota; exceeding it returns <code>429</code>.</li>
      </ul>
      <Callout tone="tip">
        Treat an API key like a password. Anyone holding it can act as your platform against the Passify API.
        Review the <Link href="/docs/security">Security</Link> page before going to production.
      </Callout>
    </DocArticle>
  );
}
