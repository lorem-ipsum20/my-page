import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";

/**
 * The 1200x630 social share card for the home route, rendered at build time
 * from the same data.ts the site reads. Satori (the renderer) supports only
 * flexbox and linear gradients — no grid, no radial-gradient, no external
 * images — which shapes the design below.
 */
export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          position: "relative",
          backgroundColor: "#0b0d12",
          color: "#f1f3fa",
          overflow: "hidden",
        }}
      >
        {/* Brand-blue glows, echoed from the mascot's dark palette */}
        <div
          style={{
            position: "absolute",
            top: -320,
            right: -240,
            width: 900,
            height: 900,
            borderRadius: 9999,
            background:
              "linear-gradient(135deg, rgba(59, 110, 245, 0.38), rgba(59, 110, 245, 0))",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -360,
            left: -260,
            width: 700,
            height: 700,
            borderRadius: 9999,
            background:
              "linear-gradient(45deg, rgba(122, 162, 255, 0.16), rgba(122, 162, 255, 0))",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 22,
              background: "linear-gradient(135deg, #3b6ef5, #7aa2ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            AS
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 9999,
              border: "1px solid rgba(122, 162, 255, 0.4)",
              fontSize: 22,
              color: "#7aa2ff",
            }}
          >
            Portfolio
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: -2 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 30, color: "#7aa2ff", marginTop: 10 }}>
            {profile.role}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(241, 243, 250, 0.72)",
              marginTop: 24,
              maxWidth: 940,
              lineHeight: 1.5,
            }}
          >
            {profile.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(241, 243, 250, 0.6)",
          }}
        >
          <div style={{ display: "flex" }}>{profile.location}</div>
          <div style={{ display: "flex", margin: "0 18px", color: "#7aa2ff" }}>
            ·
          </div>
          <div style={{ display: "flex" }}>{profile.email}</div>
          <div style={{ display: "flex", margin: "0 18px", color: "#7aa2ff" }}>
            ·
          </div>
          <div style={{ display: "flex" }}>github.com/aman-singanamala</div>
        </div>
      </div>
    ),
    size,
  );
}
