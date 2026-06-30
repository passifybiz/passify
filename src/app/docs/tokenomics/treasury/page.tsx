import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";
import { TICKER } from "@/lib/token";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/tokenomics/treasury" },
  title: `${TICKER} treasury & revenue`,
  description: `How the Passify treasury is funded and governed, how liquidity is maintained, and how protocol revenue flows. Proposed model, subject to change.`,
};

const toc = [
  { id: "treasury", title: "Treasury" },
  { id: "revenue", title: "Revenue flow" },
  { id: "liquidity", title: "Liquidity" },
  { id: "transparency", title: "Transparency" },
];

export default function TokenTreasuryPage() {
  return (
    <DocArticle
      slug="/docs/tokenomics/treasury"
      title="Treasury & revenue"
      lead="The treasury sustains Passify beyond any single funding round. It is funded by allocation and a share of protocol revenue, and it is spent only as governance directs."
      toc={toc}
    >
      <Callout tone="warning" title="Proposed model">
        Treasury policy, revenue splits, and liquidity mechanics described here are proposed and may change
        before launch. See the <Link href="/docs/tokenomics/faq">risk disclaimer</Link>.
      </Callout>

      <h2 id="treasury">Treasury</h2>
      <p>
        The treasury holds the 20% protocol allocation plus any unallocated supply. Its purpose is long-term
        sustainability: funding development, audits, grants, and liquidity. Treasury funds move only through{" "}
        <Link href="/docs/tokenomics/governance">governance</Link>-approved proposals — never unilaterally.
      </p>

      <h2 id="revenue">Revenue flow</h2>
      <p>
        Passify earns revenue from plan subscriptions and metered usage (attestations and API calls). A proposed
        share of net protocol revenue is directed to the treasury, which governance can then route to the uses
        below.
      </p>
      <CodeBlock
        language="text"
        title="proposed flow"
        code={`Platform usage & subscriptions
        │
        ▼
   Protocol revenue
        │
        ├──▶ Operations (infra, KYC provider, support)
        │
        └──▶ Treasury ──▶ governance-approved uses:
                          • development & audits
                          • ecosystem grants
                          • liquidity support
                          • buybacks (if approved)`}
      />
      <Callout tone="note">
        Whether any revenue is used for buybacks or similar mechanisms is a governance decision, not a promise.
        No specific price outcome is implied or guaranteed.
      </Callout>

      <h2 id="liquidity">Liquidity</h2>
      <p>
        The 15% liquidity allocation seeds initial markets so the token can be traded with reasonable depth from
        launch. Ongoing liquidity is maintained from the treasury as governance directs. Liquidity provisioning
        aims for healthy markets — it is not a price guarantee.
      </p>

      <h2 id="transparency">Transparency</h2>
      <p>
        Because the treasury lives on-chain, balances and flows are publicly verifiable. After launch, treasury
        addresses and a reporting cadence will be published here so anyone can audit how funds are held and
        spent.
      </p>
    </DocArticle>
  );
}
