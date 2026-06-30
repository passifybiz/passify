import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";
import { TICKER } from "@/lib/token";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/tokenomics/governance" },
  title: `${TICKER} governance`,
  description: `How ${TICKER} holders steer schemas, default rules, and treasury decisions. Proposed process, subject to change.`,
};

const toc = [
  { id: "what", title: "What governance controls" },
  { id: "process", title: "Proposal process" },
  { id: "weight", title: "Voting weight" },
  { id: "guardrails", title: "Guardrails" },
];

export default function TokenGovernancePage() {
  return (
    <DocArticle
      slug="/docs/tokenomics/governance"
      title="Governance"
      lead={`Governance gives ${TICKER} holders a say in how the network evolves — not over individual platforms' private rules, but over the shared defaults, schemas, and treasury that everyone depends on.`}
      toc={toc}
    >
      <Callout tone="warning" title="Proposed process">
        The governance process below is proposed and will be finalized around launch. Parameters such as
        thresholds and timelocks may change.
      </Callout>

      <h2 id="what">What governance controls</h2>
      <table>
        <thead><tr><th>In scope</th><th>Out of scope</th></tr></thead>
        <tbody>
          <tr><td>Adding or deprecating <Link href="/docs/concepts/schemas">schemas</Link></td><td>A platform&apos;s own private <Link href="/docs/concepts/compliance-rules">compliance rules</Link></td></tr>
          <tr><td>Default rule templates and recommendations</td><td>Individual investor data (never on-chain)</td></tr>
          <tr><td><Link href="/docs/tokenomics/treasury">Treasury</Link> allocation</td><td>Day-to-day platform operations</td></tr>
          <tr><td>New token utility and incentive programs</td><td>Signing user transactions (Passify never can)</td></tr>
        </tbody>
      </table>
      <p>
        Crucially, governance sets <em>shared defaults</em>. Each platform still configures its own asset rules
        privately — governance never reaches into a platform&apos;s compliance configuration.
      </p>

      <h2 id="process">Proposal process</h2>
      <ol>
        <li><strong>Discuss</strong> — an idea is raised and refined with the community.</li>
        <li><strong>Propose</strong> — a formal proposal is submitted above a minimum stake threshold.</li>
        <li><strong>Vote</strong> — holders vote during a fixed window.</li>
        <li><strong>Timelock</strong> — passed proposals wait through a delay before execution, so anyone can prepare.</li>
        <li><strong>Execute</strong> — the change is applied.</li>
      </ol>

      <h2 id="weight">Voting weight</h2>
      <p>
        Voting weight derives from {TICKER} held or staked. Staking for governance may carry a multiplier to
        reward longer commitment. Exact weights and thresholds will be published with the final governance
        specification.
      </p>

      <h2 id="guardrails">Guardrails</h2>
      <ul>
        <li><strong>Quorum</strong> — proposals need a minimum participation to pass.</li>
        <li><strong>Timelock</strong> — a mandatory delay before execution limits surprise changes.</li>
        <li><strong>Scope limits</strong> — governance cannot touch private platform rules or any personal data.</li>
      </ul>
      <Callout tone="security">
        Governance can change shared defaults but never compromises the core guarantee: no personal data is ever
        placed on-chain, and Passify can never move user funds. Those properties are not up for a vote.
      </Callout>
    </DocArticle>
  );
}
