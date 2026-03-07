import { NextResponse, type NextRequest } from "next/server";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedOrigins = new Set([
  "https://supaviewer.com",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
]);

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && !allowedOrigins.has(origin)) {
    return NextResponse.json({ error: "forbidden-origin" }, { status: 403 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const filmId = typeof (payload as { filmId?: unknown })?.filmId === "string"
    ? (payload as { filmId: string }).filmId.trim()
    : "";
  const creatorId = typeof (payload as { creatorId?: unknown })?.creatorId === "string"
    ? (payload as { creatorId: string }).creatorId.trim()
    : "";
  const watchEventId = typeof (payload as { watchEventId?: unknown })?.watchEventId === "string"
    ? (payload as { watchEventId: string }).watchEventId.trim()
    : "";
  const surface = typeof (payload as { surface?: unknown })?.surface === "string"
    ? (payload as { surface: string }).surface.trim().slice(0, 64)
    : "unknown";

  const populatedTargets = [filmId, creatorId, watchEventId].filter(Boolean);

  if (populatedTargets.length !== 1 || !surface) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  const { profile } = await getCurrentSessionProfile();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("share_events").insert({
    profile_id: profile?.id ?? null,
    film_id: filmId || null,
    creator_id: creatorId || null,
    watch_event_id: watchEventId || null,
    surface,
  });

  if (error) {
    return NextResponse.json({ error: "insert-failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
