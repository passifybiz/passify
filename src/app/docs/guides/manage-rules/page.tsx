import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  title: "Manage compliance rules",
  description: "Edit per-asset transfer rules from the dashboard with a full audit trail — no redeploy required.",
};

const toc = [
  { id: "where", title: "Where rules live" },
  { id: "editing", title: "Editing a rule" },
  { id: "effect", title: "When changes take effect" },
  { id: "audit", title: "Reading the audit log" },
  { id: "examples", title: "Worked examples" },
];

export default function ManageRulesGuide() {
  return (
    <DocArticle
      slug="/docs/guides/manage-rules"
      title="Manage compliance rules"
      lead="Compliance officers change transfer rules from the dashboard. Every edit is captured in an audit log, and changes apply on the next token operation — never a redeploy."
      toc={toc}
    >
      <h2 id="where">Where rules live</h2>
      <p>
        Each token configuration has exactly one <Link href="/docs/concepts/compliance-rules">rule set</Link>.
        Open <strong>Rules</strong> in the dashboard, choose the token configuration on the left, and its
        current rules load in the editor on the right.
      </p>

      <h2 id="editing">Editing a rule</h2>
      <ol>
        <li>Select the token configuration (for example <code>us_real_estate_fund_v1</code>).</li>
        <li>Adjust any field — required schema, allowed jurisdictions, minimum investment, max holders, or transfer lock.</li>
        <li>Save. The change is validated and persisted immediately.</li>
      </ol>
      <Callout tone="security">
        Rule edits are privileged actions. Restrict dashboard access to compliance staff, and confirm the actor
        on each change in the audit log.
      </Callout>

      <h2 id="effect">When changes take effect</h2>
      <p>
        A saved rule applies to the <em>next</em> <code>/token/mint</code> or <code>/token/transfer</code> call.
        There is no on-chain transaction, no redeploy, and no downtime. In-flight transactions already built are
        unaffected; new builds use the new rule.
      </p>

      <h2 id="audit">Reading the audit log</h2>
      <p>
        Every change writes an entry recording who made it, when, and the before and after values. Use the audit
        view to answer &ldquo;who changed the minimum investment, and when?&rdquo; with certainty. Entries are
        append-only — they are never edited or deleted.
      </p>

      <h2 id="examples">Worked examples</h2>
      <table>
        <thead>
          <tr><th>Goal</th><th>Change</th></tr>
        </thead>
        <tbody>
          <tr><td>Open an asset to a new market</td><td>Add the jurisdiction to <code>allowed_jurisdictions</code>.</td></tr>
          <tr><td>Raise the holder cap</td><td>Increase <code>max_holders</code>.</td></tr>
          <tr><td>Enforce a lock-up</td><td>Set <code>transfer_lock_until</code> to the unlock date.</td></tr>
          <tr><td>Require accreditation</td><td>Set <code>required_schema</code> to <code>kyc_accredited_v1</code>.</td></tr>
        </tbody>
      </table>
      <Callout tone="tip">
        Test a change against a known wallet in a staging key before applying it to production traffic. Confirm
        the audit entry reads as you expect before moving on.
      </Callout>
    </DocArticle>
  );
}
