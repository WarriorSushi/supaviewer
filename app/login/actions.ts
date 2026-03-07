"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeNextPath(nextPath: string) {
  const trimmed = nextPath.trim();

  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }

  try {
    const normalized = new URL(trimmed, "http://supaviewer.local");

    if (normalized.origin !== "http://supaviewer.local") {
      return "/";
    }

    return `${normalized.pathname}${normalized.search}${normalized.hash}` || "/";
  } catch {
    return "/";
  }
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const nextPath = normalizeNextPath(String(formData.get("next") ?? "/"));

  if (!email) {
    redirect(`/login?error=missing-email&next=${encodeURIComponent(nextPath)}`);
  }

  const supabase = await createSupabaseServerClient();
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/confirm?next=${encodeURIComponent(nextPath)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    redirect(`/login?error=magic-link-failed&next=${encodeURIComponent(nextPath)}`);
  }

  redirect(`/login?sent=1&next=${encodeURIComponent(nextPath)}`);
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = normalizeNextPath(String(formData.get("next") ?? "/"));

  if (!email || !password) {
    redirect(`/login?error=password-missing-fields&next=${encodeURIComponent(nextPath)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=password-login-failed&next=${encodeURIComponent(nextPath)}`);
  }

  redirect(nextPath);
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = normalizeNextPath(String(formData.get("next") ?? "/"));

  if (!email || !password) {
    redirect(`/login?error=signup-missing-fields&next=${encodeURIComponent(nextPath)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=signup-failed&next=${encodeURIComponent(nextPath)}`);
  }

  redirect(`/login?signup=1&next=${encodeURIComponent(nextPath)}`);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
