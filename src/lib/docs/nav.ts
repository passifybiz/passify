/* ─────────────────────────────────────────────────────────────
   Documentation navigation — the single source of truth.

   The sidebar, breadcrumbs, and previous/next pager are all derived
   from this tree. Add a page here and it is wired everywhere at once.
   Order within the tree defines the reading order used by the pager.
   ───────────────────────────────────────────────────────────── */

export type DocItem = {
  title: string;
  href: string;
  /** One-line summary used for breadcrumbs/SEO and the section indexes. */
  summary?: string;
};

export type DocSection = {
  title: string;
  items: DocItem[];
};

export const docsNav: DocSection[] = [
  {
    title: "Get started",
    items: [
      { href: "/docs", title: "Introduction", summary: "What Passify is, who it is for, and how the pieces fit together." },
      { href: "/docs/quickstart", title: "Quickstart", summary: "Verify an investor and read an attestation in under five minutes." },
      { href: "/docs/authentication", title: "Authentication", summary: "API keys, bearer tokens, and key hygiene." },
    ],
  },
  {
    title: "Core concepts",
    items: [
      { href: "/docs/concepts/how-it-works", title: "How Passify works", summary: "The end-to-end path from KYC to a portable on-chain attestation." },
      { href: "/docs/concepts/attestations", title: "Attestations", summary: "The portable proof of verification — what it contains and what it never does." },
      { href: "/docs/concepts/schemas", title: "Schemas", summary: "How attestation types describe what was verified." },
      { href: "/docs/concepts/compliance-rules", title: "Compliance rules", summary: "Runtime transfer logic you can change without redeploying a contract." },
      { href: "/docs/concepts/architecture", title: "Architecture", summary: "Services, data flow, and the stateless backend design." },
    ],
  },
  {
    title: "Guides",
    items: [
      { href: "/docs/guides/verify-investor", title: "Verify an investor", summary: "Run a full KYC session and confirm the resulting attestation." },
      { href: "/docs/guides/mint-and-transfer", title: "Mint & transfer tokens", summary: "Build compliance-checked Token-2022 mint and transfer transactions." },
      { href: "/docs/guides/manage-rules", title: "Manage compliance rules", summary: "Edit transfer rules from the dashboard with a full audit trail." },
    ],
  },
  {
    title: "API reference",
    items: [
      { href: "/docs/api", title: "Overview", summary: "Base URL, authentication, errors, pagination, and rate limits." },
      { href: "/docs/api/kyc", title: "KYC", summary: "Start sessions, read status, and receive provider webhooks." },
      { href: "/docs/api/attestation", title: "Attestation", summary: "Read attestation details by ID." },
      { href: "/docs/api/token", title: "Token", summary: "Build compliance-checked mint and transfer transactions." },
    ],
  },
  {
    title: "Token",
    items: [
      { href: "/docs/tokenomics", title: "Overview", summary: "The role of the PASS token in the Passify network." },
      { href: "/docs/tokenomics/utility", title: "Utility", summary: "What the token does: credits, staking, and governance." },
      { href: "/docs/tokenomics/supply", title: "Supply & distribution", summary: "Maximum supply, allocation, emission, and vesting." },
      { href: "/docs/tokenomics/treasury", title: "Treasury & revenue", summary: "Treasury policy, liquidity, and how protocol revenue flows." },
      { href: "/docs/tokenomics/governance", title: "Governance", summary: "How holders steer schemas, rules, and treasury decisions." },
      { href: "/docs/tokenomics/faq", title: "Token FAQ & risk", summary: "Common questions and the full risk disclaimer." },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/docs/security", title: "Security", summary: "Data architecture, controls, and the zero-PII guarantee." },
      { href: "/docs/production-checklist", title: "Production checklist", summary: "Everything to confirm before you go live on mainnet." },
      { href: "/docs/troubleshooting", title: "Troubleshooting", summary: "Common errors and how to resolve them." },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/docs/faq", title: "FAQ", summary: "Frequently asked questions about Passify." },
      { href: "/docs/glossary", title: "Glossary", summary: "Plain-language definitions of every term used in these docs." },
      { href: "/docs/roadmap", title: "Roadmap", summary: "What ships now and what is planned next." },
      { href: "/docs/changelog", title: "Changelog", summary: "Notable changes to the platform and documentation." },
    ],
  },
];

/** Flattened reading order used by the prev/next pager. */
export const docsFlat: DocItem[] = docsNav.flatMap((s) => s.items);

/** Look up a single doc item by its href. */
export function getDocItem(href: string): DocItem | undefined {
  return docsFlat.find((i) => i.href === href);
}

/** Previous/next items in reading order for the pager. */
export function getPager(href: string): { prev?: DocItem; next?: DocItem } {
  const idx = docsFlat.findIndex((i) => i.href === href);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? docsFlat[idx - 1] : undefined,
    next: idx < docsFlat.length - 1 ? docsFlat[idx + 1] : undefined,
  };
}

/** Section title that contains a given href (used for breadcrumbs). */
export function getSectionTitle(href: string): string | undefined {
  return docsNav.find((s) => s.items.some((i) => i.href === href))?.title;
}
