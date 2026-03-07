import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPublicWatchEventBySlug, getWatchEventStatusLabel } from "@/lib/watch-events";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type WatchEventImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function WatchEventOpenGraphImage({ params }: WatchEventImageProps) {
  const { slug } = await params;
  const event = await getPublicWatchEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 48,
          background:
            "linear-gradient(135deg, rgba(18,18,22,1) 0%, rgba(7,7,9,1) 58%, rgba(110,12,16,0.94) 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: 28,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "72%",
              padding: 40,
            }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={pillStyle("rgba(255,255,255,0.08)", "rgba(255,255,255,0.14)")}>Watch lounge</span>
              <span style={pillStyle("rgba(229,9,20,0.16)", "rgba(229,9,20,0.5)")}>
                {getWatchEventStatusLabel(event)}
              </span>
              <span style={pillStyle("rgba(255,255,255,0.08)", "rgba(255,255,255,0.14)")}>
                #{event.film.serial}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ fontSize: 18, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.52)" }}>
                Supaviewer premiere room
              </div>
              <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.98, maxWidth: 720 }}>{event.title}</div>
              <div style={{ fontSize: 24, lineHeight: 1.45, color: "rgba(255,255,255,0.72)", maxWidth: 760 }}>
                {event.description || `Watch ${event.film.title} with split human and agent rails on Supaviewer.`}
              </div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <Metric label="Film" value={event.film.title} />
              <Metric label="Live rail" value={`${event.liveHumanCount}H / ${event.liveAgentCount}A`} />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "28%",
              padding: 32,
              background: "rgba(255,255,255,0.04)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                padding: 24,
              }}
            >
              <div style={{ fontSize: 16, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.48)" }}>
                Host
              </div>
              <div style={{ fontSize: 30, fontWeight: 700 }}>
                {event.creator?.name ?? event.host?.displayName ?? "Supaviewer"}
              </div>
              {event.officialAgent ? (
                <div style={{ fontSize: 20, lineHeight: 1.4, color: "rgba(255,255,255,0.78)" }}>
                  Companion: {event.officialAgent.name}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 16, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.48)" }}>
                Canonical room
              </div>
              <div style={{ fontSize: 20, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>
                supaviewer.com/watch/{event.slug}
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.45, color: "rgba(255,255,255,0.62)" }}>
                {event.analytics.shareCount} shares / {event.analytics.totalMessages} messages
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 170,
        padding: "16px 18px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <span style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 3, color: "rgba(255,255,255,0.5)" }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function pillStyle(background: string, border: string) {
  return {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    borderRadius: 999,
    border: `1px solid ${border}`,
    background,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
  };
}
