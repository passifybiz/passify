import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = { title: "Terms of Service — Passify" };

export default function TermsPage() {
  return (
    <div className="page">
      <div className="container container--narrow" style={{ paddingTop: "80px" }}>
        <Link href="/" className="wordmark" style={{ fontSize: "16px", display: "inline-block", marginBottom: "32px" }}>Passify</Link>
        <h1 className="h2 mb-6">Terms of Service</h1>
        <div className="stack" style={{ fontSize: "14px", lineHeight: "1.8" }}>
          <p className="help-text"><strong>Effective Date:</strong> June 25, 2026</p>

          <h2 className="h4">1. Acceptance of Terms</h2>
          <p>By accessing or using the Passify platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

          <h2 className="h4">2. Service Description</h2>
          <p>Passify provides an API-first identity verification and compliance layer for Solana-based real-world asset (RWA) platforms. The Service includes identity attestation, compliance rule management, and token operation gating.</p>

          <h2 className="h4">3. Eligibility</h2>
          <p>You must be at least 18 years old and have the legal capacity to enter into agreements. The Service is available only to businesses and authorized operators, not individual consumers.</p>

          <h2 className="h4">4. Account Responsibilities</h2>
          <p>You are responsible for maintaining the security of your credentials and API keys. Notify us immediately of any unauthorized access. You are liable for all activity under your account.</p>

          <h2 className="h4">5. Acceptable Use</h2>
          <p>You shall not: (a) use the Service for unlawful purposes; (b) attempt to circumvent rate limits or security controls; (c) reverse-engineer the Service; (d) submit false identity information; (e) redistribute API access without authorization.</p>

          <h2 className="h4">6. Data Handling</h2>
          <p>Passify does not store personal identity data. KYC data is processed by third-party verification providers. Passify stores only cryptographic hashes and attestation metadata. See our <Link href="/privacy" className="btn btn--link" style={{ fontSize: "inherit" }}>Privacy Policy</Link> for details.</p>

          <h2 className="h4">7. API Usage & Rate Limits</h2>
          <p>API access is subject to the rate limits and quotas of your plan tier. Exceeding limits may result in temporary or permanent restriction of access.</p>

          <h2 className="h4">8. Disclaimer of Warranties</h2>
          <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. PASSIFY DOES NOT GUARANTEE UNINTERRUPTED ACCESS, DATA ACCURACY, OR FITNESS FOR A PARTICULAR PURPOSE.</p>

          <h2 className="h4">9. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, PASSIFY SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM USE OF THE SERVICE.</p>

          <h2 className="h4">10. Termination</h2>
          <p>We may suspend or terminate access at any time for violation of these terms. Upon termination, your API keys are revoked and attestation read access is removed.</p>

          <h2 className="h4">11. Changes to Terms</h2>
          <p>We may update these terms with 30 days notice via email or dashboard notification. Continued use constitutes acceptance.</p>

          <h2 className="h4">12. Contact</h2>
          <p>Questions about these terms: <a href="mailto:legal@passify.biz">legal@passify.biz</a></p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
