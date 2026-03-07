"use client";

import * as React from "react";
import { ShareIcon } from "@/components/icons";

type ShareButtonProps = {
  path: string;
  title: string;
  className?: string;
  copiedLabel?: string;
  label?: string;
  analyticsTarget?: {
    filmId?: string;
    creatorId?: string;
    watchEventId?: string;
    surface: string;
  };
};

export function ShareButton({
  path,
  title,
  className = "sv-icon-btn",
  copiedLabel = "Copied",
  label = "Share",
  analyticsTarget,
}: ShareButtonProps) {
  const [state, setState] = React.useState<"idle" | "copied">("idle");

  React.useEffect(() => {
    if (state !== "copied") {
      return;
    }

    const timer = window.setTimeout(() => setState("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function trackShare() {
    if (!analyticsTarget) {
      return;
    }

    try {
      await fetch("/api/share-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analyticsTarget),
      });
    } catch {
      // Share analytics should never block the share interaction.
    }
  }

  async function onShare() {
    const origin = window.location.origin || "https://supaviewer.com";
    const url = new URL(path, origin).toString();

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        await trackShare();
        return;
      } catch {
        // Fall back to clipboard copy below.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      await trackShare();
    } catch {
      window.prompt("Copy this Supaviewer link", url);
    }
  }

  return (
    <button
      aria-label={state === "copied" ? "Link copied" : `Share ${title}`}
      className={className}
      onClick={onShare}
      title={state === "copied" ? "Link copied" : label}
      type="button"
    >
      <ShareIcon className="h-4 w-4" />
      {state === "copied" ? copiedLabel : label}
    </button>
  );
}
