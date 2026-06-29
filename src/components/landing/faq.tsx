const FAQS = [
  { q: "Does Passify store personal data?", a: "No. The KYC provider handles all PII. Passify stores only a SHA-256 hash of the verification result and the investor's Solana public key." },
  { q: "How does verification work?", a: "The investor is redirected to the KYC provider's hosted flow. On completion, the provider sends a webhook to Passify, which writes an attestation hash to Solana." },
  { q: "Do I need to deploy a Solana program?", a: "No. Passify writes attestations to an existing onchain program. Your platform only interacts with the REST API." },
  { q: "Can I change compliance rules after launch?", a: "Yes. Rules are stored in the database and applied at runtime. Update them from the dashboard — no contract changes needed." },
  { q: "Which KYC providers are supported?", a: "Blockpass is currently integrated. The provider interface is abstracted, so additional providers can be added." },
  { q: "How does cross-platform verification work?", a: "Each attestation is linked to a Solana public key. Any integrated platform can query the API to check whether that key has a valid attestation." },
];

export function Faq() {
  return (
    <section className="landing-section">
      <div className="container container--narrow">
        <h2 className="h2 landing-section__heading">FAQ</h2>
        <div className="stack">
          {FAQS.map((faq) => (
            <details key={faq.q} className="card card--pad landing-faq">
              <summary className="h5">{faq.q}</summary>
              <p className="help-text">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
