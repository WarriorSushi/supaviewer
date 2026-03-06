"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCreatorProfile(formData: FormData) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/studio");
  }

  const name = String(formData.get("name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!name || !headline || !bio) {
    redirect("/studio?error=missing-fields");
  }

  const supabase = await createSupabaseServerClient();
  const slug = slugify(name);
  const { error } = await supabase.from("creators").insert({
    profile_id: profile.id,
    slug,
    name,
    headline,
    bio,
    location,
  });

  if (error) {
    redirect("/studio?error=create-failed");
  }

  revalidatePath("/studio");
  revalidatePath("/creators");
  redirect("/studio?created=1");
}

export async function requestCreatorClaim(creatorId: string) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("creator_claim_requests").insert({
    creator_id: creatorId,
    profile_id: profile.id,
  });

  if (error) {
    redirect("/library?claim=request-failed");
  }

  revalidatePath("/library");
  revalidatePath("/admin");
  redirect("/library?claim=sent");
}

export async function bootstrapAdmin() {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect("/login?next=/admin");
  }

  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count ?? 0) > 0) {
    redirect("/admin?error=bootstrap-closed");
  }

  await supabase.from("profiles").update({ role: "admin" }).eq("id", profile.id);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function approveCreatorClaim(claimId: string, creatorId: string, profileId: string) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/login?next=/admin");
  }

  const supabase = createSupabaseAdminClient();
  await supabase.from("creators").update({ profile_id: profileId }).eq("id", creatorId);
  await supabase
    .from("creator_claim_requests")
    .update({ status: "approved" })
    .eq("id", claimId);
  revalidatePath("/admin");
  revalidatePath("/creators");
}
