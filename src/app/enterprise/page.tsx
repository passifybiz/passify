import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = { title: "Enterprise — Passify" };

const FEATURES = [
  { title: "Unlimited attestations", desc: "No monthly caps. Scale to hundreds of thousands of investors without throttling." },
  { title: "Dedicated support engineer", desc: "Named contact who understands your integration. Response time SLA included." },
  { title: "Custom compliance rules", desc: "Jurisdiction-specific, asset-class-specific, and investor-tier-specific rule configurations." },
  { title: "White-glove onboarding", desc: "We set up your integration, configure rules, and run UAT alongside your team." },
  { title: "Compliance questionnaire support", desc: "We provide architecture documentation to assist with vendor security questionnaires." },
  { title: "SLA terms", desc: "Contractual uptime and incident response terms available for enterprise plans." },
];

export default function EnterprisePage() {
  return (
    <div className="page">
      <div className="container" style={{ paddingTop: "80px", maxWidth: "800px" }}>
        <Link href="/" className="wordmark" style={{ fontSize: "16px", display: "inline-block", marginBottom: "32px" }}>Passify</Link>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 className="h2" style={{ marginBottom: "12px" }}>Passify for Enterprise</h1>
          <p className="help-text" style={{ maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
            For regulated platforms that need contractual SLA terms, dedicated support, and integration assistance.
          </p>
        </div>

        <div className="grid-3" style={{ gap: "16px", marginBottom: "48px" }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card card--pad">
              <h3 className="h5" style={{ marginBottom: "4px" }}>{f.title}</h3>
              <p className="help-text" style={{ fontSize: "13px" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="card card--pad" style={{ background: "var(--primary-light)", textAlign: "center", padding: "40px" }}>
          <h2 className="h3" style={{ marginBottom: "8px" }}>Talk to our team</h2>
          <p className="help-text" style={{ marginBottom: "20px", maxWidth: "400px", margin: "0 auto 20px" }}>
            Tell us about your platform, your timeline, and your compliance requirements.
          </p>
          <a href="mailto:sales@passify.biz?subject=Enterprise%20inquiry" className="btn btn--primary btn--lg">Contact sales</a>
        </div>

        <div style={{ marginTop: "48px" }}>
          <h2 className="h4" style={{ marginBottom: "16px" }}>Common enterprise questions</h2>
          <div className="stack">
            <details className="card card--pad landing-faq">
              <summary className="h5">What data do you process?</summary>
              <p className="help-text">None. Passify stores only cryptographic hashes and public keys. Personal data is processed by the KYC provider (e.g., Blockpass) and never passes through our servers. See our <Link href="/security">security page</Link> for architecture details.</p>
            </details>
            <details className="card card--pad landing-faq">
              <summary className="h5">Can we run Passify on our own infrastructure?</summary>
              <p className="help-text">Yes. The application is containerized (Docker) and can be deployed in your VPC. Enterprise plans include deployment assistance.</p>
            </details>
            <details className="card card--pad landing-faq">
              <summary className="h5">What's your uptime track record?</summary>
              <p className="help-text">The platform targets high availability. Enterprise plans include contractual SLA terms. A health check endpoint is available at /api/health for monitoring.</p>
            </details>
            <details className="card card--pad landing-faq">
              <summary className="h5">How long does integration take?</summary>
              <p className="help-text">Integration scope depends on your platform's architecture. The API surface is three endpoints. Enterprise plans include onboarding assistance.</p>
            </details>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
