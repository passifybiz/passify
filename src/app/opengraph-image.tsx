import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Passify — Identity verification and compliance for Solana RWA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "linear-gradient(135deg, #1a5632 0%, #1e6b3e 40%, #1a5632 100%)", padding: "60px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
                <path d="M4 10.5L8.5 15L16 6" stroke="#1a5632" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontSize: "48px", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>passify</span>
          </div>
          <div style={{ fontSize: "28px", color: "rgba(255,255,255,0.9)", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
            Identity verification and compliance rules for Solana RWA.
          </div>
          <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.65)", textAlign: "center", maxWidth: "600px", lineHeight: 1.5 }}>
            API-first identity and compliance layer for Solana RWA platforms. One KYC, every tokenized asset.
          </div>
          <div style={{ display: "flex", gap: "24px", marginTop: "16px", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
            <span>passify.biz</span>
            <span>·</span>
            <span>Solana RWA Infrastructure</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
