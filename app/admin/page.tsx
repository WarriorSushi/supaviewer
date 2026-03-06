import { redirect } from "next/navigation";
import { approveCreatorClaim, bootstrapAdmin } from "@/app/studio/actions";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const { user, profile } = await getCurrentSessionProfile();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const supabase = createSupabaseAdminClient();
  const [{ count: adminCount }, submissionsResult, claimsResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    supabase
      .from("submissions")
      .select("id, proposed_title, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("creator_claim_requests")
      .select("id, profile_id, status, created_at, creators (id, name), profiles (display_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (submissionsResult.error) {
    throw new Error(`Failed to load admin queue: ${submissionsResult.error.message}`);
  }

  if (claimsResult.error) {
    throw new Error(`Failed to load claim queue: ${claimsResult.error.message}`);
  }

  const queuedSubmissions = submissionsResult.data ?? [];
  const claimRequests = claimsResult.data ?? [];

  if (profile?.role !== "admin") {
    if ((adminCount ?? 0) === 0) {
      return (
        <main className="mx-auto w-full max-w-[92rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
          <section className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(244,195,117,0.16),rgba(255,255,255,0.03)_34%,rgba(8,10,16,0.92)_74%)] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-white/44">Admin bootstrap</p>
            <h1 className="mt-3 font-display text-5xl text-white sm:text-6xl">Claim the first admin seat.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
              This project has no admin yet. The first signed-in operator can initialize the admin role once.
            </p>
            <form action={bootstrapAdmin} className="mt-8">
              <button className="rounded-full bg-[var(--color-highlight)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)]">
                Become the initial admin
              </button>
            </form>
          </section>
        </main>
      );
    }

    redirect("/");
  }

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <section className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_34%,rgba(8,10,16,0.92)_74%)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/44">Admin</p>
        <h1 className="mt-3 font-display text-5xl text-white sm:text-6xl">Curation controls</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
          Production quality depends on trust and editorial control. This surface is where featuring,
          review, and reporting stay manageable.
        </p>
      </section>
      <section className="grid gap-4 py-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/42">Review queue</p>
              <h2 className="mt-2 font-display text-4xl text-white">Submissions and reports</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/62">
              {queuedSubmissions?.length ?? 0} open items
            </div>
          </div>
          <div className="grid gap-3">
            {queuedSubmissions?.length ? (
              queuedSubmissions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4"
                >
                  <div>
                    <p className="font-display text-2xl text-white">{item.proposed_title}</p>
                    <p className="text-sm text-white/56">
                      queued {new Date(item.created_at).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-mono text-[var(--color-highlight)]">pending</p>
                    <p className="mt-1 text-white/48">{item.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-5 text-sm text-white/60">
                No queued submissions yet.
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">Creator claims</p>
            <div className="mt-4 grid gap-3">
              {claimRequests.length ? (
                claimRequests.map((claim) => {
                  const creator = ((claim.creators as { id?: string; name?: string }[] | null) ?? [])[0];
                  const claimant = ((claim.profiles as { display_name?: string }[] | null) ?? [])[0];

                  return (
                    <div
                      key={claim.id}
                      className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-display text-2xl text-white">{creator?.name ?? "Unknown creator"}</p>
                          <p className="text-sm text-white/56">
                            requested by {claimant?.display_name ?? "viewer"}
                          </p>
                        </div>
                        <p className="font-mono text-sm text-[var(--color-highlight)]">{claim.status}</p>
                      </div>
                      {claim.status === "pending" && creator?.id ? (
                        <form
                          action={approveCreatorClaim.bind(
                            null,
                            claim.id as string,
                            creator.id,
                            claim.profile_id as string,
                          )}
                          className="mt-4"
                        >
                          <button className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white transition hover:border-white/24 hover:bg-white/10">
                            Approve claim
                          </button>
                        </form>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-5 text-sm text-white/60">
                  No claim requests yet.
                </div>
              )}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">Featuring</p>
            <div className="mt-4 grid gap-3 text-sm text-white/72">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                manual featured weight override
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                promote trusted catalog entries only
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                keep low-trust titles out of hero surfaces
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">Trust stack</p>
            <div className="mt-4 grid gap-3 text-sm text-white/72">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                rights complaint inbox
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                AI disclosure verification
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-4">
                fast hide and remove actions
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
