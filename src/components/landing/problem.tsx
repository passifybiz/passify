import { AnimateOnScroll } from "./animate-on-scroll";

const PROBLEMS = [
  {
    title: "Repeated KYC across every platform",
    desc: "Investors are asked to re-verify on each new platform they join. This creates friction, increases drop-off, and slows onboarding.",
  },
  {
    title: "Personal data on a public ledger",
    desc: "Storing identity documents or PII on-chain creates regulatory exposure and makes platforms subject to data breach notification requirements.",
  },
  {
    title: "Compliance locked in smart contracts",
    desc: "When compliance rules are embedded in deployed programs, every change — a new jurisdiction, an updated minimum — requires a contract redeploy.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="landing-section landing-section--alt">
      <div className="container container--narrow">
        <h2 className="h2 landing-section__heading">Problems Passify addresses</h2>
        <p className="landing-section__sub">
          Common challenges for RWA platforms building compliance infrastructure.
        </p>
        <div className="stack">
          {PROBLEMS.map((p) => (
            <AnimateOnScroll key={p.title}>
              <div className="card card--pad landing-problem-card">
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
