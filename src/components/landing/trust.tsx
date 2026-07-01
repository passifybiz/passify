import Link from "next/link";
import { GraphicBackground } from "@/components/graphics";

export function Trust() {
  return (
    <section className="landing-section" style={{ padding: "40px 0", borderBottom: "1px solid var(--border)" }}>
      <GraphicBackground
        src="/assets/graphics/solution/verification-pipeline.svg"
        className="graphic-wrap--trust-strip"
        opacity={0.06}
        animate="fade"
      />
      <div className="container">
        <div className="row" style={{ justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
          <Stat value="0" label="PII stored on-chain" />
          <Stat value="3" label="API endpoints to integrate" />
          <Stat value="REST" label="no SDK required" />
          <Stat value="Solana" label="Token-2022 compatible" />
        </div>
        <div className="row" style={{ justifyContent: "center", gap: "24px", marginTop: "20px" }}>
          <Link href="/security" className="text-muted text-xs" style={{ textDecoration: "underline" }}>Security overview →</Link>
          <Link href="/docs" className="text-muted text-xs" style={{ textDecoration: "underline" }}>API documentation →</Link>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: "100px" }}>
      <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary)" }}>{value}</div>
      <p className="text-muted text-xs">{label}</p>
    </div>
  );
}
