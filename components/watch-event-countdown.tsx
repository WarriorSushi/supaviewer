"use client";

import * as React from "react";
import type { WatchEventStatus } from "@/lib/watch-events";

function formatRemaining(target: Date) {
  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    return "Live now";
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${Math.max(1, minutes)}m`;
}

export function WatchEventCountdown({
  startsAt,
  phase,
}: {
  startsAt: string;
  phase: WatchEventStatus;
}) {
  const [label, setLabel] = React.useState(() => formatRemaining(new Date(startsAt)));

  React.useEffect(() => {
    if (phase !== "scheduled") {
      setLabel(phase === "live" ? "Live now" : phase === "cancelled" ? "Cancelled" : "Ended");
      return;
    }

    const interval = window.setInterval(() => {
      setLabel(formatRemaining(new Date(startsAt)));
    }, 30_000);

    setLabel(formatRemaining(new Date(startsAt)));

    return () => window.clearInterval(interval);
  }, [phase, startsAt]);

  return (
    <span className="sv-chip min-h-[44px] px-4 py-3 text-sm">
      {phase === "scheduled" ? `Starts in ${label}` : label}
    </span>
  );
}
