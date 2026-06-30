import { TerminalBoot } from "./terminal-boot";
import { CodeBlock } from "@/components/docs/code-block";

const START_SNIPPET = `const res = await fetch("https://passify.biz/api/v1/kyc/start", {
  method: "POST",
  headers: {
    "Authorization": "Bearer passify_live_abc123...",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    userPubkey: wallet.publicKey.toBase58(),
    schemaId: "kyc_individual_v1"
  })
});

const { session_url } = await res.json();
// Redirect investor to session_url`;

const STATUS_SNIPPET = `GET /api/v1/kyc/status/{pubkey}

{
  "status": "verified",
  "attestation_id": "att_...",
  "expires_at": "2027-01-15"
}`;

export function CodeExample() {
  return (
    <section className="landing-section landing-section--alt">
      <div className="container">
        <h2 className="h2 landing-section__heading">Integrate in minutes</h2>
        <p className="landing-section__sub">
          A single API call to verify. A single call to check. That&apos;s it.
        </p>
        <div style={{ marginBottom: "48px" }}>
          <TerminalBoot />
        </div>
        <div className="grid-3" style={{ alignItems: "start" }}>
          <div style={{ gridColumn: "span 2" }}>
            <CodeBlock title="Start a KYC session" language="javascript" code={START_SNIPPET} />
          </div>
          <div className="stack" style={{ gap: "16px" }}>
            <CodeBlock title="Check status" language="http" code={STATUS_SNIPPET} />
            <div className="card card--pad" style={{ background: "var(--primary-light)" }}>
              <p className="h5" style={{ marginBottom: "4px" }}>3 endpoints</p>
              <p className="help-text">Start KYC, check status, gate tokens. No SDK required — just REST.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
