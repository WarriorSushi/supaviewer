"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireProfile(nextPath: string) {
  const { profile } = await getCurrentSessionProfile();

  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return profile;
}

export async function toggleFilmLike(filmId: string, nextPath: string) {
  const profile = await requireProfile(nextPath);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("likes")
    .select("film_id")
    .eq("film_id", filmId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (data) {
    await supabase.from("likes").delete().eq("film_id", filmId).eq("profile_id", profile.id);
  } else {
    await supabase.from("likes").insert({ film_id: filmId, profile_id: profile.id });
  }

  revalidatePath(nextPath);
  revalidatePath("/library");
}

export async function toggleFilmSave(filmId: string, nextPath: string) {
  const profile = await requireProfile(nextPath);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("saves")
    .select("film_id")
    .eq("film_id", filmId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (data) {
    await supabase.from("saves").delete().eq("film_id", filmId).eq("profile_id", profile.id);
  } else {
    await supabase.from("saves").insert({ film_id: filmId, profile_id: profile.id });
  }

  revalidatePath(nextPath);
  revalidatePath("/");
  revalidatePath("/films");
  revalidatePath("/library");
}

export async function addFilmComment(filmId: string, nextPath: string, formData: FormData) {
  const profile = await requireProfile(nextPath);
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    redirect(`${nextPath}?commentError=empty`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("comments").insert({
    film_id: filmId,
    profile_id: profile.id,
    body,
  });

  if (error) {
    redirect(`${nextPath}?commentError=failed`);
  }

  revalidatePath(nextPath);
  revalidatePath("/");
  revalidatePath("/films");
  redirect(`${nextPath}#comments`);
}

export async function toggleCreatorFollow(creatorId: string, nextPath: string) {
  const profile = await requireProfile(nextPath);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("follows")
    .select("creator_id")
    .eq("creator_id", creatorId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (data) {
    await supabase.from("follows").delete().eq("creator_id", creatorId).eq("profile_id", profile.id);
  } else {
    await supabase.from("follows").insert({ creator_id: creatorId, profile_id: profile.id });
  }

  revalidatePath(nextPath);
}
