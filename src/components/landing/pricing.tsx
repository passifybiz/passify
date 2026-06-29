import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "",
    desc: "For developers exploring the API.",
    features: ["500 attestations/month", "1 API key", "Standard KYC schema", "Email support", "Dashboard + audit logs"],
    cta: "Start free",
    href: "/login",
  },
  {
    name: "Growth",
    price: "$299",
    period: "/month",
    desc: "For platforms with live investors and multiple assets.",
    features: ["10,000 attestations/month", "5 API keys", "Custom compliance rules", "Priority email support", "Webhook notifications", "Multi-schema support"],
    cta: "Get started",
    href: "/login",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For platforms that need contractual SLA terms.",
    features: ["Unlimited attestations", "Unlimited API keys", "Dedicated support contact", "Custom SLA terms", "Compliance questionnaire assistance", "Onboarding assistance"],
    cta: "Talk to sales",
    href: "/enterprise",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="landing-section landing-section--highlight">
      <div className="container">
        <h2 className="h2 landing-section__heading">Pricing</h2>
        <p className="landing-section__sub">No credit card required for the free tier.</p>
        <div className="grid-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`card card--pad landing-price${p.featured ? " landing-price--featured" : ""}`}>
              {p.featured && <span className="landing-price__badge">Most popular</span>}
              <h3 className="h4">{p.name}</h3>
              <div className="landing-price__amount">
                {p.price}<span style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-muted)" }}>{p.period}</span>
              </div>
              <p className="help-text" style={{ marginBottom: "16px", minHeight: "40px" }}>{p.desc}</p>
              <ul className="landing-price__features">
                {p.features.map((f) => <li key={f}>✓ {f}</li>)}
              </ul>
              <Link href={p.href} className={`btn ${p.featured ? "btn--primary" : "btn--outline"} btn--block`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="help-text landing-section__footnote">
          All plans include: REST API access, dashboard, audit logs, and onchain attestations.
        </p>
      </div>
    </section>
  );
}
