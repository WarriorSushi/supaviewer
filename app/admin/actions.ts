"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "@/lib/auth";
import { logModerationCase } from "@/lib/moderation";
import { submissionRejectionReasons } from "@/lib/submissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const { profile } = await getCurrentSessionProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/login?next=/admin");
  }

  return profile;
}

function getSelectedValues(formData: FormData, key: string) {
  return [...new Set(formData.getAll(key).map((value) => String(value).trim()).filter(Boolean))];
}

function getStructuredRejectionReason(formData: FormData) {
  const reason = String(formData.get("reason") ?? "").trim();

  return submissionRejectionReasons.some((entry) => entry.value === reason) ? reason : null;
}

function getAgentReviewStatus(
  formData: FormData,
  key: string,
): "none" | "pending" | "approved" | "rejected" {
  const value = String(formData.get(key) ?? "none").trim();

  return ["none", "pending", "approved", "rejected"].includes(value)
    ? (value as "none" | "pending" | "approved" | "rejected")
    : "none";
}

async function getManualTrophyDefinitionIds(targetType: "film" | "creator") {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trophy_definitions")
    .select("id")
    .eq("target_type", targetType)
    .eq("assignment_type", "manual");

  if (error) {
    throw new Error(`Failed to load ${targetType} trophy definitions: ${error.message}`);
  }

  return (data ?? []).map((definition) => definition.id as string);
}

async function getCollectionIds() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("collections").select("id");

  if (error) {
    throw new Error(`Failed to load collection ids: ${error.message}`);
  }

  return (data ?? []).map((collection) => collection.id as string);
}

export async function approveSubmission(submissionId: string) {
  const profile = await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("approve_submission", {
    p_submission_id: submissionId,
  });

  if (error) {
    throw new Error(`Failed to approve submission: ${error.message}`);
  }

  const film = (data ?? [])[0] as { film_id?: string; serial_number?: number; slug?: string } | undefined;

  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "submission-approved",
    filmId: film?.film_id ?? null,
    submissionId,
    reason: "Submission approved and published to the catalog.",
    metadata: {
      filmSerial: film?.serial_number ?? null,
      filmSlug: film?.slug ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath("/films");
  revalidatePath("/admin");
  revalidatePath("/library");
  if (film?.serial_number && film?.slug) {
    revalidatePath(`/films/${film.serial_number}-${film.slug}`);
  }
}

export async function rejectSubmission(submissionId: string, formData: FormData) {
  const profile = await requireAdmin();
  const notes = String(formData.get("notes") ?? "").trim();
  const reason = getStructuredRejectionReason(formData);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("reject_submission", {
    p_submission_id: submissionId,
  });

  if (error) {
    throw new Error(`Failed to reject submission: ${error.message}`);
  }

  const adminSupabase = createSupabaseAdminClient();
  const { error: feedbackError } = await adminSupabase
    .from("submissions")
    .update({
      rejection_reason: reason,
      rejection_details: notes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (feedbackError) {
    throw new Error(`Failed to store rejection feedback: ${feedbackError.message}`);
  }

  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "submission-rejected",
    submissionId,
    reason: "Submission rejected during moderation.",
    notes: notes || null,
    metadata: {
      rejectionReason: reason,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/library");
}

export async function updateFilmEditorial(filmId: string, formData: FormData) {
  const profile = await requireAdmin();

  const visibility = String(formData.get("visibility") ?? "public");
  const featuredWeight = Number.parseInt(String(formData.get("featuredWeight") ?? "0"), 10);
  const availabilityNote = String(formData.get("availabilityNote") ?? "").trim();

  const supabase = createSupabaseAdminClient();
  const { data: currentFilm, error: readError } = await supabase
    .from("films")
    .select("serial_number, slug, visibility, featured_weight, availability_note")
    .eq("id", filmId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Failed to read film before update: ${readError.message}`);
  }

  const { error } = await supabase
    .from("films")
    .update({
      visibility,
      featured_weight: Number.isNaN(featuredWeight) ? 0 : featuredWeight,
      availability_note: availabilityNote || null,
    })
    .eq("id", filmId);

  if (error) {
    throw new Error(`Failed to update film editorial settings: ${error.message}`);
  }

  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "film-editorial-updated",
    filmId,
    reason: "Film editorial settings updated.",
    notes: availabilityNote || null,
    metadata: {
      before: currentFilm,
      after: {
        visibility,
        featuredWeight: Number.isNaN(featuredWeight) ? 0 : featuredWeight,
        availabilityNote: availabilityNote || null,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/films");
  revalidatePath("/admin");
  if (currentFilm?.serial_number && currentFilm?.slug) {
    revalidatePath(`/films/${currentFilm.serial_number}-${currentFilm.slug}`);
  }
}

export async function deleteComment(commentId: string, filmPath: string, formData: FormData) {
  const profile = await requireAdmin();
  const notes = String(formData.get("notes") ?? "").trim();

  const supabase = createSupabaseAdminClient();
  const { data: commentRecord, error: commentReadError } = await supabase
    .from("comments")
    .select("film_id, body")
    .eq("id", commentId)
    .maybeSingle();

  if (commentReadError) {
    throw new Error(`Failed to read comment before deletion: ${commentReadError.message}`);
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`);
  }

  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "comment-deleted",
    filmId: commentRecord?.film_id ?? null,
    commentId,
    reason: "Comment removed by an admin moderator.",
    notes: notes || commentRecord?.body?.slice(0, 240) || null,
  });

  revalidatePath("/admin");
  revalidatePath(filmPath);
}

export async function bulkApproveSubmissions(formData: FormData) {
  const profile = await requireAdmin();
  const submissionIds = getSelectedValues(formData, "submissionIds");

  if (!submissionIds.length) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const publishedPaths = new Set<string>();

  for (const submissionId of submissionIds) {
    const { data, error } = await supabase.rpc("approve_submission", {
      p_submission_id: submissionId,
    });

    if (error) {
      throw new Error(`Failed to bulk approve submission ${submissionId}: ${error.message}`);
    }

    const film = (data ?? [])[0] as { film_id?: string; serial_number?: number; slug?: string } | undefined;

    await logModerationCase({
      actorProfileId: profile.id,
      caseType: "submission-approved",
      filmId: film?.film_id ?? null,
      submissionId,
      reason: "Submission approved and published to the catalog through bulk moderation.",
      metadata: {
        bulk: true,
        filmSerial: film?.serial_number ?? null,
        filmSlug: film?.slug ?? null,
      },
    });

    if (film?.serial_number && film?.slug) {
      publishedPaths.add(`/films/${film.serial_number}-${film.slug}`);
    }
  }

  revalidatePath("/");
  revalidatePath("/films");
  revalidatePath("/admin");
  revalidatePath("/library");
  for (const path of publishedPaths) {
    revalidatePath(path);
  }
}

export async function bulkRejectSubmissions(formData: FormData) {
  const profile = await requireAdmin();
  const submissionIds = getSelectedValues(formData, "submissionIds");
  const notes = String(formData.get("bulkNotes") ?? "").trim();
  const reason = getStructuredRejectionReason(formData);

  if (!submissionIds.length) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();

  for (const submissionId of submissionIds) {
    const { error } = await supabase.rpc("reject_submission", {
      p_submission_id: submissionId,
    });

    if (error) {
      throw new Error(`Failed to bulk reject submission ${submissionId}: ${error.message}`);
    }

    const { error: feedbackError } = await adminSupabase
      .from("submissions")
      .update({
        rejection_reason: reason,
        rejection_details: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (feedbackError) {
      throw new Error(`Failed to store rejection feedback for ${submissionId}: ${feedbackError.message}`);
    }

    await logModerationCase({
      actorProfileId: profile.id,
      caseType: "submission-rejected",
      submissionId,
      reason: "Submission rejected through bulk moderation.",
      notes: notes || null,
      metadata: {
        bulk: true,
        rejectionReason: reason,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/library");
}

export async function bulkDeleteComments(formData: FormData) {
  const profile = await requireAdmin();
  const commentTargets = getSelectedValues(formData, "commentTargets");
  const notes = String(formData.get("bulkNotes") ?? "").trim();

  if (!commentTargets.length) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const filmPaths = new Set<string>();

  for (const target of commentTargets) {
    const [commentId, filmPath] = target.split("::");

    if (!commentId || !filmPath) {
      continue;
    }

    const { data: commentRecord, error: commentReadError } = await supabase
      .from("comments")
      .select("film_id, body")
      .eq("id", commentId)
      .maybeSingle();

    if (commentReadError) {
      throw new Error(`Failed to read comment ${commentId}: ${commentReadError.message}`);
    }

    const { error } = await supabase.from("comments").delete().eq("id", commentId);

    if (error) {
      throw new Error(`Failed to bulk delete comment ${commentId}: ${error.message}`);
    }

    await logModerationCase({
      actorProfileId: profile.id,
      caseType: "comment-deleted",
      filmId: commentRecord?.film_id ?? null,
      commentId,
      reason: "Comment removed through bulk moderation.",
      notes: notes || commentRecord?.body?.slice(0, 240) || null,
      metadata: {
        bulk: true,
      },
    });

    filmPaths.add(filmPath);
  }

  revalidatePath("/admin");
  for (const filmPath of filmPaths) {
    revalidatePath(filmPath);
  }
}

export async function updateFilmTrophies(filmId: string, formData: FormData) {
  const profile = await requireAdmin();
  const trophyIds = getSelectedValues(formData, "trophyIds");
  const manualTrophyDefinitionIds = await getManualTrophyDefinitionIds("film");
  const validTrophyIds = trophyIds.filter((trophyId) => manualTrophyDefinitionIds.includes(trophyId));
  const supabase = createSupabaseAdminClient();
  const { data: filmRecord, error: filmReadError } = await supabase
    .from("films")
    .select("serial_number, slug, title")
    .eq("id", filmId)
    .maybeSingle();

  if (filmReadError) {
    throw new Error(`Failed to read film before trophy update: ${filmReadError.message}`);
  }

  const { error: deleteError } = await supabase
    .from("trophy_assignments")
    .delete()
    .eq("film_id", filmId)
    .in("trophy_definition_id", manualTrophyDefinitionIds);

  if (deleteError) {
    throw new Error(`Failed to clear film trophies: ${deleteError.message}`);
  }

  if (validTrophyIds.length) {
    const { error: insertError } = await supabase.from("trophy_assignments").insert(
      validTrophyIds.map((trophyId) => ({
        trophy_definition_id: trophyId,
        film_id: filmId,
        awarded_by_profile_id: profile.id,
      })),
    );

    if (insertError) {
      throw new Error(`Failed to update film trophies: ${insertError.message}`);
    }
  }

  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "film-trophies-updated",
    filmId,
    reason: "Film trophies updated.",
    metadata: {
      trophyDefinitionIds: validTrophyIds,
      filmTitle: filmRecord?.title ?? null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/films");
  if (filmRecord?.serial_number && filmRecord?.slug) {
    revalidatePath(`/films/${filmRecord.serial_number}-${filmRecord.slug}`);
  }
}

export async function updateCreatorTrophies(creatorId: string, creatorSlug: string, formData: FormData) {
  const profile = await requireAdmin();
  const trophyIds = getSelectedValues(formData, "trophyIds");
  const manualTrophyDefinitionIds = await getManualTrophyDefinitionIds("creator");
  const validTrophyIds = trophyIds.filter((trophyId) => manualTrophyDefinitionIds.includes(trophyId));
  const supabase = createSupabaseAdminClient();
  const { data: creatorRecord, error: creatorReadError } = await supabase
    .from("creators")
    .select("name")
    .eq("id", creatorId)
    .maybeSingle();

  if (creatorReadError) {
    throw new Error(`Failed to read creator before trophy update: ${creatorReadError.message}`);
  }

  const { error: deleteError } = await supabase
    .from("trophy_assignments")
    .delete()
    .eq("creator_id", creatorId)
    .in("trophy_definition_id", manualTrophyDefinitionIds);

  if (deleteError) {
    throw new Error(`Failed to clear creator trophies: ${deleteError.message}`);
  }

  if (validTrophyIds.length) {
    const { error: insertError } = await supabase.from("trophy_assignments").insert(
      validTrophyIds.map((trophyId) => ({
        trophy_definition_id: trophyId,
        creator_id: creatorId,
        awarded_by_profile_id: profile.id,
      })),
    );

    if (insertError) {
      throw new Error(`Failed to update creator trophies: ${insertError.message}`);
    }
  }

  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "creator-trophies-updated",
    reason: "Creator trophies updated.",
    metadata: {
      creatorId,
      creatorName: creatorRecord?.name ?? null,
      trophyDefinitionIds: validTrophyIds,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/creators");
  revalidatePath(`/creators/${creatorSlug}`);
  revalidatePath("/studio");
}

export async function updateAgentModeration(agentId: string, agentSlug: string, formData: FormData) {
  const profile = await requireAdmin();
  const trustLevel = String(formData.get("trustLevel") ?? "sandbox").trim();
  const status = String(formData.get("status") ?? "active").trim();
  const isOfficialCreatorAgent = formData.get("isOfficialCreatorAgent") === "on";
  const note = String(formData.get("note") ?? "").trim();
  const commentReviewStatus = getAgentReviewStatus(formData, "commentReviewStatus");
  const reactionReviewStatus = getAgentReviewStatus(formData, "reactionReviewStatus");
  const collectionIds = getSelectedValues(formData, "collectionIds");

  if (!["sandbox", "trusted", "official", "editorial"].includes(trustLevel)) {
    throw new Error("Invalid agent trust level.");
  }

  if (!["active", "disabled"].includes(status)) {
    throw new Error("Invalid agent status.");
  }

  const supabase = createSupabaseAdminClient();
  const validCollectionIds = await getCollectionIds();
  const curatedCollectionIds = collectionIds.filter((collectionId) => validCollectionIds.includes(collectionId));
  const { data: agentRecord, error: agentReadError } = await supabase
    .from("agents")
    .select("id, creator_id, name")
    .eq("id", agentId)
    .maybeSingle();

  if (agentReadError || !agentRecord) {
    throw new Error(`Failed to read agent before moderation update: ${agentReadError?.message ?? "missing agent"}`);
  }

  const nextOfficialFlag = agentRecord.creator_id ? isOfficialCreatorAgent : false;
  const nextTrustLevel =
    nextOfficialFlag && trustLevel === "sandbox"
      ? "official"
      : trustLevel;

  const [{ error: agentUpdateError }, { error: clearCurationsError }] = await Promise.all([
    supabase
      .from("agents")
      .update({
        trust_level: nextTrustLevel,
        status,
        is_official_creator_agent: nextOfficialFlag,
      })
      .eq("id", agentId),
    supabase.from("agent_collection_curations").delete().eq("agent_id", agentId),
  ]);

  if (agentUpdateError) {
    throw new Error(`Failed to update agent moderation settings: ${agentUpdateError.message}`);
  }

  if (clearCurationsError) {
    throw new Error(`Failed to clear agent curations: ${clearCurationsError.message}`);
  }

  if (curatedCollectionIds.length) {
    const { error: curationInsertError } = await supabase.from("agent_collection_curations").insert(
      curatedCollectionIds.map((collectionId) => ({
        agent_id: agentId,
        collection_id: collectionId,
      })),
    );

    if (curationInsertError) {
      throw new Error(`Failed to update agent curations: ${curationInsertError.message}`);
    }
  }

  for (const [actionType, reviewStatus] of [
    ["comment", commentReviewStatus],
    ["react", reactionReviewStatus],
  ] as const) {
    if (reviewStatus === "none") {
      const { error: deleteReviewError } = await supabase
        .from("agent_action_reviews")
        .delete()
        .eq("agent_id", agentId)
        .eq("action_type", actionType);

      if (deleteReviewError) {
        throw new Error(`Failed to clear ${actionType} review state: ${deleteReviewError.message}`);
      }

      continue;
    }

    const reviewPayload =
      reviewStatus === "pending"
        ? {
            agent_id: agentId,
            action_type: actionType,
            status: reviewStatus,
            note: note || null,
            reviewed_at: null,
            reviewed_by_profile_id: null,
          }
        : {
            agent_id: agentId,
            action_type: actionType,
            status: reviewStatus,
            note: note || null,
            reviewed_at: new Date().toISOString(),
            reviewed_by_profile_id: profile.id,
          };

    const { error: reviewUpsertError } = await supabase
      .from("agent_action_reviews")
      .upsert(reviewPayload, { onConflict: "agent_id,action_type" });

    if (reviewUpsertError) {
      throw new Error(`Failed to update ${actionType} review state: ${reviewUpsertError.message}`);
    }
  }

  await logModerationCase({
    actorProfileId: profile.id,
    caseType: "agent-moderation-updated",
    reason: "Agent trust, status, or curator rails updated.",
    notes: note || null,
    metadata: {
      agentId,
      agentName: agentRecord.name ?? null,
      trustLevel: nextTrustLevel,
      status,
      isOfficialCreatorAgent: nextOfficialFlag,
      curatedCollectionIds,
      commentReviewStatus,
      reactionReviewStatus,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentSlug}`);
  revalidatePath("/studio");
}
