export type ParsedYouTubeVideo = {
  videoId: string;
  canonicalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
};

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeVideo(input: string): ParsedYouTubeVideo | null {
  const raw = input.trim();

  if (!raw) {
    return null;
  }

  try {
    const parsed = new URL(raw);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "music.youtube.com") {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/").filter(Boolean)[1] ?? null;
      }
    }

    if (!videoId || !YOUTUBE_ID_PATTERN.test(videoId)) {
      return null;
    }

    return {
      videoId,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch {
    return null;
  }
}

export function buildYouTubeThumbnailUrl(input: string) {
  return parseYouTubeVideo(input)?.thumbnailUrl ?? "";
}

export function buildYouTubeEmbedUrl(input: string) {
  return parseYouTubeVideo(input)?.embedUrl ?? null;
}
