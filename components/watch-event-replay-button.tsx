"use client";

import * as React from "react";

type WatchEventReplayButtonProps = {
  eventId: string;
  initialCount: number;
  enabled: boolean;
};

export function WatchEventReplayButton({
  eventId,
  initialCount,
  enabled,
}: WatchEventReplayButtonProps) {
  const [count, setCount] = React.useState(initialCount);
  const [requested, setRequested] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function requestReplay() {
    if (!enabled) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?next=${next}`;
      return;
    }

    if (requested) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/watch-events/replay-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Replay interest could not be saved.");
        return;
      }

      setRequested(true);
      setCount((current) => current + 1);
      setError(null);
    });
  }

  return (
    <div className="grid gap-2">
      <button
        className="sv-btn sv-btn-secondary"
        data-testid="watch-event-replay-button"
        disabled={isPending || requested}
        onClick={requestReplay}
        type="button"
      >
        {requested ? "Replay requested" : isPending ? "Saving..." : "Request replay"}
      </button>
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {count} replay request{count === 1 ? "" : "s"}
      </p>
      {error ? <p className="text-sm text-rose-100">{error}</p> : null}
    </div>
  );
}
