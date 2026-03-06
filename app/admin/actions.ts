"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const { profile } = await getCurrentSessionProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/login?next=/admin");
  }

  return profile;
}

export async function approveSubmission(submissionId: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("approve_submission", {
    p_submission_id: submissionId,
  });

  if (error) {
    throw new Error(`Failed to approve submission: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/films");
  revalidatePath("/admin");
  revalidatePath("/library");
}

export async function rejectSubmission(submissionId: string) {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("reject_submission", {
    p_submission_id: submissionId,
  });

  if (error) {
    throw new Error(`Failed to reject submission: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/library");
}

export async function updateFilmEditorial(filmId: string, formData: FormData) {
  await requireAdmin();

  const visibility = String(formData.get("visibility") ?? "public");
  const featuredWeight = Number.parseInt(String(formData.get("featuredWeight") ?? "0"), 10);
  const availabilityNote = String(formData.get("availabilityNote") ?? "").trim();

  const supabase = createSupabaseAdminClient();
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

  revalidatePath("/");
  revalidatePath("/films");
  revalidatePath("/admin");
}

export async function deleteComment(commentId: string, filmSerial: number) {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/films/${filmSerial}`);
}
