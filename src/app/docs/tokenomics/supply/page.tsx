import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";
import { TICKER, formatSupply, TOKEN } from "@/lib/token";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/tokenomics/supply" },
  title: `${TICKER} supply & distribution`,
  description: `Proposed maximum supply, allocation, emission schedule, and vesting for the ${TICKER} token. Forward-looking and subject to change before launch.`,
};

const toc = [
  { id: "supply", title: "Maximum supply" },
  { id: "allocation", title: "Allocation" },
  { id: "emission", title: "Emission" },
  { id: "vesting", title: "Vesting" },
];

const ALLOC = [
  { label: "Community & ecosystem", pct: 35, color: "var(--primary-600)" },
  { label: "Treasury", pct: 20, color: "var(--primary-900)" },
  { label: "Team & contributors", pct: 18, color: "var(--warning)" },
  { label: "Liquidity", pct: 15, color: "var(--primary-300)" },
  { label: "Early backers", pct: 12, color: "var(--ink-soft)" },
];

export default function TokenSupplyPage() {
  return (
    <DocArticle
      slug="/docs/tokenomics/supply"
      title="Supply & distribution"
      lead={`A fixed maximum supply, a majority allocated to the community and ecosystem, and multi-year vesting on insider allocations. All figures are proposed and subject to change before launch.`}
      toc={toc}
    >
      <Callout tone="warning" title="Proposed figures">
        The numbers below describe a proposed distribution model. They are not final, not an offer, and may
        change before the mainnet launch. Read the <Link href="/docs/tokenomics/faq">risk disclaimer</Link>.
      </Callout>

      <h2 id="supply">Maximum supply</h2>
      <p>
        {TICKER} has a fixed proposed maximum supply of <strong>{formatSupply()}</strong> tokens
        ({TOKEN.decimals} decimals). The supply is capped — there is no proposed mechanism to mint beyond the
        maximum. Any unallocated tokens are held by the <Link href="/docs/tokenomics/treasury">treasury</Link>{" "}
        under governance control.
      </p>

      <h2 id="allocation">Allocation</h2>
      <div className="alloc" role="img" aria-label="Proposed token allocation by percentage">
        {ALLOC.map((a) => (
          <div key={a.label} className="alloc__seg" style={{ width: `${a.pct}%`, background: a.color }} />
        ))}
      </div>
      <ul className="alloc-legend">
        {ALLOC.map((a) => (
          <li key={a.label}>
            <span className="alloc-legend__dot" style={{ background: a.color }} />
            <span>{a.label}</span>
            <strong style={{ marginLeft: "auto" }}>{a.pct}%</strong>
          </li>
        ))}
      </ul>

      <table>
        <thead><tr><th>Allocation</th><th>Share</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td>Community &amp; ecosystem</td><td>35%</td><td>Grants, incentives, integrations, and usage rewards.</td></tr>
          <tr><td>Treasury</td><td>20%</td><td>Long-term sustainability, governed by holders.</td></tr>
          <tr><td>Team &amp; contributors</td><td>18%</td><td>Builders and operators. Vested over 4 years.</td></tr>
          <tr><td>Liquidity</td><td>15%</td><td>Initial and ongoing market liquidity.</td></tr>
          <tr><td>Early backers</td><td>12%</td><td>Early supporters. Vested with a cliff.</td></tr>
        </tbody>
      </table>

      <h2 id="emission">Emission</h2>
      <p>
        Emission refers to how allocated tokens enter circulation over time. The proposed model front-loads
        liquidity and community programs while releasing insider allocations slowly, so circulating supply grows
        predictably rather than all at once.
      </p>
      <ul>
        <li><strong>Liquidity</strong> — available at launch to support a functioning market.</li>
        <li><strong>Community &amp; ecosystem</strong> — released over multiple years as programs run.</li>
        <li><strong>Treasury</strong> — released only as governance approves specific uses.</li>
      </ul>

      <h2 id="vesting">Vesting</h2>
      <p>Insider allocations vest to align incentives with the long-term health of the network:</p>
      <table>
        <thead><tr><th>Allocation</th><th>Cliff</th><th>Vesting</th></tr></thead>
        <tbody>
          <tr><td>Team &amp; contributors</td><td>12 months</td><td>Linear over 4 years.</td></tr>
          <tr><td>Early backers</td><td>6 months</td><td>Linear over 2 years.</td></tr>
        </tbody>
      </table>
      <Callout tone="note">
        Vesting schedules and percentages are proposed and may be adjusted before launch. Final, on-chain
        schedules will be published here when the token goes live.
      </Callout>
    </DocArticle>
  );
}
