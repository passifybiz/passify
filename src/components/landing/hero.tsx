import { HeroAuthButton } from "./auth-buttons";

export function Hero() {
  return (
    <section className="landing-hero">
      <div className="container landing-hero__inner">
        <span className="landing-eyebrow">Compliance infrastructure for tokenized assets</span>
        <h1 className="landing-hero__title">
          KYC, attestations, and compliance rules — <em>one API</em>.
        </h1>
        <p className="landing-hero__sub">
          Passify provides identity verification, onchain attestations, and mutable compliance rules for Solana RWA platforms. No PII stored on-chain. No contract redeployments to update rules.
        </p>
        <div className="row landing-hero__cta">
          <HeroAuthButton />
          <a href="/docs" className="btn btn--outline btn--lg">Read the docs</a>
        </div>
        <p className="text-muted" style={{ fontSize: "12px", marginTop: "16px" }}>Free tier available. No credit card required.</p>
      </div>
    </section>
  );
}
