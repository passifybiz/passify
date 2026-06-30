import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  title: "How Passify works",
  description: "The end-to-end flow from KYC verification to a portable on-chain attestation, and how it gets reused.",
};

const toc = [
  { id: "the-flow", title: "The end-to-end flow" },
  { id: "verification", title: "1. Verification" },
  { id: "attestation", title: "2. Attestation" },
  { id: "enforcement", title: "3. Enforcement" },
  { id: "reuse", title: "4. Reuse" },
];

export default function HowItWorksPage() {
  return (
    <DocArticle
      slug="/docs/concepts/how-it-works"
      title="How Passify works"
      lead="Four stages turn a one-time identity check into reusable, enforceable, privacy-preserving compliance: verification, attestation, enforcement, and reuse."
      toc={toc}
    >
      <h2 id="the-flow">The end-to-end flow</h2>
      <p>
        The diagram below traces a wallet from its first verification through token operations on any integrated
        platform. Personal data stays with the KYC provider; Passify only ever handles a hash and metadata.
      </p>
      <CodeBlock
        language="text"
        title="lifecycle"
        code={`Investor wallet
   │  POST /kyc/start
   ▼
KYC provider (Blockpass)  ──── investor uploads docs + selfie (PII stays here)
   │  webhook: approved
   ▼
Passify  ── SHA-256(result) ──▶  on-chain attestation  (hash + metadata only)
   │
   ├──▶  GET /kyc/status/:pubkey      → any platform reads the proof
   └──▶  POST /token/mint | /transfer → checked against compliance rules`}
      />

      <h2 id="verification">1. Verification</h2>
      <p>
        Your platform calls <code>POST /kyc/start</code> with the investor&apos;s wallet and a{" "}
        <Link href="/docs/concepts/schemas">schema</Link>. Passify creates a session with the KYC provider and
        returns a hosted URL. The investor completes verification there. Sensitive documents never reach
        Passify.
      </p>

      <h2 id="attestation">2. Attestation</h2>
      <p>
        When the provider approves, it sends Passify a signed webhook. Passify verifies the signature, hashes
        the result payload with SHA-256, and writes an <Link href="/docs/concepts/attestations">attestation</Link>{" "}
        on-chain containing the wallet key, attester key, schema, expiration, and that hash — and nothing else.
      </p>
      <Callout tone="security">
        The on-chain record is one-way. A SHA-256 hash cannot be reversed into the underlying identity data, so
        the public ledger never exposes who the investor is.
      </Callout>

      <h2 id="enforcement">3. Enforcement</h2>
      <p>
        When your platform builds a token operation, Passify checks the wallet&apos;s attestation against the
        asset&apos;s <Link href="/docs/concepts/compliance-rules">compliance rules</Link> — required schema,
        allowed jurisdictions, minimum investment, holder caps, and transfer locks. Only if every rule passes
        does Passify return an unsigned transaction for the user to sign.
      </p>

      <h2 id="reuse">4. Reuse</h2>
      <p>
        Because the attestation lives on-chain and is keyed to the wallet, a different platform can read the
        same proof with a single <code>GET /kyc/status/:pubkey</code> call. The investor verifies once and
        gains access everywhere the attestation is accepted.
      </p>
      <p>
        Continue with <Link href="/docs/concepts/attestations">Attestations</Link>, or jump to the{" "}
        <Link href="/docs/guides/verify-investor">verify-an-investor guide</Link>.
      </p>
    </DocArticle>
  );
}
