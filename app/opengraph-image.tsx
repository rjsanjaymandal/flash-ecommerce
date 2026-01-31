import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Flash Fashion - Premium Anime Streetwear";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(to bottom right, #09090b, #18181b)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        {/* Flash Logo Placeholder or Text */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: "white",
            display: "flex",
            alignItems: "center",
            letterSpacing: "-0.05em",
          }}
        >
          FLASH
        </div>
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#a1a1aa",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
        }}
      >
        FASHION
      </div>
      <div
        style={{
          marginTop: "40px",
          padding: "10px 30px",
          background: "white",
          color: "black",
          fontSize: 24,
          fontWeight: 700,
          textTransform: "uppercase",
          borderRadius: "50px",
        }}
      >
        Anime Streetwear • India
      </div>
    </div>,
    {
      ...size,
    },
  );
}
