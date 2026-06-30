import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { TICKER } from "@/lib/token";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Plain-language definitions of the terms used throughout the Passify documentation.",
};

const TERMS: { term: string; def: React.ReactNode }[] = [
  { term: "Attestation", def: "A portable, on-chain proof that a wallet passed verification. Contains a hash and metadata — never personal data." },
  { term: "Attester key", def: "The on-chain key Passify uses to sign attestations. Lets anyone confirm an attestation came from Passify." },
  { term: "Compliance rule", def: "Per-asset transfer logic (schema, jurisdictions, minimum, holder cap, lock) enforced at mint and transfer time. Stored off-chain and editable without a redeploy." },
  { term: "data_hash", def: "A SHA-256 hash of the KYC result payload. One-way and not reversible to identity data." },
  { term: "KYC", def: "Know Your Customer — the identity-verification process performed by a provider such as Blockpass." },
  { term: "mint_config", def: "A token configuration identifying a specific asset (for example us_real_estate_fund_v1) and its associated rules." },
  { term: "PII", def: "Personally Identifiable Information — names, IDs, documents. Passify never stores or processes PII." },
  { term: "Schema", def: "The type of an attestation (e.g. kyc_individual_v1, kyc_accredited_v1), describing what was verified." },
  { term: "Token-2022", def: "The Solana token standard whose transfer hooks let Passify enforce compliance rules at transfer time." },
  { term: "Transfer hook", def: "A Token-2022 mechanism that calls custom logic during a transfer — here, a compliance-rule check." },
  { term: "Unsigned transaction", def: "A transaction Passify assembles but does not sign. The user signs it in their own wallet, so Passify never moves funds." },
  { term: TICKER, def: "The proposed network token that meters usage, enables staking for throughput, and carries governance weight. Optional — not required to use the API." },
];

const toc = [{ id: "terms", title: "Terms" }];

export default function GlossaryPage() {
  const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <DocArticle
      slug="/docs/glossary"
      title="Glossary"
      lead="Every term these docs rely on, defined in plain language. Skim it once and the rest of the documentation reads faster."
      toc={toc}
    >
      <h2 id="terms">Terms</h2>
      <div className="def-list">
        {sorted.map((t) => (
          <div key={t.term} className="def-list__row">
            <p className="def-list__term">{t.term}</p>
            <p className="def-list__def">{t.def}</p>
          </div>
        ))}
      </div>
    </DocArticle>
  );
}
