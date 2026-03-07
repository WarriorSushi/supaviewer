import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getFilmByIdentifier } from "@/lib/catalog";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type FilmImageProps = {
  params: Promise<{ identifier: string }>;
};

export default async function FilmOpenGraphImage({ params }: FilmImageProps) {
  const { identifier } = await params;
  const film = await getFilmByIdentifier(identifier);

  if (!film) {
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
            "linear-gradient(135deg, rgba(20,20,24,1) 0%, rgba(8,8,10,1) 62%, rgba(103,10,16,0.92) 100%)",
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
              width: "74%",
              padding: 40,
            }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={pillStyle("rgba(255,255,255,0.08)", "rgba(255,255,255,0.14)")}>{film.format}</span>
              {film.founderBadge ? (
                <span style={pillStyle("rgba(229,9,20,0.16)", "rgba(229,9,20,0.5)")}>{film.founderBadge.name}</span>
              ) : null}
              {film.trophies.slice(0, 2).map((trophy) => (
                <span key={trophy.slug} style={pillStyle("rgba(255,255,255,0.08)", "rgba(255,255,255,0.14)")}>
                  {trophy.name}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ fontSize: 18, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.52)" }}>
                Supaviewer #{film.serial}
              </div>
              <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 0.98, maxWidth: 720 }}>{film.title}</div>
              <div style={{ fontSize: 24, lineHeight: 1.45, color: "rgba(255,255,255,0.72)", maxWidth: 760 }}>
                {film.logline || film.synopsis || `${film.creatorName} on Supaviewer`}
              </div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <Metric label="Creator" value={film.creatorName} />
              <Metric label="Runtime" value={`${film.runtimeMinutes} min`} />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "26%",
              padding: 32,
              background: "rgba(255,255,255,0.04)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                minHeight: 174,
                fontSize: 80,
                fontWeight: 700,
              }}
            >
              #{film.serial}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 16, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.48)" }}>
                Canonical watch page
              </div>
              <div style={{ fontSize: 22, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>
                supaviewer.com/films/{film.serial}-{film.slug}
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
        minWidth: 160,
        padding: "16px 18px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <span style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 3, color: "rgba(255,255,255,0.5)" }}>{label}</span>
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
