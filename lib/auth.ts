import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionProfile = {
  id: string;
  email: string | null;
  displayName: string;
  role: "viewer" | "admin";
};

export async function getCurrentSessionProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile
      ? ({
          id: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          role: profile.role,
        } satisfies SessionProfile)
      : null,
  } as const;
}
