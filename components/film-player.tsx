"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type FilmPlayerProps = {
  title: string;
  embedUrl: string | null;
  youtubeUrl: string;
  thumbnailUrl: string;
  overlayMode?: "full" | "compact";
};

export function FilmPlayer({
  title,
  embedUrl,
  youtubeUrl,
  thumbnailUrl,
  overlayMode = "full",
}: FilmPlayerProps) {
  const [mode, setMode] = React.useState<"poster" | "embed">("poster");

  if (mode === "embed" && embedUrl) {
    return (
      <div
        className="relative h-full w-full overflow-hidden rounded-xl bg-black"
        style={{
          border: "1px solid color-mix(in oklab, oklch(0.72 0.14 55) 12%, var(--border))",
        }}
      >
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
          referrerPolicy="strict-origin-when-cross-origin"
          src={embedUrl}
          title={title}
        />
        <div className="absolute bottom-3 right-3 flex flex-wrap gap-2">
          <Button
            className="rounded-xl border-white/14 bg-black/58 text-white backdrop-blur-sm hover:bg-black/72"
            onClick={() => setMode("poster")}
            size="sm"
            type="button"
            variant="outline"
          >
            Back to poster
          </Button>
          <Button asChild className="rounded-xl bg-white text-black hover:bg-white/86" size="sm">
            <a href={youtubeUrl} rel="noreferrer" target="_blank">
              Watch on YouTube
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl bg-black"
      style={{
        border: "1px solid color-mix(in oklab, oklch(0.72 0.14 55) 12%, var(--border))",
      }}
    >
      {thumbnailUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.32)_40%,rgba(0,0,0,0.92))]" />
      <div className="absolute inset-x-0 bottom-0 grid gap-3 p-4 sm:p-6">
        {overlayMode === "full" ? (
          <div>
            <p className="sv-overline text-white/56">Watch options</p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-white sm:text-2xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
              YouTube embeds can fail on some browsers or client configurations. The canonical source link is always available.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="sv-overline text-white/56">Do this first</p>
              <p className="mt-2 text-sm text-white/72">
                Play inside the room first. If the embed fails, the canonical YouTube source stays one tap away.
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {embedUrl ? (
            <Button
              className="sv-btn"
              onClick={() => setMode("embed")}
              style={{
                background: "var(--color-accent)",
                color: "var(--primary-foreground)",
                boxShadow: "var(--shadow-btn), 0 0 0 1px oklch(0.72 0.14 55 / 20%)",
              }}
              type="button"
            >
              {overlayMode === "compact" ? "Play the premiere" : "Play here"}
            </Button>
          ) : null}
          <Button asChild className="sv-btn bg-white text-black hover:bg-white/86" variant="outline">
            <a href={youtubeUrl} rel="noreferrer" target="_blank">
              Watch on YouTube
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
