import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/guides/webhooks" },
  title: "Receive webhooks",
  description: "Subscribe to Passify events, verify HMAC-SHA256 signatures, protect against replays, and handle retries.",
};

const toc = [
  { id: "events", title: "Supported events" },
  { id: "setup", title: "Create an endpoint" },
  { id: "payload", title: "Payload & headers" },
  { id: "verify", title: "Verifying signatures" },
  { id: "replay", title: "Replay protection" },
  { id: "retries", title: "Retry behavior" },
];

export default function WebhooksGuidePage() {
  return (
    <DocArticle
      slug="/docs/guides/webhooks"
      title="Receive webhooks"
      lead="Passify can POST signed events to your server when attestations, KYC sessions, or compliance rules change — so you react in real time instead of polling."
      toc={toc}
    >
      <h2 id="events">Supported events</h2>
      <table>
        <thead><tr><th>Event</th><th>Fires when</th></tr></thead>
        <tbody>
          <tr><td><code>attestation.issued</code></td><td>A new on-chain attestation is issued for a wallet.</td></tr>
          <tr><td><code>attestation.expiring</code></td><td>An attestation is within its expiry window and should be renewed.</td></tr>
          <tr><td><code>kyc.status_changed</code></td><td>A KYC session changes status (approved, rejected, expired).</td></tr>
          <tr><td><code>rule.updated</code></td><td>A compliance rule for a mint configuration is changed.</td></tr>
        </tbody>
      </table>

      <h2 id="setup">Create an endpoint</h2>
      <p>
        In the dashboard under <strong>Webhooks</strong>, add your receiver URL and select the events to
        subscribe to. Passify generates a <strong>signing secret</strong> (<code>whsec_…</code>) shown once —
        store it securely; you use it to verify every delivery.
      </p>

      <h2 id="payload">Payload &amp; headers</h2>
      <p>Each delivery is a JSON POST with these headers:</p>
      <table>
        <thead><tr><th>Header</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td><code>Passify-Signature</code></td><td><code>t=&lt;unix&gt;,v1=&lt;hex hmac-sha256&gt;</code></td></tr>
          <tr><td><code>Passify-Event-Id</code></td><td>Unique event id (<code>evt_…</code>) — use for idempotency.</td></tr>
          <tr><td><code>Passify-Event-Type</code></td><td>e.g. <code>attestation.issued</code></td></tr>
          <tr><td><code>Passify-Timestamp</code></td><td>Unix seconds when signed.</td></tr>
        </tbody>
      </table>
      <CodeBlock
        language="json"
        title="Example body"
        code={`{
  "id": "evt_lm3k_9f2a",
  "type": "attestation.issued",
  "created_at": "2026-06-30T12:00:00.000Z",
  "data": {
    "attestation_id": "att_lm3k_9f2a",
    "user_pubkey": "7xKXtg2...",
    "schema": "kyc_individual_v1",
    "expires_at": "2027-01-15T00:00:00.000Z"
  }
}`}
      />

      <h2 id="verify">Verifying signatures</h2>
      <p>
        The signed payload is <code>{`${"{t}"}.${"{raw body}"}`}</code>, HMAC-SHA256 with your signing secret.
        Always verify against the <strong>raw request body</strong> (do not re-serialize JSON).
      </p>

      <p><strong>TypeScript / JavaScript (SDK)</strong></p>
      <CodeBlock
        language="typescript"
        code={`import { webhooks } from "@passify/sdk";

// rawBody is the exact string you received
const ok = await webhooks.verifySignature({
  secret: process.env.PASSIFY_WEBHOOK_SECRET!,
  payload: rawBody,
  signature: req.headers["passify-signature"],
});
if (!ok) return res.status(400).end("invalid signature");`}
      />

      <p><strong>Node (no SDK)</strong></p>
      <CodeBlock
        language="javascript"
        code={`import crypto from "node:crypto";

function verify(secret, rawBody, header, toleranceSec = 300) {
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=")));
  const t = Number(parts.t);
  if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac("sha256", secret).update(\`\${t}.\${rawBody}\`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(parts.v1, "hex"));
}`}
      />

      <p><strong>curl (compute the comparison locally)</strong></p>
      <CodeBlock
        language="bash"
        code={`# Given the raw body in body.json and t from the Passify-Timestamp header:
printf '%s.%s' "$T" "$(cat body.json)" \\
  | openssl dgst -sha256 -hmac "$PASSIFY_WEBHOOK_SECRET" -hex`}
      />

      <p><strong>Python</strong></p>
      <CodeBlock
        language="python"
        code={`import hmac, hashlib, time

def verify(secret: str, raw_body: bytes, header: str, tolerance=300) -> bool:
    parts = dict(p.split("=", 1) for p in header.split(","))
    t = int(parts["t"])
    if abs(time.time() - t) > tolerance:
        return False
    expected = hmac.new(secret.encode(), f"{t}.".encode() + raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, parts["v1"])`}
      />

      <p><strong>Go</strong></p>
      <CodeBlock
        language="go"
        code={`func Verify(secret, rawBody, header string, tolerance int64) bool {
    parts := map[string]string{}
    for _, kv := range strings.Split(header, ",") {
        p := strings.SplitN(kv, "=", 2)
        parts[p[0]] = p[1]
    }
    t, _ := strconv.ParseInt(parts["t"], 10, 64)
    if abs(time.Now().Unix()-t) > tolerance {
        return false
    }
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write([]byte(fmt.Sprintf("%d.%s", t, rawBody)))
    expected := hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(expected), []byte(parts["v1"]))
}`}
      />

      <h2 id="replay">Replay protection</h2>
      <ul>
        <li>Reject deliveries whose <code>Passify-Timestamp</code> is outside a tolerance window (default 5 minutes) — shown in every example above.</li>
        <li>Deduplicate on <code>Passify-Event-Id</code>: store processed ids and ignore repeats. Deliveries can legitimately be retried, so your handler must be idempotent.</li>
        <li>Always return <code>2xx</code> quickly once you have stored the event; do heavy work asynchronously.</li>
      </ul>
      <Callout tone="security">Verify the signature against the <strong>raw</strong> body bytes. Frameworks that auto-parse JSON can change the bytes and break verification — capture the raw body first.</Callout>

      <h2 id="retries">Retry behavior</h2>
      <p>
        Passify makes immediate inline attempts on each event. Failed deliveries are scheduled with
        exponential backoff (10s, 20s, 40s, … capped at 1h) up to six attempts. You can also replay any
        delivery manually from the dashboard.
      </p>
      <Callout tone="note">
        A <code>2xx</code> response marks a delivery successful. Any other status (or a timeout) is retried
        until it succeeds or attempts are exhausted, after which the delivery is marked failed and can be
        replayed.
      </Callout>
    </DocArticle>
  );
}
