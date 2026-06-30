import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";
import { ContractAddress } from "@/components/site/token-address";
import { TICKER, TOKEN, formatSupply } from "@/lib/token";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/tokenomics" },
  title: `${TICKER} token overview`,
  description: `An overview of the ${TICKER} token: its role in the Passify network, key parameters, and where to learn more. Contract address is a placeholder until mainnet launch.`,
};

const toc = [
  { id: "summary", title: "Summary" },
  { id: "contract", title: "Contract address" },
  { id: "parameters", title: "Key parameters" },
  { id: "role", title: "Role in the network" },
  { id: "sections", title: "In this section" },
];

export default function TokenomicsOverviewPage() {
  return (
    <DocArticle
      slug="/docs/tokenomics"
      title={`${TICKER} token`}
      lead={`${TICKER} is the network token that aligns the people who use Passify, the platforms that build on it, and the treasury that sustains it. This section documents the proposed token model ahead of the mainnet launch.`}
      toc={toc}
    >
      <Callout tone="warning" title="Pre-launch — subject to change">
        The {TICKER} token has not launched yet. Every figure in this section describes a <strong>proposed</strong>{" "}
        model and may change before launch. The contract address shown below is a placeholder. See the{" "}
        <Link href="/docs/tokenomics/faq">token FAQ &amp; risk disclaimer</Link> before making any decision.
      </Callout>

      <h2 id="summary">Summary</h2>
      <p>
        Passify is, first and foremost, an <Link href="/docs">API product</Link> — it works without any token.
        {` ${TICKER} `} adds an optional coordination layer on top: it meters network usage, lets platforms stake
        for higher throughput, and gives the community a voice in how schemas, rules, and the treasury evolve.
      </p>

      <h2 id="contract">Contract address</h2>
      <p>The mainnet mint address will be published here at launch. Until then this is a placeholder:</p>
      <p><ContractAddress /></p>
      <Callout tone="security">
        Only ever trust the contract address published on this page and the official{" "}
        <Link href="/">passify.biz</Link> domain. Ignore addresses shared in DMs, comments, or unofficial
        channels — token launches are a common target for impersonation scams.
      </Callout>

      <h2 id="parameters">Key parameters</h2>
      <div className="token-grid">
        <div className="token-stat">
          <div className="token-stat__value">{TICKER}</div>
          <div className="token-stat__label">Ticker</div>
        </div>
        <div className="token-stat">
          <div className="token-stat__value">{formatSupply()}</div>
          <div className="token-stat__label">Max supply (proposed)</div>
        </div>
        <div className="token-stat">
          <div className="token-stat__value">{TOKEN.network}</div>
          <div className="token-stat__label">Network</div>
        </div>
        <div className="token-stat">
          <div className="token-stat__value">{TOKEN.standard}</div>
          <div className="token-stat__label">Standard</div>
        </div>
      </div>

      <h2 id="role">Role in the network</h2>
      <ul>
        <li><strong>Usage credits</strong> — pay for attestations and API throughput. See <Link href="/docs/tokenomics/utility">Utility</Link>.</li>
        <li><strong>Staking</strong> — platforms stake for higher rate limits and priority processing.</li>
        <li><strong>Governance</strong> — holders steer schema additions, default rules, and treasury allocation. See <Link href="/docs/tokenomics/governance">Governance</Link>.</li>
      </ul>

      <h2 id="sections">In this section</h2>
      <ul>
        <li><Link href="/docs/tokenomics/utility">Utility</Link> — what the token does, concretely.</li>
        <li><Link href="/docs/tokenomics/supply">Supply &amp; distribution</Link> — allocation, emission, and vesting.</li>
        <li><Link href="/docs/tokenomics/treasury">Treasury &amp; revenue</Link> — how value flows and is sustained.</li>
        <li><Link href="/docs/tokenomics/governance">Governance</Link> — how decisions are made.</li>
        <li><Link href="/docs/tokenomics/faq">Token FAQ &amp; risk</Link> — questions and the full disclaimer.</li>
      </ul>
    </DocArticle>
  );
}
