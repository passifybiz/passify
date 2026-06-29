export function CodeExample() {
  return (
    <section className="landing-section landing-section--alt">
      <div className="container">
        <h2 className="h2 landing-section__heading">Integrate in minutes</h2>
        <p className="landing-section__sub">
          A single API call to verify. A single call to check. That&apos;s it.
        </p>
        <div className="grid-3" style={{ alignItems: "start" }}>
          <div className="card card--pad" style={{ gridColumn: "span 2" }}>
            <p className="mono text-muted" style={{ fontSize: "11px", marginBottom: "12px" }}>Start a KYC session</p>
            <pre className="mono" style={{ fontSize: "12px", lineHeight: 1.7, overflowX: "auto", color: "var(--text)" }}>{`const res = await fetch("https://passify.biz/api/v1/kyc/start", {
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
// Redirect investor to session_url`}</pre>
          </div>
          <div className="stack" style={{ gap: "16px" }}>
            <div className="card card--pad">
              <p className="mono text-muted" style={{ fontSize: "11px", marginBottom: "8px" }}>Check status</p>
              <pre className="mono" style={{ fontSize: "12px", lineHeight: 1.7, overflowX: "auto", color: "var(--text)" }}>{`GET /api/v1/kyc/status/{pubkey}

{
  "status": "verified",
  "attestation_id": "att_...",
  "expires_at": "2027-01-15"
}`}</pre>
            </div>
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
