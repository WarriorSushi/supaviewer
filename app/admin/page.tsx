import { redirect } from "next/navigation";
import {
  approveSubmission,
  deleteComment,
  rejectSubmission,
  updateFilmEditorial,
} from "@/app/admin/actions";
import {
  approveCreatorClaim,
  bootstrapAdmin,
  rejectCreatorClaim,
} from "@/app/studio/actions";
import { getCurrentSessionProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const visibilityOptions = ["public", "limited", "hidden", "removed"] as const;

export default async function AdminPage() {
  const { user, profile } = await getCurrentSessionProfile();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const supabase = createSupabaseAdminClient();
  const [
    { count: adminCount },
    submissionsResult,
    claimsResult,
    filmsResult,
    commentsResult,
    filmCountResult,
    removedCountResult,
    creatorCountResult,
    commentCountResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    supabase
      .from("submissions")
      .select("id, proposed_title, status, created_at, profile_id, profiles (display_name)")
      .eq("status", "submitted")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("creator_claim_requests")
      .select("id, profile_id, status, created_at, creators (id, name), profiles (display_name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("films")
      .select("id, serial_number, title, visibility, featured_weight, availability_note")
      .order("serial_number", { ascending: false })
      .limit(10),
    supabase
      .from("comments")
      .select("id, body, created_at, profiles (display_name), films (serial_number, title)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("films").select("*", { count: "exact", head: true }).in("visibility", ["public", "limited"]),
    supabase.from("films").select("*", { count: "exact", head: true }).eq("visibility", "removed"),
    supabase.from("creators").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
  ]);

  if (submissionsResult.error) {
    throw new Error(`Failed to load admin queue: ${submissionsResult.error.message}`);
  }

  if (claimsResult.error) {
    throw new Error(`Failed to load claim queue: ${claimsResult.error.message}`);
  }

  if (filmsResult.error) {
    throw new Error(`Failed to load film controls: ${filmsResult.error.message}`);
  }

  if (commentsResult.error) {
    throw new Error(`Failed to load comments moderation queue: ${commentsResult.error.message}`);
  }

  const queuedSubmissions = submissionsResult.data ?? [];
  const claimRequests = claimsResult.data ?? [];
  const managedFilms = filmsResult.data ?? [];
  const recentComments = commentsResult.data ?? [];

  if (profile?.role !== "admin") {
    if ((adminCount ?? 0) === 0) {
      return (
        <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
          <section className="rounded-[1rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_34%,rgba(10,10,12,0.96)_74%)] p-6 sm:p-8">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/44">Admin bootstrap</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              Claim the first admin seat.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
              This project has no admin yet. The first signed-in operator can initialize the admin
              role once.
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
    <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[1rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_34%,rgba(10,10,12,0.96)_74%)] p-6 sm:p-8">
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/44">Admin</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              Operations and catalog control
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
              Moderate submissions, remove harmful comments, manage creator claims, and control film
              visibility without breaking permanent serial history.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/68">
            Signed in as {profile.displayName}
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-white/8 bg-[rgba(12,20,31,0.72)] px-5 py-5">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">Pending submissions</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{queuedSubmissions.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/8 bg-[rgba(12,20,31,0.72)] px-5 py-5">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">Public catalog</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{filmCountResult.count ?? 0}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/8 bg-[rgba(12,20,31,0.72)] px-5 py-5">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">Removed titles</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{removedCountResult.count ?? 0}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/8 bg-[rgba(12,20,31,0.72)] px-5 py-5">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">Creators / comments</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            {creatorCountResult.count ?? 0} / {commentCountResult.count ?? 0}
          </p>
        </div>
      </section>

      <section className="grid gap-6 py-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="grid gap-6">
          <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Review queue</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                  Submission approvals
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/62">
                {queuedSubmissions.length} open
              </div>
            </div>
            <div className="grid gap-3">
              {queuedSubmissions.length ? (
                queuedSubmissions.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-lg font-medium tracking-[-0.02em] text-white">{item.proposed_title}</p>
                      <p className="mt-1 text-sm text-white/56">
                        queued {new Date(item.created_at).toLocaleDateString("en-US")} by{" "}
                        {((item.profiles as { display_name?: string }[] | null) ?? [])[0]?.display_name ?? "viewer"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={approveSubmission.bind(null, item.id as string)}>
                        <button className="rounded-full bg-[var(--color-highlight)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] transition hover:brightness-105">
                          Approve
                        </button>
                      </form>
                      <form action={rejectSubmission.bind(null, item.id as string)}>
                        <button className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/24 hover:bg-white/10">
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-5 text-sm text-white/60">
                  No queued submissions right now.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
            <div className="mb-5">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Catalog controls</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                Visibility and featuring
              </h2>
            </div>
            <div className="grid gap-4">
              {managedFilms.map((film) => (
                <form
                  key={film.id}
                  action={updateFilmEditorial.bind(null, film.id as string)}
                  className="grid gap-4 rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-highlight)]">
                        #{film.serial_number}
                      </p>
                      <p className="mt-1 text-lg font-medium tracking-[-0.02em] text-white">{film.title}</p>
                    </div>
                    <p className="text-sm text-white/48">Current visibility: {film.visibility}</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,0.68fr)_auto]">
                    <label className="block">
                      <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.22em] text-white/40">
                        Availability note
                      </span>
                      <input
                        className="w-full rounded-[1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                        defaultValue={(film.availability_note as string | null) ?? ""}
                        name="availabilityNote"
                        placeholder="Optional note shown on removed titles"
                        type="text"
                      />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.22em] text-white/40">
                          Visibility
                        </span>
                        <select
                          className="w-full rounded-[1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-highlight)]/40"
                          defaultValue={film.visibility as string}
                          name="visibility"
                        >
                          {visibilityOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.22em] text-white/40">
                          Featured weight
                        </span>
                        <input
                          className="w-full rounded-[1rem] border border-white/10 bg-[rgba(7,17,27,0.7)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-highlight)]/40"
                          defaultValue={String(film.featured_weight ?? 0)}
                          name="featuredWeight"
                          type="number"
                        />
                      </label>
                    </div>
                    <div className="flex items-end">
                      <button className="h-[46px] w-full rounded-full border border-white/12 bg-white/5 px-5 text-sm font-medium text-white transition hover:border-white/24 hover:bg-white/10">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Creator claims</p>
            <div className="mt-4 grid gap-3">
              {claimRequests.length ? (
                claimRequests.map((claim) => {
                  const creator = ((claim.creators as { id?: string; name?: string }[] | null) ?? [])[0];
                  const claimant = ((claim.profiles as { display_name?: string }[] | null) ?? [])[0];

                  return (
                    <div
                      key={claim.id}
                      className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-lg font-medium tracking-[-0.02em] text-white">
                            {creator?.name ?? "Unknown creator"}
                          </p>
                          <p className="text-sm text-white/56">
                            requested by {claimant?.display_name ?? "viewer"}
                          </p>
                        </div>
                        <p className="font-mono text-sm text-[var(--color-highlight)]">{claim.status}</p>
                      </div>
                      {claim.status === "pending" && creator?.id ? (
                        <div className="mt-4 flex gap-2">
                          <form
                            action={approveCreatorClaim.bind(
                              null,
                              claim.id as string,
                              creator.id,
                              claim.profile_id as string,
                            )}
                          >
                            <button className="rounded-full bg-[var(--color-highlight)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] transition hover:brightness-105">
                              Approve
                            </button>
                          </form>
                          <form action={rejectCreatorClaim.bind(null, claim.id as string)}>
                            <button className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/24 hover:bg-white/10">
                              Reject
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-5 text-sm text-white/60">
                  No claim requests yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Comment moderation</p>
            <div className="mt-4 grid gap-3">
              {recentComments.length ? (
                recentComments.map((comment) => {
                  const film = ((comment.films as { serial_number?: number; title?: string }[] | null) ?? [])[0];
                  const author = ((comment.profiles as { display_name?: string }[] | null) ?? [])[0];

                  return (
                    <div
                      key={comment.id}
                      className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-[var(--color-highlight)]">
                            #{film?.serial_number ?? "?"} {film?.title ?? "Unknown film"}
                          </p>
                          <p className="mt-1 text-sm text-white/52">
                            {author?.display_name ?? "viewer"} • {new Date(comment.created_at as string).toLocaleDateString("en-US")}
                          </p>
                        </div>
                        {typeof film?.serial_number === "number" ? (
                          <form action={deleteComment.bind(null, comment.id as string, film.serial_number)}>
                            <button className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/24 hover:bg-white/10">
                              Delete
                            </button>
                          </form>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/70">{comment.body as string}</p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-5 text-sm text-white/60">
                  No recent comments to moderate.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,20,31,0.72)] p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/42">Moderation rules</p>
            <div className="mt-4 grid gap-3 text-sm text-white/70">
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                Removing a film never frees its serial for reuse.
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                Hidden titles leave browse surfaces without creating public tombstones.
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                Removed titles keep direct serial history and show an unavailable state.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
