import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/faq" },
  title: "FAQ",
  description: "Frequently asked questions about Passify: privacy, portability, compliance, and integration.",
};

const toc = [
  { id: "product", title: "Product" },
  { id: "privacy", title: "Privacy & data" },
  { id: "integration", title: "Integration" },
];

function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="def-list__row">
      <p className="def-list__term">{q}</p>
      <div className="def-list__def">{children}</div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <DocArticle
      slug="/docs/faq"
      title="FAQ"
      lead="Short answers to the questions teams ask most often. For token-specific questions, see the dedicated token FAQ."
      toc={toc}
    >
      <h2 id="product">Product</h2>
      <div className="def-list">
        <QA q="What does Passify actually do?">
          It turns a one-time KYC check into a portable, on-chain <Link href="/docs/concepts/attestations">attestation</Link>, then enforces per-asset <Link href="/docs/concepts/compliance-rules">compliance rules</Link> at mint and transfer time.
        </QA>
        <QA q="Do I need to deploy a smart contract?">
          No. Attestations use an existing attestation program and tokens use Token-2022 over RPC. There is no custom program to deploy or maintain.
        </QA>
        <QA q="What is an attestation valid for?">
          Until its <code>expires_at</code> timestamp. After that, token operations are refused until the wallet re-verifies.
        </QA>
      </div>

      <h2 id="privacy">Privacy &amp; data</h2>
      <div className="def-list">
        <QA q="Does any personal data go on-chain?">
          No. The on-chain record is a SHA-256 hash plus metadata (wallet, schema, expiry, attester). Identity data stays with the KYC provider. See <Link href="/docs/security">Security</Link>.
        </QA>
        <QA q="Can the hash be reversed into identity data?">
          No. SHA-256 is one-way. The hash proves a verification happened; it reveals nothing about who the investor is.
        </QA>
        <QA q="Who holds the investor's documents?">
          The KYC provider (for example Blockpass), under its own retention policy. Passify never receives them.
        </QA>
      </div>

      <h2 id="integration">Integration</h2>
      <div className="def-list">
        <QA q="How do users sign transactions?">
          Passify returns an <em>unsigned</em> transaction. The user signs it in their own wallet; Passify never holds keys. See the <Link href="/docs/guides/mint-and-transfer">mint &amp; transfer guide</Link>.
        </QA>
        <QA q="Can one attestation work across platforms?">
          Yes — that is the point. Any integrated platform can read the same attestation for a wallet with one <code>GET /kyc/status/:pubkey</code> call.
        </QA>
        <QA q="What happens when I exceed my quota?">
          Requests return <code>429</code>. Usage resets monthly and is visible in the dashboard. See <Link href="/docs/api">rate limits</Link>.
        </QA>
      </div>
    </DocArticle>
  );
}
