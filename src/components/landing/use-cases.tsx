import { AnimateOnScroll } from "./animate-on-scroll";

const AUDIENCES = [
  { title: "Platform developers", desc: "Add attestation-gated token operations with 3 API calls. No Solana programs to write or maintain.", tag: "REST API" },
  { title: "Asset issuers", desc: "Configure investor requirements per asset — jurisdiction, accreditation, minimums. Change them instantly.", tag: "No-code rules" },
  { title: "Investors", desc: "Verify identity once. Access every connected platform without repeating uploads or waiting for re-approval.", tag: "Verify once" },
  { title: "Compliance teams", desc: "Audit trail for every attestation, rule change, and token operation. Exportable. Immutable.", tag: "Full visibility" },
];

export function UseCases() {
  return (
    <section id="use-cases" className="landing-section">
      <div className="container">
        <h2 className="h2 landing-section__heading">Who uses Passify</h2>
        <p className="landing-section__sub">
          Four roles. One shared compliance layer. Everyone benefits.
        </p>
        <div className="grid-4">
          {AUDIENCES.map((a) => (
            <AnimateOnScroll key={a.title}>
              <div className="card card--pad landing-audience">
                <h3 className="h5">{a.title}</h3>
                <p className="help-text">{a.desc}</p>
                <span className="landing-audience__tag">{a.tag}</span>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
