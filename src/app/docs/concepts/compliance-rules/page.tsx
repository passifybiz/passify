import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/concepts/compliance-rules" },
  title: "Compliance rules",
  description: "Mutable, per-asset transfer logic that Passify enforces at mint and transfer time — editable without redeploying a contract.",
};

const toc = [
  { id: "why", title: "Why rules live off-chain" },
  { id: "fields", title: "Rule fields" },
  { id: "evaluation", title: "How rules are evaluated" },
  { id: "audit", title: "Audit trail" },
  { id: "best-practices", title: "Best practices" },
];

export default function ComplianceRulesPage() {
  return (
    <DocArticle
      slug="/docs/concepts/compliance-rules"
      title="Compliance rules"
      lead="Compliance rules are the runtime transfer logic for each asset. They live in Passify's database — not in a smart contract — so you can change a rule without redeploying anything."
      toc={toc}
    >
      <h2 id="why">Why rules live off-chain</h2>
      <p>
        When transfer restrictions are baked into a program, changing one means a redeploy: it costs SOL,
        invalidates integrations, and breaks composability. Passify keeps rules in Postgres and evaluates them
        at transaction-build time. Token-2022 transfer hooks call back into this logic, so the on-chain asset
        stays fixed while the policy around it stays editable.
      </p>

      <h2 id="fields">Rule fields</h2>
      <p>Each token configuration has exactly one rule set:</p>
      <table>
        <thead>
          <tr><th>Field</th><th>Meaning</th></tr>
        </thead>
        <tbody>
          <tr><td><code>required_schema</code></td><td>The attestation <Link href="/docs/concepts/schemas">schema</Link> a wallet must hold.</td></tr>
          <tr><td><code>allowed_jurisdictions</code></td><td>List of permitted jurisdictions, e.g. <code>["US","CA","GB"]</code>.</td></tr>
          <tr><td><code>min_investment_usd</code></td><td>Minimum amount per mint or transfer.</td></tr>
          <tr><td><code>max_holders</code></td><td>Cap on the number of distinct holders.</td></tr>
          <tr><td><code>transfer_lock_until</code></td><td>Optional timestamp before which transfers are blocked.</td></tr>
        </tbody>
      </table>

      <h2 id="evaluation">How rules are evaluated</h2>
      <p>
        On every <code>POST /token/mint</code> or <code>POST /token/transfer</code>, Passify checks the rule
        set in order and refuses the operation on the first failure, returning a specific error:
      </p>
      <CodeBlock
        language="json"
        title="403 Forbidden"
        code={`{
  "error": "rule_violation",
  "detail": "min_investment_usd_100",
  "request_id": "a1b2c3d4"
}`}
      />
      <Callout tone="note">
        Rules are evaluated against attestation <em>metadata</em> (such as jurisdiction), never against personal
        data. The attestation carries the minimum signal needed to enforce policy.
      </Callout>

      <h2 id="audit">Audit trail</h2>
      <p>
        Every rule change is recorded in an append-only audit log with the actor, timestamp, and the before and
        after values. Nothing is edited in place silently — see the{" "}
        <Link href="/docs/guides/manage-rules">manage-rules guide</Link>.
      </p>

      <h2 id="best-practices">Best practices</h2>
      <ul>
        <li>Keep <code>allowed_jurisdictions</code> as the source of truth for geographic policy — do not duplicate it in app code.</li>
        <li>Use <code>transfer_lock_until</code> for lock-up periods instead of pausing the asset.</li>
        <li>Review the audit log after every change to confirm intent and ownership.</li>
        <li>Test a rule change against a known wallet before enabling it for production traffic.</li>
      </ul>
    </DocArticle>
  );
}
