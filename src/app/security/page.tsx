import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = { title: "Security — Passify", alternates: { canonical: "/security" } };

export default function SecurityPage() {
  return (
    <div className="page">
      <div className="container" style={{ paddingTop: "80px", maxWidth: "800px" }}>
        <Link href="/" className="wordmark" style={{ fontSize: "16px", display: "inline-block", marginBottom: "32px" }}>Passify</Link>
        <h1 className="h2 mb-4">Security & Architecture</h1>
        <p className="help-text mb-6">How Passify handles data and what security controls are implemented.</p>

        <div className="stack" style={{ gap: "32px" }}>

          <section className="card card--pad">
            <h2 className="h4" style={{ marginBottom: "12px" }}>Data Architecture</h2>
            <p style={{ fontSize: "14px", lineHeight: 1.8, marginBottom: "12px" }}>
              Passify never stores, processes, or transmits personal identity data. The architecture is deliberately minimal:
            </p>
            <div style={{ background: "var(--surface)", borderRadius: "4px", padding: "20px", fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 2, overflowX: "auto" }}>
              <pre style={{ margin: 0 }}>{`┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Investor   │────▶│  KYC Provider │────▶│  Provider   │
│  (browser)  │     │  (Blockpass)  │     │  Database   │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │ webhook (approved/rejected)
                           ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   Passify    │────▶│   Solana     │
                    │   (server)   │     │  (on-chain)  │
                    └──────────────┘     └─────────────┘
                           │
                    Stores ONLY:
                    • SHA-256 hash of KYC result
                    • Solana public key
                    • Attestation metadata
                    • Expiration timestamp`}</pre>
            </div>
          </section>

          <section className="card card--pad">
            <h2 className="h4" style={{ marginBottom: "12px" }}>What We Store vs. What We Don't</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--success)", marginBottom: "8px" }}>We store</p>
                <ul style={{ fontSize: "13px", lineHeight: 1.8, paddingLeft: "16px" }}>
                  <li>Solana public keys</li>
                  <li>SHA-256 attestation hashes</li>
                  <li>On-chain transaction signatures</li>
                  <li>Compliance rule configurations</li>
                  <li>Audit logs of all actions</li>
                </ul>
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--error)", marginBottom: "8px" }}>We never store</p>
                <ul style={{ fontSize: "13px", lineHeight: 1.8, paddingLeft: "16px" }}>
                  <li>Names, addresses, DOBs</li>
                  <li>Government IDs or SSNs</li>
                  <li>Biometric data</li>
                  <li>Bank account details</li>
                  <li>Photos or document scans</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="card card--pad">
            <h2 className="h4" style={{ marginBottom: "12px" }}>Infrastructure Security</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px", lineHeight: 1.7 }}>
              <div><strong>Encryption</strong><br />TLS in transit (version depends on deployment). Encryption at rest depends on hosting provider configuration.</div>
              <div><strong>Authentication</strong><br />bcrypt passwords. JWT sessions with revocation.</div>
              <div><strong>Rate Limiting</strong><br />Redis-backed. Fail-closed in production.</div>
              <div><strong>Account Security</strong><br />Lockout after 10 failed attempts. Session revocation on password change.</div>
              <div><strong>API Keys</strong><br />SHA-256 hashed. Shown once. Monthly quota enforcement.</div>
              <div><strong>Audit Trail</strong><br />Every action logged with actor, timestamp, and before/after values.</div>
              <div><strong>Error Tracking</strong><br />Structured server-side logging with a unique request ID on every response.</div>
              <div><strong>Headers</strong><br />CSP, HSTS, X-Frame-Options, Permissions-Policy.</div>
            </div>
          </section>

          <section className="card card--pad">
            <h2 className="h4" style={{ marginBottom: "12px" }}>Compliance Posture</h2>
            <p style={{ fontSize: "14px", lineHeight: 1.8 }}>
              Passify is designed to support platforms subject to AML/KYC requirements without becoming a regulated entity itself. We do not process or store PII — the KYC provider (e.g., Blockpass) handles identity verification and data retention. Passify acts as an attestation layer, recording only the cryptographic proof that verification occurred.
            </p>
            <p style={{ fontSize: "14px", lineHeight: 1.8, marginTop: "12px" }}>
              This architecture means platforms using Passify do not need to store or process investor PII directly.
            </p>
          </section>

          <section className="card card--pad" style={{ background: "var(--primary-light)" }}>
            <h2 className="h4" style={{ marginBottom: "8px" }}>Questions?</h2>
            <p style={{ fontSize: "14px", lineHeight: 1.8 }}>
              For security inquiries, vulnerability reports, or compliance questionnaires: <a href="mailto:security@passify.biz">security@passify.biz</a>
            </p>
          </section>

        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
