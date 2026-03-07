import { NextResponse } from "next/server";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const eventId = String(payload.eventId ?? "").trim();

  if (!eventId) {
    return NextResponse.json({ error: "Event id is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("watch_event_replay_interests").upsert(
    {
      event_id: eventId,
      profile_id: profile.id,
    },
    {
      onConflict: "event_id,profile_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    return NextResponse.json({ error: "Replay interest could not be recorded." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
