"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type FilmPlayerProps = {
  title: string;
  embedUrl: string | null;
  youtubeUrl: string;
  thumbnailUrl: string;
};

export function FilmPlayer({ title, embedUrl, youtubeUrl, thumbnailUrl }: FilmPlayerProps) {
  const [mode, setMode] = React.useState<"poster" | "embed">("poster");

  if (mode === "embed" && embedUrl) {
    return (
      <div className="relative h-full w-full bg-black">
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
            className="rounded-xl border-white/14 bg-black/58 text-white hover:bg-black/72"
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
    <div className="relative h-full w-full overflow-hidden bg-black">
      {thumbnailUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.24)_34%,rgba(0,0,0,0.88))]" />
      <div className="absolute inset-x-0 bottom-0 grid gap-3 p-4 sm:p-6">
        <div>
          <p className="sv-overline text-white/56">Watch options</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
            YouTube embeds can fail on some browsers or client configurations. The canonical source link is always available.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {embedUrl ? (
            <Button
              className="sv-btn sv-btn-primary"
              onClick={() => setMode("embed")}
              type="button"
            >
              Play here
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
