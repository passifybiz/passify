import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#1a5632",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* P letter in white/cream */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#f5f5f0",
            fontFamily: "system-ui, sans-serif",
            position: "relative",
            display: "flex",
          }}
        >
          P
        </div>
        {/* Green accent slash */}
        <div
          style={{
            position: "absolute",
            width: 3,
            height: 14,
            background: "#4ade80",
            transform: "rotate(-45deg) translate(-2px, 4px)",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
