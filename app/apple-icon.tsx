import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  try {
    const filePath = join(process.cwd(), "public/flash-logo.jpg");
    const file = readFileSync(filePath);
    const base64 = file.toString("base64");
    const src = `data:image/jpeg;base64,${base64}`;

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Apple Icon"
          width="100%"
          height="100%"
          style={{
            objectFit: "cover",
          }}
        />
      </div>,
      {
        ...size,
      },
    );
  } catch (e) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 120,
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 800,
        }}
      >
        F
      </div>,
      { ...size },
    );
  }
}
