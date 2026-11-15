import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Finding Treasures 4 U — Antiques, Uniques & Sought After Items";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#241f19",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontFamily: "Georgia, serif",
            color: "#f7f2e7",
            fontSize: 76,
          }}
        >
          <span>Finding</span>
          <span style={{ fontStyle: "italic", color: "#c8a35f", margin: "0 20px" }}>
            Treasures
          </span>
          <span>4 U</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#9c7a3f",
          }}
        >
          Antiques, Uniques &amp; Sought After Items
        </div>
        <div
          style={{
            marginTop: 44,
            width: 120,
            height: 2,
            background: "#6c2a33",
          }}
        />
        <div
          style={{
            marginTop: 36,
            fontSize: 22,
            letterSpacing: 2,
            color: "#6a5f4f",
          }}
        >
          Lock Haven, PA · Shipped Worldwide
        </div>
      </div>
    ),
    { ...size }
  );
}
