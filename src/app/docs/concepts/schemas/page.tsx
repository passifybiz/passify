import Link from "next/link";
import type { Metadata } from "next";
import { DocArticle } from "@/components/docs/doc-article";
import { Callout } from "@/components/docs/callout";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/concepts/schemas" },
  title: "Schemas",
  description: "How attestation schemas describe what was verified, the built-in schemas, and how versioning works.",
};

const toc = [
  { id: "what", title: "What a schema is" },
  { id: "builtin", title: "Built-in schemas" },
  { id: "versioning", title: "Versioning" },
  { id: "choosing", title: "Choosing a schema" },
];

export default function SchemasPage() {
  return (
    <DocArticle
      slug="/docs/concepts/schemas"
      title="Schemas"
      lead="A schema is the type of an attestation. It declares what a verification proves — basic identity, accreditation, and so on — so platforms can require exactly the level of assurance an asset needs."
      toc={toc}
    >
      <h2 id="what">What a schema is</h2>
      <p>
        Every <Link href="/docs/concepts/attestations">attestation</Link> references a schema by ID. The schema
        is a contract about meaning: it tells a reading platform what checks stood behind the proof, without
        exposing any of the underlying data. When you call <code>POST /kyc/start</code>, you choose the schema
        the session should produce.
      </p>

      <h2 id="builtin">Built-in schemas</h2>
      <table>
        <thead>
          <tr>
            <th>Schema ID</th>
            <th>Proves</th>
            <th>Typical use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>kyc_individual_v1</code></td>
            <td>Identity verified for an individual (document + liveness).</td>
            <td>Retail access, general onboarding.</td>
          </tr>
          <tr>
            <td><code>kyc_accredited_v1</code></td>
            <td>Identity verified <em>and</em> accredited-investor status confirmed.</td>
            <td>Securities and accredited-only offerings.</td>
          </tr>
        </tbody>
      </table>

      <h2 id="versioning">Versioning</h2>
      <p>
        Schema IDs are versioned with a <code>_vN</code> suffix. When verification requirements change, a new
        version is introduced rather than redefining an existing one. Attestations already written under an
        older version remain valid and readable — a platform decides which versions it accepts.
      </p>
      <Callout tone="tip">
        Accept a set of schema versions explicitly in your rule configuration. That way you control the migration
        window when a new version ships, instead of being forced onto it.
      </Callout>

      <h2 id="choosing">Choosing a schema</h2>
      <ul>
        <li>Require the <em>least</em> assurance the asset legally needs — over-collecting is a liability.</li>
        <li>For accredited or restricted offerings, require <code>kyc_accredited_v1</code>; a basic attestation will not satisfy the rule.</li>
        <li>Set the asset&apos;s <Link href="/docs/concepts/compliance-rules">required schema</Link> to match, so enforcement is automatic at mint and transfer.</li>
      </ul>
    </DocArticle>
  );
}
