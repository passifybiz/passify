import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";
import { TICKER } from "@/lib/token";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Notable changes to the Passify platform and documentation.",
};

const toc = [{ id: "entries", title: "Releases" }];

type Entry = { version: string; title: string; items: React.ReactNode[] };

const ENTRIES: Entry[] = [
  {
    version: "v1.0",
    title: "Mainnet launch",
    items: [
      "Portable on-chain attestations with zero PII.",
      <>KYC, attestation, and token <Link href="/docs/api">APIs</Link> on Solana mainnet.</>,
      <>Mutable <Link href="/docs/concepts/compliance-rules">compliance rules</Link> with a full audit trail.</>,
      "Dashboard for API keys, rules, and attestation status.",
    ],
  },
  {
    version: "Docs",
    title: "Documentation rebuild",
    items: [
      "New information architecture with sidebar, breadcrumbs, on-this-page, and prev/next navigation.",
      "Guides, full API reference, security, and a production checklist.",
      <>New <Link href="/docs/tokenomics">{TICKER} token</Link> section covering utility, supply, treasury, and governance.</>,
    ],
  },
];

export default function ChangelogPage() {
  return (
    <DocArticle
      slug="/docs/changelog"
      title="Changelog"
      lead="Notable changes to the platform and these docs. Newest first."
      toc={toc}
    >
      <Callout tone="note">
        Entries are grouped by release rather than dated, so the history stays meaningful as the cadence changes.
      </Callout>

      <h2 id="entries">Releases</h2>
      {ENTRIES.map((e) => (
        <div key={e.version + e.title} style={{ marginBottom: "var(--space-8)" }}>
          <h3>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{e.version}</span>
            {"  "}— {e.title}
          </h3>
          <ul>
            {e.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </DocArticle>
  );
}
