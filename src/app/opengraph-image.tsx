import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "#121212",
          color: "#f2f2f0",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#9b9b9b",
            marginBottom: 28,
          }}
        >
          Quran · İncil · Tövrat · Tenqriçilik
        </div>
        <div style={{ fontSize: 96, fontWeight: 600 }}>{SITE_NAME}</div>
      </div>
    ),
    size,
  );
}
