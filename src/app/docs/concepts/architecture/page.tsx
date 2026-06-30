import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  title: "Architecture",
  description: "Passify's services, data flow, external dependencies, and the stateless backend design.",
};

const toc = [
  { id: "principles", title: "Design principles" },
  { id: "services", title: "Services" },
  { id: "dependencies", title: "External dependencies" },
  { id: "stateless", title: "Stateless & resilient" },
];

export default function ArchitecturePage() {
  return (
    <DocArticle
      slug="/docs/concepts/architecture"
      title="Architecture"
      lead="Passify is API-first and deliberately minimal: a thin set of services over Postgres, Redis, and Solana RPC, holding no identity data and no user keys."
      toc={toc}
    >
      <h2 id="principles">Design principles</h2>
      <ul>
        <li><strong>API-first.</strong> Every capability is reachable over REST. SDKs are thin wrappers — never the only path.</li>
        <li><strong>Zero PII on-chain.</strong> The on-chain record holds a wallet key, attester key, schema, expiration, and a hash. Nothing else.</li>
        <li><strong>Minimal on-chain footprint.</strong> Attestations use an existing attestation program; token operations use Token-2022 over RPC. No bespoke program to maintain in v1.</li>
        <li><strong>Stateless backend.</strong> Servers hold no secret state beyond hashed API keys. State lives on-chain or in the database.</li>
      </ul>

      <h2 id="services">Services</h2>
      <CodeBlock
        language="text"
        title="components"
        code={`              ┌──────────────────────────────┐
              │          API gateway          │
              │   auth · rate limit · routing  │
              ├──────┬──────┬───────┬──────────┤
              │ KYC  │ Att. │ Token │  Query   │
              │ svc  │ svc  │ svc   │  svc     │
              ├──────┴──────┴───────┴──────────┤
              │ Postgres │ Redis │ Solana RPC  │
              └──────────────────────────────┘`}
      />
      <table>
        <thead>
          <tr><th>Service</th><th>Responsibility</th></tr>
        </thead>
        <tbody>
          <tr><td>KYC</td><td>Creates provider sessions, verifies webhooks, hashes results, hands off to Attestation.</td></tr>
          <tr><td>Attestation</td><td>Builds and sends the on-chain attestation; persists the record; retries on failure.</td></tr>
          <tr><td>Token</td><td>Checks attestation + <Link href="/docs/concepts/compliance-rules">rules</Link>, then builds unsigned Token-2022 mint/transfer instructions.</td></tr>
          <tr><td>Query</td><td>Reads attestation status and balances; cross-checks on-chain when configured.</td></tr>
        </tbody>
      </table>

      <h2 id="dependencies">External dependencies</h2>
      <table>
        <thead>
          <tr><th>Dependency</th><th>Purpose</th><th>Failure strategy</th></tr>
        </thead>
        <tbody>
          <tr><td>Helius RPC</td><td>Solana connection and indexing.</td><td>Fall back to a secondary RPC.</td></tr>
          <tr><td>Blockpass</td><td>KYC verification.</td><td>Fail the session and alert operations.</td></tr>
          <tr><td>Token-2022</td><td>Token operations.</td><td>Core infrastructure — no fallback.</td></tr>
          <tr><td>Redis</td><td>Rate limiting and session cache.</td><td>Degrade to in-memory; alert operations.</td></tr>
          <tr><td>Postgres</td><td>Persistent storage.</td><td>No fallback — the system of record.</td></tr>
        </tbody>
      </table>

      <h2 id="stateless">Stateless &amp; resilient</h2>
      <p>
        Because servers carry no durable secret state, an instance can be replaced with no data loss — another
        spins up and reads from the database and chain. User private keys never touch Passify: investors sign in
        their own wallet or wallet-as-a-service provider, and Passify only ever returns <em>unsigned</em>{" "}
        transactions.
      </p>
      <Callout tone="security">
        Returning unsigned transactions is a deliberate boundary: Passify can enforce policy and assemble the
        instruction, but it can never move funds on a user&apos;s behalf.
      </Callout>
    </DocArticle>
  );
}
