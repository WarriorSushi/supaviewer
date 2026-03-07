import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ViewRouteContext = {
  params: Promise<{ filmId: string }>;
};

export async function POST(_: Request, context: ViewRouteContext) {
  const { filmId } = await context.params;
  const cookieStore = await cookies();
  const existingViewerToken = cookieStore.get("sv_viewer_token")?.value;
  const viewerToken = existingViewerToken ?? crypto.randomUUID();
  const [{ profile }, supabase] = await Promise.all([
    getCurrentSessionProfile(),
    createSupabaseServerClient(),
  ]);

  const { data, error } = await supabase.rpc("record_film_view", {
    p_film_id: filmId,
    p_profile_id: profile?.id ?? null,
    p_viewer_token: viewerToken,
  });

  if (error) {
    return NextResponse.json({ error: "view-record-failed" }, { status: 500 });
  }

  const response = NextResponse.json({ recorded: Boolean(data) });

  if (!existingViewerToken) {
    response.cookies.set("sv_viewer_token", viewerToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
