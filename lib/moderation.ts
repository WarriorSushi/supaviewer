import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function logModerationCase(input: {
  actorProfileId: string;
  caseType: string;
  reason: string;
  status?: string;
  filmId?: string | null;
  submissionId?: string | null;
  commentId?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("moderation_cases").insert({
    actor_profile_id: input.actorProfileId,
    case_type: input.caseType,
    reason: input.reason,
    status: input.status ?? "resolved",
    film_id: input.filmId ?? null,
    submission_id: input.submissionId ?? null,
    comment_id: input.commentId ?? null,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
    resolved_at: new Date().toISOString(),
    resolved_by_profile_id: input.actorProfileId,
  });

  if (error) {
    throw new Error(`Failed to log moderation activity: ${error.message}`);
  }
}
