import { ImageResponse } from "next/og";

export const alt = "Common — community conversations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function SocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 90,
          background: "#f9f8f5",
          color: "#21212c",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="96" height="96" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#4946a6" />
            <g
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinejoin="round"
            >
              <path d="M14 15h27v23H24l-10 9V15Z" />
              <path d="M43 26h7v24l-8-6H31v-4" />
            </g>
          </svg>
          <span style={{ fontSize: 80, fontWeight: 700 }}>Common</span>
        </div>
        <p style={{ fontSize: 42, marginTop: 40, color: "#4946a6" }}>
          Community conversations.
        </p>
        <p style={{ fontSize: 30, marginTop: 0 }}>
          Explore communities. Share posts. Join the discussion.
        </p>
      </div>
    ),
    size,
  );
}
