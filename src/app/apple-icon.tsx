import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, borderRadius: 36, background: "#1a5632", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="100" height="100" viewBox="0 0 20 20" fill="none">
          <path d="M4 10.5L8.5 15L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
