import { HeroAuthButton } from "./auth-buttons";
import { IdentityNetwork } from "./identity-network";

export function Hero() {
  return (
    <section className="landing-hero">
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
          once; every connected platform reads the same attestation. No PII on-chain, no
          contract redeploys to change a rule.
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
