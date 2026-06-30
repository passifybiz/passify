import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";
import { TICKER } from "@/lib/token";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/tokenomics/utility" },
  title: `${TICKER} utility`,
  description: `What the ${TICKER} token does in the Passify network: usage credits, staking for throughput, and governance. Proposed model, subject to change.`,
};

const toc = [
  { id: "principle", title: "Design principle" },
  { id: "credits", title: "Usage credits" },
  { id: "staking", title: "Staking for throughput" },
  { id: "governance", title: "Governance weight" },
  { id: "future", title: "Future utility" },
];

export default function TokenUtilityPage() {
  return (
    <DocArticle
      slug="/docs/tokenomics/utility"
      title="Utility"
      lead={`${TICKER} earns its place by doing real work in the network — metering usage, securing throughput, and carrying governance weight. It is never required to use the core API.`}
      toc={toc}
    >
      <Callout tone="warning" title="Proposed model">
        This page describes proposed utility ahead of launch. Mechanisms and parameters may change. Nothing here
        is an offer, and {TICKER} is not required to use Passify — fiat plans remain available.
      </Callout>

      <h2 id="principle">Design principle</h2>
      <p>
        Utility should follow usage, not the other way around. Every {TICKER} sink maps to something the network
        actually consumes — verifications, API throughput, or coordination — so demand for the token tracks
        demand for the product rather than speculation alone.
      </p>

      <h2 id="credits">Usage credits</h2>
      <p>
        Platforms can pay for attestations and API calls in {TICKER}. Credits are debited per metered action —
        the same actions counted against the <Link href="/docs/api">plan quotas</Link> today. Paying in token is
        optional; card-based plans (Free, Pro, Enterprise) continue to work unchanged.
      </p>

      <h2 id="staking">Staking for throughput</h2>
      <p>
        Platforms can stake {TICKER} to unlock higher rate limits and priority processing during peak load.
        Staking aligns heavy users with the long-term health of the network: the more a platform relies on
        Passify, the more it benefits from committing stake.
      </p>
      <table>
        <thead><tr><th>Lever</th><th>Effect</th></tr></thead>
        <tbody>
          <tr><td>Stake size</td><td>Raises the platform&apos;s throughput ceiling.</td></tr>
          <tr><td>Stake duration</td><td>Longer commitments earn better terms.</td></tr>
          <tr><td>Unstake</td><td>Subject to a cooldown to discourage churn.</td></tr>
        </tbody>
      </table>

      <h2 id="governance">Governance weight</h2>
      <p>
        {TICKER} carries voting weight over decisions that shape the network — which{" "}
        <Link href="/docs/concepts/schemas">schemas</Link> are added, what default{" "}
        <Link href="/docs/concepts/compliance-rules">rules</Link> ship, and how the{" "}
        <Link href="/docs/tokenomics/treasury">treasury</Link> is allocated. See{" "}
        <Link href="/docs/tokenomics/governance">Governance</Link> for the process.
      </p>

      <h2 id="future">Future utility</h2>
      <p>
        Additional mechanisms may be introduced through governance — for example, fee discounts for stakers,
        attester incentives, or grants funded from the treasury. New utility is added deliberately and only when
        it serves the network; the bar is real usage, not novelty.
      </p>
    </DocArticle>
  );
}
