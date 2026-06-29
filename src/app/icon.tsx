import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, borderRadius: 6, background: "#1a5632", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10.5L8.5 15L16 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
