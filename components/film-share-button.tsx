"use client";

import { ShareButton } from "@/components/share-button";

type FilmShareButtonProps = {
  filmId: string;
  path: string;
  title: string;
};

export function FilmShareButton({ filmId, path, title }: FilmShareButtonProps) {
  return (
    <ShareButton
      analyticsTarget={{ filmId, surface: "film-page" }}
      path={path}
      title={title}
    />
  );
}
