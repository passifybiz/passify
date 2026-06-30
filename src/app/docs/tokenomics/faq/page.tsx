import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";
import { ContractAddress } from "@/components/site/token-address";
import { TICKER } from "@/lib/token";

export const metadata: Metadata = {
  title: `${TICKER} FAQ & risk`,
  description: `Frequently asked questions about the ${TICKER} token and the full risk disclaimer. Not financial advice; not an offer.`,
};

const toc = [
  { id: "faq", title: "Frequently asked" },
  { id: "obtain", title: "How to obtain & verify" },
  { id: "disclaimer", title: "Risk disclaimer" },
];

const FAQ = [
  {
    q: "Do I need the token to use Passify?",
    a: "No. Passify is an API product and works fully without the token. Fiat plans (Free, Pro, Enterprise) remain available.",
  },
  {
    q: "Has the token launched?",
    a: "Not yet. This section documents a proposed model ahead of launch. The contract address shown is a placeholder.",
  },
  {
    q: "Are the supply and allocation numbers final?",
    a: "No. They are proposed and may change before launch. Final, on-chain figures will be published here at launch.",
  },
  {
    q: "Where will the official contract address be published?",
    a: "Only on this documentation site and the official passify.biz domain. Treat any address from any other source as untrusted.",
  },
  {
    q: "Does holding the token entitle me to revenue?",
    a: "No. The token carries utility and governance weight. Nothing here promises profit, revenue share, or any price outcome.",
  },
];

export default function TokenFaqPage() {
  return (
    <DocArticle
      slug="/docs/tokenomics/faq"
      title="Token FAQ & risk"
      lead={`Straight answers about the ${TICKER} token, plus the full risk disclaimer. Read this before acting on anything in the token section.`}
      toc={toc}
    >
      <h2 id="faq">Frequently asked</h2>
      <div className="def-list">
        {FAQ.map((item) => (
          <div key={item.q} className="def-list__row">
            <p className="def-list__term">{item.q}</p>
            <p className="def-list__def">{item.a}</p>
          </div>
        ))}
      </div>

      <h2 id="obtain">How to obtain &amp; verify</h2>
      <p>
        When the token launches, the steps to obtain it and the verified contract address will be published here.
        Until then, the address below is a placeholder:
      </p>
      <p><ContractAddress /></p>
      <Callout tone="security">
        Always confirm the contract address against this page before interacting with any token claiming to be{" "}
        {TICKER}. Scammers routinely deploy look-alike tokens around a launch. If an address does not appear
        here on the official domain, do not trust it.
      </Callout>

      <h2 id="disclaimer">Risk disclaimer</h2>
      <Callout tone="warning" title="Important — please read">
        <p>
          This documentation is provided for informational purposes only. It is <strong>not</strong> financial,
          investment, legal, or tax advice, and it is <strong>not</strong> an offer or solicitation to buy or
          sell any token or security.
        </p>
        <p>
          The {TICKER} token has not launched. All parameters — including supply, allocation, emission, vesting,
          utility, and governance — are <strong>proposed</strong> and may change materially or be abandoned
          before launch. No outcome is guaranteed.
        </p>
        <p>
          Digital assets are volatile and high-risk. You may lose the entire value of any tokens you acquire.
          Tokens may have no value and no liquidity. Regulatory treatment varies by jurisdiction and may change.
        </p>
        <p>
          Nothing here promises profit, revenue, returns, or any specific price. Do your own research and consult
          qualified professionals before making any decision. Only interact with the contract address published
          on the official <Link href="/">passify.biz</Link> domain.
        </p>
      </Callout>
    </DocArticle>
  );
}
