import { NextResponse } from "next/server";
import { getCurrentSessionProfile } from "@/lib/auth";
import {
  finalizeWatchEventActivity,
  getWatchEventInteractionError,
  resolveWatchEventRecord,
  upsertHumanWatchEventAttendee,
  type WatchPresenceState,
} from "@/lib/watch-events";

export const dynamic = "force-dynamic";

const validPresenceStates = new Set<WatchPresenceState>([
  "watching",
  "taking-notes",
  "answering-questions",
  "hosting",
  "away",
]);

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
  const presenceState = String(payload.presenceState ?? "watching").trim() as WatchPresenceState;

  if (!eventId || !validPresenceStates.has(presenceState)) {
    return NextResponse.json({ error: "Invalid presence payload." }, { status: 400 });
  }

  const event = await resolveWatchEventRecord({ eventId });

  if (!event) {
    return NextResponse.json({ error: "Watch event not found." }, { status: 404 });
  }

  const interactionError = getWatchEventInteractionError(event, {
    actorType: "human",
    kind: "presence",
  });

  if (interactionError) {
    return NextResponse.json({ error: interactionError.error }, { status: interactionError.statusCode });
  }

  let attendee;

  try {
    attendee = await upsertHumanWatchEventAttendee({
      event,
      profileId: profile.id,
      displayName: profile.displayName,
      presenceState,
    });
  } catch {
    return NextResponse.json({ error: "Presence could not be updated." }, { status: 500 });
  }

  await finalizeWatchEventActivity(eventId);
  return NextResponse.json({ ok: true, attendee });
}
