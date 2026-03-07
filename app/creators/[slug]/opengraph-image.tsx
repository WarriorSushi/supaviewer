import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getCreatorBySlug, getFilmsForCreator } from "@/lib/catalog";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type CreatorImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CreatorOpenGraphImage({ params }: CreatorImageProps) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

  if (!creator) {
    notFound();
  }

  const films = await getFilmsForCreator(creator.slug);
  const serialLine = creator.notableSerials.length
    ? creator.notableSerials.map((serial) => `#${serial}`).join("  /  ")
    : "Canonical creator profile";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 48,
          background:
            "linear-gradient(135deg, rgba(24,24,28,1) 0%, rgba(10,10,12,1) 58%, rgba(103,10,16,0.96) 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.14)",
            padding: 40,
            background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 780 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={pillStyle("rgba(229,9,20,0.18)", "rgba(229,9,20,0.6)")}>Supaviewer creator</span>
                {creator.founderBadge ? (
                  <span style={pillStyle("rgba(229,9,20,0.14)", "rgba(229,9,20,0.45)")}>
                    {creator.founderBadge.name}
                  </span>
                ) : null}
              </div>
              <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.02 }}>{creator.name}</div>
              <div style={{ fontSize: 24, lineHeight: 1.45, color: "rgba(255,255,255,0.74)" }}>
                {creator.headline || creator.bio || "AI-native long-form filmmaker"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                width: 136,
                height: 136,
                borderRadius: 28,
                border: "1px solid rgba(255,255,255,0.14)",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.06)",
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              {creator.name.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {creator.trophies.slice(0, 3).map((trophy) => (
              <span key={trophy.slug} style={pillStyle("rgba(255,255,255,0.08)", "rgba(255,255,255,0.2)")}>
                {trophy.name}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                Canonical filmography
              </div>
              <div style={{ fontSize: 28, fontWeight: 600 }}>{serialLine}</div>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <Metric label="Films" value={String(films.length)} />
              <Metric label="Trophies" value={String(creator.trophies.length)} />
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
        minWidth: 120,
        padding: "16px 18px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <span style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 3, color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontSize: 34, fontWeight: 700 }}>{value}</span>
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
