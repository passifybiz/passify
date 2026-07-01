import { GraphicBackground } from "@/components/graphics";

export function ApiFlow() {
  return (
    <section id="how-it-works" className="landing-section landing-section--highlight">
      <GraphicBackground
        src="/assets/graphics/api-flow/engineering-blueprint.svg"
        className="graphic-wrap--api-left"
        opacity={0.1}
        animate="pulse"
        parallax
        parallaxSpeed={0.03}
      />
      <GraphicBackground
        src="/assets/graphics/api-flow/node-connections.svg"
        className="graphic-wrap--api-right"
        opacity={0.08}
        animate="drift"
      />
      <div className="container">
        <h2 className="h2 landing-section__heading">Three API calls. Full compliance.</h2>
        <p className="landing-section__sub">No SDK. No Solana programs. Just REST.</p>
        <div className="api-flow">
          <Step n="1" title="Start verification" endpoint="POST /kyc/start" desc="Send the investor's public key. Get back a session URL." arrow />
          <Step n="2" title="Investor completes KYC" endpoint="(automatic)" desc="Redirect to hosted flow. Webhook fires on completion." arrow />
          <Step n="3" title="Check & gate" endpoint="GET /kyc/status/{pubkey}" desc="Returns attestation status. Gate minting, transfers, or access." />
        </div>
        <p className="help-text" style={{ textAlign: "center", marginTop: "32px" }}>
          See the <a href="/docs" style={{ fontWeight: 600 }}>full API documentation</a> for request/response details.
        </p>
      </div>
    </section>
  );
}

function Step({ n, title, endpoint, desc, arrow }: { n: string; title: string; endpoint: string; desc: string; arrow?: boolean }) {
  return (
    <div className="api-flow__step">
      <div className="api-flow__card">
        <div className="api-flow__num">{n}</div>
        <h3 className="h5">{title}</h3>
        <code className="api-flow__endpoint">{endpoint}</code>
        <p className="help-text" style={{ fontSize: "13px", marginTop: "6px" }}>{desc}</p>
      </div>
      {arrow && <div className="api-flow__arrow">→</div>}
    </div>
  );
}
