import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Iwill - Someone left you something in their Will";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Border */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "2px solid rgba(168, 85, 247, 0.3)",
            borderRadius: 20,
          }}
        />

        {/* Skull emoji */}
        <div style={{ fontSize: 180, marginBottom: 20 }}>💀</div>

        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "white",
            marginBottom: 10,
          }}
        >
          Someone left you something
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: "#888888",
            marginBottom: 40,
          }}
        >
          in their Will
        </div>

        {/* Branding */}
        <div
          style={{
            fontSize: 28,
            fontWeight: "bold",
            background: "linear-gradient(90deg, #A855F7, #ec4899)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          IWILL 💀
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
