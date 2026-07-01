import Link from "next/link";
import { ContractAddress } from "@/components/site/token-address";
import { TICKER, TOKEN, formatSupply } from "@/lib/token";
import { GraphicBackground } from "@/components/graphics";

const POINTS = [
  { title: "Usage credits", body: "Pay for attestations and API throughput. Optional — fiat plans stay available." },
  { title: "Staking", body: "Platforms stake for higher rate limits and priority processing." },
  { title: "Governance", body: "Holders steer schemas, default rules, and treasury allocation." },
];

/**
 * Landing-page token section. Marketing-light, grounded, and clearly labelled
 * pre-launch. Links into the full token documentation. Reads ticker, supply,
 * and the placeholder contract address from the single token source of truth.
 */
export function TokenSection() {
  return (
    <section id="token" className="landing-section landing-section--alt">
      <GraphicBackground
        src="/assets/graphics/token/token-utility.svg"
        className="graphic-wrap--token-center"
        opacity={0.06}
        animate="float"
        parallax
        parallaxSpeed={0.02}
      />
      <GraphicBackground
        src="/assets/graphics/token/governance-network.svg"
        className="graphic-wrap--token-left"
        opacity={0.06}
        animate="drift"
      />
      <GraphicBackground
        src="/assets/graphics/token/staking-ecosystem.svg"
        className="graphic-wrap--token-right"
        opacity={0.05}
        animate="pulse"
      />
      <div className="container">
        <h2 className="h2 landing-section__heading">The {TICKER} token</h2>
        <p className="landing-section__sub">
          An optional coordination layer over the Passify API — usage credits, staking, and governance.
          Passify works fully without it.
        </p>

        <div className="token-section__card">
          <div className="token-section__row">
            <div>
              <ul className="stack" style={{ gap: "var(--space-4)", listStyle: "none" }}>
                {POINTS.map((p) => (
                  <li key={p.title} className="landing-step">
                    <span className="landing-step__num" aria-hidden="true">→</span>
                    <div>
                      <p className="h5">{p.title}</p>
                      <p className="help-text">{p.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="stack" style={{ gap: "var(--space-4)" }}>
              <div className="token-grid">
                <div className="token-stat">
                  <div className="token-stat__value">{TICKER}</div>
                  <div className="token-stat__label">Ticker</div>
                </div>
                <div className="token-stat">
                  <div className="token-stat__value">{formatSupply()}</div>
                  <div className="token-stat__label">Max supply (proposed)</div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted" style={{ marginBottom: "var(--space-2)" }}>
                  Contract address ({TOKEN.network})
                </p>
                <ContractAddress />
              </div>
              <p className="text-xs text-muted">
                Pre-launch. Figures are proposed and may change. Not financial advice.
              </p>
            </div>
          </div>
        </div>

        <p className="landing-section__footnote">
          <Link href="/docs/tokenomics" className="btn btn--outline">Read the tokenomics</Link>
        </p>
      </div>
    </section>
  );
}
