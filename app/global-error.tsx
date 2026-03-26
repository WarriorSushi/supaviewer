"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0f0e0c", color: "#ede8df", margin: 0 }}>
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#b08a5a", fontWeight: 600 }}>
            Something went wrong
          </p>
          <h1 style={{ marginTop: "1.25rem", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 500, letterSpacing: "-0.03em" }}>
            Supaviewer hit a snag.
          </h1>
          <p style={{ marginTop: "0.75rem", fontSize: "0.94rem", color: "#8a8070", maxWidth: "28rem", lineHeight: 1.6 }}>
            The page couldn&apos;t load. This is usually temporary.
          </p>
          <button
            onClick={() => reset()}
            style={{ marginTop: "1.5rem", padding: "0.7rem 1.5rem", background: "#b08a5a", color: "#0f0e0c", border: "none", borderRadius: "0.75rem", fontSize: "0.86rem", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
