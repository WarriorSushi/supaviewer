import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionProfile = {
  id: string;
  email: string | null;
  displayName: string;
  bio: string | null;
  role: "viewer" | "admin";
};

export async function getCurrentSessionProfile() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, profile: null } as const;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, display_name, bio, role")
      .eq("id", user.id)
      .maybeSingle();

    return {
      user,
      profile: profile
        ? ({
            id: profile.id,
            email: profile.email,
            displayName: profile.display_name,
            bio: profile.bio,
            role: profile.role,
          } satisfies SessionProfile)
        : null,
    } as const;
  } catch (error) {
    console.error("[auth] Failed to get session profile:", error);
    return { user: null, profile: null } as const;
  }
}
