"use client";

import { useState } from "react";
import { GraphicBackground } from "@/components/graphics";

const TABS = ["Dashboard", "KYC", "Rules", "Keys", "Audit"] as const;
type Tab = typeof TABS[number];

export function ProductPreview() {
  const [tab, setTab] = useState<Tab>("Dashboard");

  return (
    <section className="landing-section">
      <GraphicBackground
        src="/assets/graphics/dashboard/dashboard-mesh.svg"
        className="graphic-wrap--dashboard-full"
        opacity={0.2}
        animate="pulse"
        parallax
        parallaxSpeed={0.01}
      />
      <GraphicBackground
        src="/assets/graphics/dashboard/compliance-matrix.svg"
        className="graphic-wrap--dashboard-right"
        opacity={0.15}
        animate="drift"
      />
      <div className="container">
        <h2 className="h2 landing-section__heading">See it in action</h2>
        <p className="landing-section__sub">Interactive preview with example data. Click tabs to explore.</p>
        <div className="product-mockup">
          <div className="product-mockup__bar">
            <div className="product-mockup__dots"><span /><span /><span /></div>
            <span className="product-mockup__url">passify.biz/{tab.toLowerCase()}</span>
          </div>
          <div className="product-mockup__body">
            <div className="pm-header">
              <span className="pm-logo">Passify</span>
              <div className="pm-nav">
                {TABS.map((t) => (
                  <button key={t} className={`pm-nav__item${t === tab ? " pm-nav__item--active" : ""}`} onClick={() => setTab(t)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {tab === "Dashboard" && <DashboardView />}
            {tab === "KYC" && <KycView />}
            {tab === "Rules" && <RulesView />}
            {tab === "Keys" && <KeysView />}
            {tab === "Audit" && <AuditView />}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardView() {
  return (
    <>
      <div className="pm-stats">
        <div className="pm-stat"><div className="pm-stat__value">1,247</div><div className="pm-stat__label">Attestations</div></div>
        <div className="pm-stat"><div className="pm-stat__value">8</div><div className="pm-stat__label">Active integrations</div></div>
        <div className="pm-stat"><div className="pm-stat__value">94%</div><div className="pm-stat__label">Cross-platform reuse</div></div>
      </div>
      <div className="pm-table">
        <div className="pm-table__header"><span>Time</span><span>Type</span><span>User</span><span>Status</span></div>
        <div className="pm-table__row"><span className="pm-muted">2m ago</span><span>Attestation</span><span className="pm-mono">7xKX...AsU</span><span className="pm-status pm-status--success">Verified</span></div>
        <div className="pm-table__row"><span className="pm-muted">5m ago</span><span>KYC Started</span><span className="pm-mono">9bRT...kL2</span><span className="pm-status pm-status--warning">Pending</span></div>
        <div className="pm-table__row"><span className="pm-muted">12m ago</span><span>Rule Update</span><span className="pm-mono">—</span><span className="pm-status pm-status--muted">Updated</span></div>
      </div>
    </>
  );
}

function KycView() {
  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Verify an Investor</div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <div style={{ flex: 1, height: "36px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0 12px", display: "flex", alignItems: "center", fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>7xKXtg2CW87d97TXJSDpbD5jBkh...</div>
        <div style={{ height: "36px", padding: "0 16px", background: "var(--primary)", color: "white", borderRadius: "4px", display: "flex", alignItems: "center", fontSize: "12px", fontWeight: 600 }}>Start Verification</div>
      </div>
      <div style={{ background: "var(--primary-light)", border: "1px solid var(--border)", borderRadius: "4px", padding: "12px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
        <div style={{ color: "var(--primary)", fontWeight: 600, marginBottom: "4px" }}>✓ Session created</div>
        <div style={{ color: "var(--text-muted)" }}>Redirect to: https://verify.blockpass.org/session/bp_a1b2c3</div>
      </div>
    </div>
  );
}

function RulesView() {
  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Compliance Rules — US Real Estate Fund</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {[
          { label: "Required schema", value: "kyc_accredited_v1" },
          { label: "Jurisdictions", value: "US, CA, GB" },
          { label: "Min investment", value: "$10,000" },
          { label: "Max holders", value: "500" },
        ].map((r) => (
          <div key={r.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", padding: "10px 12px" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{r.label}</div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeysView() {
  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>API Keys</div>
        <div style={{ height: "28px", padding: "0 12px", border: "1px solid var(--primary)", color: "var(--primary)", borderRadius: "4px", display: "flex", alignItems: "center", fontSize: "11px", fontWeight: 600 }}>+ Create</div>
      </div>
      {[
        { prefix: "passify_live_7a3f", tier: "Pro", usage: "2,847 / 10,000" },
        { prefix: "passify_live_9b2e", tier: "Free", usage: "124 / 500" },
      ].map((k) => (
        <div key={k.prefix} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", padding: "10px 12px", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{k.prefix}****</span>
            <span className="pm-status pm-status--success" style={{ marginLeft: "8px" }}>Active</span>
          </div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{k.tier} · {k.usage}</span>
        </div>
      ))}
    </div>
  );
}

function AuditView() {
  return (
    <div className="pm-table" style={{ marginTop: "20px" }}>
      <div className="pm-table__header"><span>Time</span><span>Actor</span><span>Action</span><span>Entity</span></div>
      <div className="pm-table__row"><span className="pm-muted">09:14</span><span>sarah@passify.biz</span><span>rule_updated</span><span className="pm-mono">us_fund_v1</span></div>
      <div className="pm-table__row"><span className="pm-muted">09:02</span><span>system</span><span>attestation_issued</span><span className="pm-mono">att_m3k...</span></div>
      <div className="pm-table__row"><span className="pm-muted">08:55</span><span>sarah@passify.biz</span><span>api_key_created</span><span className="pm-mono">key_9b2e</span></div>
    </div>
  );
}
