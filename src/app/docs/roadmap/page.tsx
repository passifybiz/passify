import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";
import { TICKER } from "@/lib/token";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What ships in Passify today and what is planned next, from additional providers to token governance.",
};

const toc = [
  { id: "now", title: "Available now" },
  { id: "next", title: "Planned next" },
  { id: "exploring", title: "Exploring" },
];

export default function RoadmapPage() {
  return (
    <DocArticle
      slug="/docs/roadmap"
      title="Roadmap"
      lead="A snapshot of what is live and where Passify is heading. Plans are directional, not commitments, and may change."
      toc={toc}
    >
      <Callout tone="note">
        This roadmap describes intent, not guarantees. Dates are intentionally omitted; items move based on what
        serves integrators best.
      </Callout>

      <h2 id="now">Available now</h2>
      <ul>
        <li>Portable on-chain <Link href="/docs/concepts/attestations">attestations</Link> with zero PII.</li>
        <li>KYC, attestation, and token <Link href="/docs/api">APIs</Link>.</li>
        <li>Mutable <Link href="/docs/concepts/compliance-rules">compliance rules</Link> with a full audit trail.</li>
        <li>Dashboard for keys, rules, and attestation status.</li>
        <li><code>kyc_individual_v1</code> and <code>kyc_accredited_v1</code> schemas.</li>
      </ul>

      <h2 id="next">Planned next</h2>
      <ul>
        <li>Additional KYC providers beyond the initial integration.</li>
        <li>More attestation schemas for new asset classes.</li>
        <li>Thin SDKs over the REST API for popular languages.</li>
        <li>Webhook delivery for verification and token events.</li>
        <li>{TICKER} token launch, staking, and governance (see <Link href="/docs/tokenomics">Token</Link>).</li>
      </ul>

      <h2 id="exploring">Exploring</h2>
      <ul>
        <li>Confidential transfers via a privacy provider.</li>
        <li>Cross-chain attestation reads.</li>
        <li>Richer rule primitives (e.g. per-region holder caps).</li>
      </ul>
    </DocArticle>
  );
}
