import { AnimateOnScroll } from "./animate-on-scroll";

const STEPS = [
  { step: "01", title: "Platform starts KYC", desc: "Call POST /kyc/start with the investor's public key. We create a session with the verification provider." },
  { step: "02", title: "Investor completes verification", desc: "Redirect to the provider's hosted flow. Documents and biometrics go directly to the provider — not to Passify." },
  { step: "03", title: "Attestation written onchain", desc: "Provider sends a webhook. Passify hashes the result and writes an attestation to Solana. No PII touches the ledger." },
  { step: "04", title: "Any platform can verify", desc: "Call GET /kyc/status/{pubkey}. The attestation travels with the investor across every integrated platform." },
  { step: "05", title: "Compliance enforced at runtime", desc: "Transfer hooks check attestation status on every token operation. Rules update from the dashboard — no contract changes." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section landing-section--highlight">
      <div className="container container--narrow">
        <h2 className="h2 landing-section__heading">Five steps, zero contract deploys</h2>
        <p className="landing-section__sub">
          From identity verification to asset access in under 60 seconds.
        </p>
        <div className="stack">
          {STEPS.map((s) => (
            <AnimateOnScroll key={s.step}>
              <div className="card card--pad landing-step">
                <span className="landing-step__num">{s.step}</span>
                <div>
                  <h3 className="h5">{s.title}</h3>
                  <p className="help-text">{s.desc}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
