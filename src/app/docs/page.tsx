import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs" },
  title: "Introduction",
  description:
    "What Passify is, the problems it solves, and how identity attestations and compliance rules fit together for Solana RWA platforms.",
};

const toc = [
  { id: "what-is-passify", title: "What is Passify" },
  { id: "who-its-for", title: "Who it is for" },
  { id: "the-model", title: "The mental model" },
  { id: "start-here", title: "Start here" },
];

export default function DocsIntroPage() {
  return (
    <DocArticle
      slug="/docs"
      title="Introduction"
      lead="Passify is an API-first identity and compliance layer for Solana real-world-asset platforms. Verify an investor once, then let that proof travel across every integrated platform — without ever putting personal data on-chain."
      toc={toc}
    >
      <h2 id="what-is-passify">What is Passify</h2>
      <p>
        Tokenizing real-world assets on Solana means meeting real-world compliance rules: know-your-customer
        (KYC) checks, jurisdiction limits, accreditation requirements, and holding periods. Building that logic
        from scratch is slow, and getting it wrong is expensive.
      </p>
      <p>Passify removes three connected frictions that every RWA team runs into:</p>
      <ul>
        <li>
          <strong>KYC is repeated per platform.</strong> An investor verifies on one platform, then has to
          start over on the next. Passify makes verification portable.
        </li>
        <li>
          <strong>On-chain KYC is a liability.</strong> Storing names, dates of birth, or document scans on a
          public ledger is illegal in most jurisdictions. Passify writes only a hash and metadata — never
          personal data.
        </li>
        <li>
          <strong>Compliance logic is hardcoded.</strong> When rules live inside a smart contract, changing one
          means redeploying. Passify keeps rules in a database and checks them at transaction time.
        </li>
      </ul>

      <h2 id="who-its-for">Who it is for</h2>
      <table>
        <thead>
          <tr>
            <th>Audience</th>
            <th>What Passify gives them</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>RWA platform developers</td>
            <td>A drop-in REST API to add KYC and compliance without writing or deploying a custom program.</td>
          </tr>
          <tr>
            <td>Issuers</td>
            <td>Configurable investor rules — jurisdiction, accreditation, minimum investment, holder caps.</td>
          </tr>
          <tr>
            <td>Investors</td>
            <td>Verify once, then access multiple platforms with the same portable attestation.</td>
          </tr>
          <tr>
            <td>Compliance officers</td>
            <td>A dashboard to view attestation status and a full audit trail of every rule change.</td>
          </tr>
        </tbody>
      </table>

      <h2 id="the-model">The mental model</h2>
      <p>Three primitives carry the entire system. Learn these and the rest of the docs follow naturally.</p>
      <ul>
        <li>
          <strong><Link href="/docs/concepts/attestations">Attestations</Link></strong> — a portable, on-chain
          proof that a wallet passed verification. Contains a hash and metadata, never PII.
        </li>
        <li>
          <strong><Link href="/docs/concepts/schemas">Schemas</Link></strong> — the type of an attestation
          (for example <code>kyc_individual_v1</code> or <code>kyc_accredited_v1</code>), describing what was
          verified.
        </li>
        <li>
          <strong><Link href="/docs/concepts/compliance-rules">Compliance rules</Link></strong> — mutable,
          per-asset transfer logic enforced at mint and transfer time, editable without a redeploy.
        </li>
      </ul>

      <Callout tone="security">
        Passify never stores, processes, or transmits personal identity data. Your KYC provider handles
        identity; Passify records only the cryptographic proof that verification happened. See{" "}
        <Link href="/docs/security">Security</Link> for the full data architecture.
      </Callout>

      <h2 id="start-here">Start here</h2>
      <p>Pick the path that matches what you are doing right now.</p>
      <ul>
        <li><Link href="/docs/quickstart">Quickstart</Link> — verify an investor and read an attestation in five minutes.</li>
        <li><Link href="/docs/concepts/how-it-works">How Passify works</Link> — the end-to-end flow, start to finish.</li>
        <li><Link href="/docs/api">API reference</Link> — every endpoint, with request and response shapes.</li>
        <li><Link href="/docs/guides/mint-and-transfer">Mint &amp; transfer guide</Link> — build compliance-checked Token-2022 transactions.</li>
      </ul>
    </DocArticle>
  );
}
