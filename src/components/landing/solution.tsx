import { AnimateOnScroll } from "./animate-on-scroll";

const PILLARS = [
  { num: "01", title: "Verify once, use everywhere", desc: "Investors complete KYC once. Every integrated platform reads the same attestation. Zero repeated uploads." },
  { num: "02", title: "Zero PII exposure", desc: "Only a SHA-256 hash touches the blockchain. Personal data stays with the KYC provider. You never touch it." },
  { num: "03", title: "Update rules without redeploying", desc: "Change jurisdictions, minimums, and holder limits from the dashboard. Takes effect on the next API call." },
];

export function Solution() {
  return (
    <section id="solution" className="landing-section">
      <div className="container">
        <h2 className="h2 landing-section__heading">How Passify solves it</h2>
        <p className="landing-section__sub">
          One integration instead of building KYC, compliance, and attestation infrastructure yourself.
        </p>
        <div className="grid-3">
          {PILLARS.map((p) => (
            <AnimateOnScroll key={p.num}>
              <div className="card card--pad landing-pillar">
                <span className="landing-pillar__num">{p.num}</span>
                <h3 className="h5">{p.title}</h3>
                <p className="help-text">{p.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
