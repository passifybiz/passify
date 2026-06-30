import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = { title: "Privacy Policy — Passify" };

export default function PrivacyPage() {
  return (
    <div className="page">
      <div className="container container--narrow" style={{ paddingTop: "80px" }}>
        <Link href="/" className="wordmark" style={{ fontSize: "16px", display: "inline-block", marginBottom: "32px" }}>Passify</Link>
        <h1 className="h2 mb-6">Privacy Policy</h1>
        <div className="stack" style={{ fontSize: "14px", lineHeight: "1.8" }}>
          <p className="help-text"><strong>Effective Date:</strong> June 25, 2026</p>

          <h2 className="h4">1. Overview</h2>
          <p>Passify ("we", "us") operates the identity and compliance infrastructure at passify.biz. This policy explains what data we collect, how we use it, and your rights.</p>

          <h2 className="h4">2. Data We Collect</h2>
          <p><strong>What we store:</strong></p>
          <ul style={{ paddingLeft: "20px", listStyle: "disc" }}>
            <li>Dashboard operator accounts: email, name, hashed password</li>
            <li>Solana public keys (not PII — publicly visible on-chain)</li>
            <li>Cryptographic attestation hashes (SHA-256 of KYC results)</li>
            <li>API key hashes and usage metadata</li>
            <li>Audit logs of compliance actions</li>
          </ul>
          <p><strong>What we do NOT store:</strong></p>
          <ul style={{ paddingLeft: "20px", listStyle: "disc" }}>
            <li>Personal identity documents</li>
            <li>Biometric data</li>
            <li>Government ID numbers</li>
            <li>Names or addresses of verified individuals</li>
          </ul>

          <h2 className="h4">3. Third-Party KYC Providers</h2>
          <p>Identity verification is performed by third-party providers (e.g., Blockpass). Personal data is submitted directly to these providers, never through Passify's servers. Please review their privacy policies for data handling details.</p>

          <h2 className="h4">4. How We Use Data</h2>
          <p>We use collected data to: (a) authenticate dashboard operators; (b) issue and verify onchain attestations; (c) enforce compliance rules; (d) maintain audit trails required by regulations; (e) detect abuse and enforce rate limits.</p>

          <h2 className="h4">5. Data Retention</h2>
          <p>Attestation records are retained for the lifetime of the attestation plus 7 years for regulatory compliance. Audit logs are retained indefinitely. Account data is retained until account deletion is requested.</p>

          <h2 className="h4">6. Security</h2>
          <p>We use encryption in transit (TLS), hashed credentials (bcrypt), session tokens (JWT with expiry and revocation), and role-based access controls.</p>

          <h2 className="h4">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have rights to access, correct, or delete your personal data. Contact <a href="mailto:privacy@passify.biz">privacy@passify.biz</a> with requests.</p>

          <h2 className="h4">8. Cookies</h2>
          <p>We use a single httpOnly session cookie for authentication. We do not use analytics cookies or third-party tracking.</p>

          <h2 className="h4">9. Changes</h2>
          <p>We will notify operators of material changes via email. Continued use after notification constitutes acceptance.</p>

          <h2 className="h4">10. Contact</h2>
          <p>Data protection inquiries: <a href="mailto:privacy@passify.biz">privacy@passify.biz</a></p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
