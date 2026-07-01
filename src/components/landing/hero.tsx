import { HeroAuthButton } from "./auth-buttons";
import { IdentityNetwork } from "./identity-network";
import { GraphicBackground } from "@/components/graphics";

export function Hero() {
  return (
    <section className="landing-hero">
      <GraphicBackground
        src="/assets/graphics/hero/trust-network.svg"
        className="graphic-wrap--hero-center"
        opacity={0.2}
        animate="fade"
        zIndex={0}
      />
      <GraphicBackground
        src="/assets/graphics/hero/compliance-pathways.svg"
        opacity={0.12}
        animate="drift"
        overflow
        zIndex={0}
        className="graphic-wrap--hero-center"
        parallax
        parallaxSpeed={0.02}
      />
      <div className="container landing-hero__inner">
        <span className="landing-eyebrow">
          <span className="landing-eyebrow__dot" aria-hidden="true" />
          Compliance infrastructure for tokenized assets
        </span>
        <h1 className="landing-hero__title">
          One identity. <em>Every</em> tokenized asset.
        </h1>
        <p className="landing-hero__sub">
          Passify is the identity and compliance layer for Solana RWA. Investors verify
          once; every connected platform reads the same <em>attestation</em> — a tamper-proof
          record that verification happened, with no personal data on-chain and no contract
          redeploys to change a rule.
        </p>
        <div className="row landing-hero__cta">
          <HeroAuthButton />
          <a href="/docs" className="btn btn--outline btn--lg">Read the docs</a>
        </div>
        <p className="landing-hero__note">Free tier · 500 attestations/month · No credit card</p>
        <IdentityNetwork />
      </div>
    </section>
  );
}
