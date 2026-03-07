"use client";

import { useEffect } from "react";

type FilmViewTrackerProps = {
  filmId: string;
};

function getViewKey(filmId: string) {
  const viewedOn = new Date().toISOString().slice(0, 10);
  return `sv:view:${filmId}:${viewedOn}`;
}

export function FilmViewTracker({ filmId }: FilmViewTrackerProps) {
  useEffect(() => {
    const storageKey = getViewKey(filmId);

    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    void fetch(`/api/films/${filmId}/view`, {
      method: "POST",
      credentials: "same-origin",
    })
      .then((response) => {
        if (!response.ok) {
          return;
        }

        window.sessionStorage.setItem(storageKey, "1");
      })
      .catch(() => {
        // Ignore analytics failures. Watching must not depend on this request.
      });
  }, [filmId]);

  return null;
}
