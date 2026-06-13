import { ImageResponse } from "next/og";

import { profile } from "@/data/profile";

// Branded social-share card, generated at build time. Next auto-wires it as
// og:image and twitter:image for every page.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.title}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #171326 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#a78bfa",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          {profile.location}
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, marginTop: 24 }}>
          {profile.name}
        </div>
        <div style={{ display: "flex", fontSize: 46, color: "#a1a1aa", marginTop: 8 }}>
          {profile.title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#8b8b94",
            marginTop: 40,
            maxWidth: 920,
            lineHeight: 1.4,
          }}
        >
          {profile.tagline}
        </div>
      </div>
    ),
    size,
  );
}
