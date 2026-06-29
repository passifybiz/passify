import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "API Documentation — Passify" };

const ENDPOINTS = [
  { method: "POST", path: "/api/v1/kyc/start", auth: "API Key", desc: "Start a KYC verification session for an investor.", body: '{ "userPubkey": "7xKX...", "schemaId": "kyc_individual_v1" }', response: '{ "session_id": "bp_...", "session_url": "https://verify.blockpass.org/..." }' },
  { method: "GET", path: "/api/v1/kyc/status/{pubkey}", auth: "API Key", desc: "Check attestation status for a public key.", body: null, response: '{ "status": "verified", "attestation_id": "att_...", "schema": "kyc_individual_v1", "expires_at": "..." }' },
  { method: "GET", path: "/api/v1/attestation/{id}", auth: "API Key", desc: "Get full attestation details by ID.", body: null, response: '{ "attestation_id": "att_...", "schema": "...", "status": "verified", "onchain_tx": "..." }' },
  { method: "POST", path: "/api/v1/token/mint", auth: "API Key", desc: "Build an unsigned mint transaction (requires valid attestation).", body: '{ "user_pubkey": "...", "mint_config": "us_real_estate_fund_v1", "amount": "1000" }', response: '{ "status": "success", "unsigned_transaction_base64": "..." }' },
  { method: "POST", path: "/api/v1/token/transfer", auth: "API Key", desc: "Build an unsigned transfer transaction (requires sender attestation).", body: '{ "mint_config": "...", "sender": "...", "recipient": "...", "amount": "500" }', response: '{ "status": "success", "unsigned_transaction_base64": "..." }' },
  { method: "GET", path: "/api/v1/health", auth: "None", desc: "Health check endpoint.", body: null, response: '{ "status": "healthy", "checks": { "database": "ok", "redis": "ok" } }' },
];

export default function DocsPage() {
  return (
    <div className="page">
      <div className="container" style={{ paddingTop: "80px", maxWidth: "800px" }}>
        <Link href="/" className="wordmark" style={{ fontSize: "16px", display: "inline-block", marginBottom: "32px" }}>Passify</Link>
        <h1 className="h2 mb-4">API Documentation</h1>
        <p className="help-text mb-6">Base URL: <code className="mono">https://passify.biz/api/v1</code></p>

        <div className="card card--pad mb-6">
          <h2 className="h4 mb-2">Authentication</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7 }}>
            All API endpoints (except health) require a Bearer token:
          </p>
          <pre className="mono" style={{ background: "var(--surface)", padding: "12px", borderRadius: "4px", fontSize: "13px", marginTop: "8px", overflowX: "auto" }}>
{`Authorization: Bearer passify_live_abc123...`}
          </pre>
          <p className="help-text mt-3">API keys are created from the dashboard under Keys. The full key is shown once at creation.</p>
        </div>

        <div className="card card--pad mb-6">
          <h2 className="h4 mb-2">Error Format</h2>
          <pre className="mono" style={{ background: "var(--surface)", padding: "12px", borderRadius: "4px", fontSize: "13px", overflowX: "auto" }}>
{`{ "error": "error_code", "detail": "Human description.", "request_id": "a1b2c3d4" }`}
          </pre>
          <p className="help-text mt-3">Include the <code className="mono">request_id</code> when contacting support.</p>
        </div>

        <h2 className="h3 mb-4">Endpoints</h2>

        {ENDPOINTS.map((ep) => (
          <div key={ep.path} className="card card--pad mb-4">
            <div className="row" style={{ gap: "8px", marginBottom: "8px" }}>
              <span className="mono" style={{ fontSize: "12px", fontWeight: 700, color: ep.method === "GET" ? "var(--primary)" : "var(--warning)", background: "var(--surface)", padding: "2px 6px", borderRadius: "3px" }}>{ep.method}</span>
              <code className="mono" style={{ fontSize: "13px" }}>{ep.path}</code>
            </div>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>{ep.desc}</p>
            <p className="text-muted text-xs" style={{ marginBottom: "8px" }}>Auth: {ep.auth}</p>
            {ep.body && (
              <>
                <p className="text-xs text-muted" style={{ marginBottom: "4px" }}>Request body:</p>
                <pre className="mono" style={{ background: "var(--surface)", padding: "8px", borderRadius: "4px", fontSize: "12px", overflowX: "auto", marginBottom: "8px" }}>{ep.body}</pre>
              </>
            )}
            <p className="text-xs text-muted" style={{ marginBottom: "4px" }}>Response:</p>
            <pre className="mono" style={{ background: "var(--surface)", padding: "8px", borderRadius: "4px", fontSize: "12px", overflowX: "auto" }}>{ep.response}</pre>
          </div>
        ))}

        <div className="card card--pad mt-6" style={{ background: "var(--primary-light)" }}>
          <h3 className="h5">Rate Limits</h3>
          <p style={{ fontSize: "14px", marginTop: "8px", lineHeight: 1.7 }}>
            <strong>Free:</strong> 500 attestations/month<br />
            <strong>Pro:</strong> 10,000 attestations/month<br />
            <strong>Enterprise:</strong> Unlimited
          </p>
          <p className="help-text mt-2">Exceeding your quota returns HTTP 429.</p>
        </div>
      </div>
    </div>
  );
}
