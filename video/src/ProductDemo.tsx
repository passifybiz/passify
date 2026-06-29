import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const GREEN = "#1a5632";
const BG = "#fafaf8";
const BORDER = "#e5e7eb";
const MUTED = "#555b64";

export const ProductDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Scene 1: Intro (0-5s) */}
      <Sequence from={0} durationInFrames={150}>
        <Intro />
      </Sequence>

      {/* Scene 2: Problem (5-12s) */}
      <Sequence from={150} durationInFrames={210}>
        <ProblemScene />
      </Sequence>

      {/* Scene 3: Solution (12-20s) */}
      <Sequence from={360} durationInFrames={240}>
        <SolutionScene />
      </Sequence>

      {/* Scene 4: Dashboard (20-30s) */}
      <Sequence from={600} durationInFrames={300}>
        <DashboardScene />
      </Sequence>

      {/* Scene 5: API Integration (30-40s) */}
      <Sequence from={900} durationInFrames={300}>
        <ApiScene />
      </Sequence>

      {/* Scene 6: Compliance (40-50s) */}
      <Sequence from={1200} durationInFrames={300}>
        <ComplianceScene />
      </Sequence>

      {/* Scene 7: CTA (50-60s) */}
      <Sequence from={1500} durationInFrames={300}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};

function Intro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const textOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: GREEN }}>
      <div style={{ transform: `scale(${logoScale})`, fontSize: "72px", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
        passify
      </div>
      <div style={{ opacity: textOpacity, color: "rgba(255,255,255,0.7)", fontSize: "24px", marginTop: "16px" }}>
        Compliance infrastructure for tokenized assets
      </div>
    </AbsoluteFill>
  );
}

function ProblemScene() {
  const frame = useCurrentFrame();
  const items = [
    "Investors re-verify on every platform",
    "Personal data exposed on public ledgers",
    "Compliance locked in smart contracts",
  ];

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px" }}>
      <h2 style={{ fontSize: "48px", fontWeight: 700, marginBottom: "48px", color: "#1a1a1a" }}>The problem</h2>
      {items.map((item, i) => {
        const opacity = interpolate(frame, [i * 40 + 20, i * 40 + 50], [0, 1], { extrapolateRight: "clamp" });
        const x = interpolate(frame, [i * 40 + 20, i * 40 + 50], [30, 0], { extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ opacity, transform: `translateX(${x}px)`, fontSize: "28px", color: MUTED, marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "#dc2626", fontSize: "20px" }}>✕</span> {item}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function SolutionScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px" }}>
      <h2 style={{ fontSize: "48px", fontWeight: 700, marginBottom: "16px" }}>One API. Full compliance.</h2>
      <p style={{ fontSize: "24px", color: MUTED, marginBottom: "48px" }}>Passify handles KYC, attestations, and rules.</p>
      <div style={{ transform: `scale(${scale})`, display: "flex", gap: "32px" }}>
        {["Verify once", "Zero PII on-chain", "Update rules instantly"].map((t, i) => (
          <div key={i} style={{ background: "white", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, color: GREEN, marginBottom: "8px" }}>0{i + 1}</div>
            <div style={{ fontSize: "18px" }}>{t}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function DashboardScene() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px" }}>
      <h2 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "32px" }}>The dashboard</h2>
      <div style={{ opacity, width: "900px", background: "white", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", borderBottom: `1px solid ${BORDER}`, paddingBottom: "16px" }}>
          <span style={{ fontWeight: 700, color: GREEN, fontSize: "18px" }}>passify</span>
          <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: MUTED }}>
            <span style={{ color: GREEN, fontWeight: 600 }}>Dashboard</span>
            <span>KYC</span><span>Rules</span><span>Keys</span><span>Audit</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <StatBox value="1,247" label="Attestations" />
          <StatBox value="8" label="Integrations" />
          <StatBox value="94%" label="Reuse rate" />
        </div>
        <div style={{ fontSize: "14px" }}>
          {["Attestation Issued — 7xKX...AsU — Verified", "KYC Started — 9bRT...kL2 — Pending", "Rule Updated — Jurisdiction change"].map((row, i) => {
            const rowOpacity = interpolate(frame, [60 + i * 20, 80 + i * 20], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ opacity: rowOpacity, padding: "10px 0", borderBottom: `1px solid ${BORDER}`, color: MUTED }}>
                {row}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "16px", textAlign: "center" }}>
      <div style={{ fontSize: "28px", fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: "12px", color: MUTED }}>{label}</div>
    </div>
  );
}

function ApiScene() {
  const frame = useCurrentFrame();
  const codeOpacity = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp" });
  const responseOpacity = interpolate(frame, [120, 150], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px" }}>
      <h2 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "32px" }}>Integrate in minutes</h2>
      <div style={{ display: "flex", gap: "24px" }}>
        <div style={{ opacity: codeOpacity, background: "#1e1e1e", borderRadius: "8px", padding: "24px", width: "500px" }}>
          <pre style={{ color: "#d4d4d4", fontSize: "14px", fontFamily: "JetBrains Mono, monospace", lineHeight: 1.6 }}>
{`POST /api/v1/kyc/start
Authorization: Bearer passify_live_...

{
  "userPubkey": "7xKX...AsU",
  "schemaId": "kyc_individual_v1"
}`}
          </pre>
        </div>
        <div style={{ opacity: responseOpacity, background: "white", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px", width: "350px" }}>
          <div style={{ fontSize: "12px", color: GREEN, fontWeight: 600, marginBottom: "8px" }}>✓ 200 OK</div>
          <pre style={{ fontSize: "14px", fontFamily: "JetBrains Mono, monospace", lineHeight: 1.6, color: "#1a1a1a" }}>
{`{
  "session_url": "https://...",
  "session_id": "bp_a1b2c3"
}`}
          </pre>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ComplianceScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px" }}>
      <h2 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "16px" }}>Compliance without contracts</h2>
      <p style={{ fontSize: "20px", color: MUTED, marginBottom: "40px" }}>Update rules from the dashboard. No redeployments.</p>
      <div style={{ display: "flex", gap: "24px" }}>
        {[
          { title: "Jurisdiction", value: "US, CA, GB", icon: "🌍" },
          { title: "Min investment", value: "$10,000", icon: "💰" },
          { title: "Max holders", value: "500", icon: "👥" },
        ].map((rule, i) => {
          const y = interpolate(frame, [i * 30 + 20, i * 30 + 50], [20, 0], { extrapolateRight: "clamp" });
          const opacity = interpolate(frame, [i * 30 + 20, i * 30 + 50], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ opacity, transform: `translateY(${y}px)`, background: "white", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px", width: "200px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{rule.icon}</div>
              <div style={{ fontSize: "14px", color: MUTED, marginBottom: "4px" }}>{rule.title}</div>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{rule.value}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function CtaScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, delay: 30, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: GREEN }}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <h2 style={{ fontSize: "52px", fontWeight: 700, color: "white", marginBottom: "16px" }}>
          Ship compliant tokens this week
        </h2>
        <p style={{ fontSize: "22px", color: "rgba(255,255,255,0.7)", marginBottom: "32px" }}>
          Free tier. No credit card. No contract.
        </p>
        <div style={{ background: "white", color: GREEN, fontWeight: 700, fontSize: "20px", padding: "14px 40px", borderRadius: "6px", display: "inline-block" }}>
          Get started at passify.biz
        </div>
      </div>
    </AbsoluteFill>
  );
}
