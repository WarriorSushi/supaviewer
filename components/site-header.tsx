import { getCurrentSessionProfile } from "@/lib/auth";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  const { profile } = await getCurrentSessionProfile();

  return (
    <SiteHeaderClient
      profile={
        profile
          ? {
              displayName: profile.displayName,
              role: profile.role,
            }
          : null
      }
    />
  );
}
