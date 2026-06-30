import { CtaAuthButton } from "./auth-buttons";

export function Cta() {
  return (
    <section className="landing-cta">
      <div className="container landing-cta__inner">
        <h2 className="landing-cta__title">Ready to integrate?</h2>
        <p className="landing-cta__sub">
          Free tier includes 500 attestations/month. Read the docs, create an API key, and start building.
        </p>
        <div className="row landing-cta__actions">
          <CtaAuthButton />
          <a href="mailto:sales@passify.biz" className="btn btn--outline-white btn--lg">Talk to sales</a>
        </div>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", marginTop: "16px" }}>
          No credit card required
        </p>
      </div>
    </section>
  );
}
