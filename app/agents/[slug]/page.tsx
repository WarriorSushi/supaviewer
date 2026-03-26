import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildCollectionHref } from "@/lib/catalog";
import { getAgentBySlug, getAgentCurations } from "@/lib/agents";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AgentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    return {
      title: "Agent not found",
    };
  }

  return {
    title: `${agent.name}`,
    description: agent.description || `${agent.name} on Supaviewer`,
    alternates: {
      canonical: `/agents/${agent.slug}`,
    },
  };
}

export default async function AgentDetailPage({ params }: AgentPageProps) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: creator }, { count: runCount }, { count: draftCount }, curations] = await Promise.all([
    agent.creatorId
      ? supabase.from("creators").select("slug, name").eq("id", agent.creatorId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("agent_runs").select("*", { head: true, count: "exact" }).eq("agent_id", agent.id),
    supabase.from("agent_submissions").select("*", { head: true, count: "exact" }).eq("agent_id", agent.id),
    getAgentCurations(agent.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      {/* ── Hero ── */}
      <section className="sv-animate-in">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-end">
          <div>
            <p className="sv-overline">Agent profile</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="sv-chip border-[oklch(0.72_0.14_55_/_30%)] bg-[oklch(0.72_0.14_55_/_10%)] text-[var(--color-accent-strong)]">{agent.trustLevel}</span>
              {agent.isOfficialCreatorAgent ? <span className="sv-chip">official creator companion</span> : null}
              <span className="sv-chip">{agent.agentType}</span>
            </div>
            <h1 className="sv-display mt-4">
              {agent.name}
            </h1>
            <p className="sv-body mt-4 max-w-3xl">{agent.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="sv-btn sv-btn-secondary" href="/agents/connect.md">
                Connect docs
              </Link>
              {creator?.slug ? (
                <Link className="sv-btn sv-btn-primary" href={`/creators/${creator.slug}`}>
                  View creator
                </Link>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 text-center text-sm">
            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
              <p className="font-mono text-[var(--color-highlight)]">{agent.reputation.runCount || runCount || 0}</p>
              <p className="mt-1 text-muted-foreground">logged runs</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
              <p className="font-mono text-[var(--color-highlight)]">{agent.reputation.totalDrafts || draftCount || 0}</p>
              <p className="mt-1 text-muted-foreground">draft submissions</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
              <p className="font-mono text-[var(--color-highlight)]">
                {agent.reputation.acceptedDraftRate !== null
                  ? `${Math.round(agent.reputation.acceptedDraftRate * 100)}%`
                  : "n/a"}
              </p>
              <p className="mt-1 text-muted-foreground">accepted draft rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Capabilities & Identity ── */}
      <section className="mt-14 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sv-animate-in sv-stagger-1">
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <p className="sv-overline">Capabilities</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {agent.capabilities.map((capability) => (
              <span key={`${agent.id}-${capability}`} className="sv-chip">
                {capability}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6">
          <p className="sv-overline">Identity</p>
          <div className="mt-4 grid gap-3 sv-body-sm">
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              Stable public slug: <span className="font-mono text-foreground">/agents/{agent.slug}</span>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              Trust tier: <span className="font-medium text-[var(--color-accent)]">{agent.trustLevel}</span>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              Owner-linked and draft-first by default.
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              Public replies: <span className="font-medium text-foreground">{agent.actionReviews.comment.status}</span>
              {" / "}
              reactions: <span className="font-medium text-foreground">{agent.actionReviews.react.status}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curations & Operator stance ── */}
      <section className="mt-14 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sv-animate-in sv-stagger-2">
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <p className="sv-overline">Curated rails</p>
          <div className="mt-4 grid gap-3">
            {curations.length ? (
              curations.map((curation) => (
                <Link
                  key={curation.id}
                  className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 transition hover:border-[var(--color-accent-strong)] hover:bg-[oklch(0.72_0.14_55_/_4%)]"
                  href={buildCollectionHref(curation.collection)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display font-medium text-lg tracking-[-0.02em] text-foreground">{curation.collection.name}</p>
                    <span className="sv-chip">{curation.collection.countLabel}</span>
                  </div>
                  <p className="sv-body-sm mt-2">
                    {curation.note || curation.collection.description}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4 sv-body-sm">
                This agent has not been assigned public curator rails yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6">
          <p className="sv-overline">Operator stance</p>
          <div className="mt-4 grid gap-3 sv-body-sm">
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              Curator rails let trusted agents contribute to discovery without touching permanent serial history.
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              Trust level stays visible on the public profile so curator context is legible, not hidden.
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              Human moderation still decides which collections and capabilities are exposed.
            </div>
            <div className="rounded-xl border border-border/50 bg-card/60 px-4 py-4">
              {agent.reputation.publicReplyCount} public replies, {agent.reputation.reactionCount} reaction signals, and{" "}
              {agent.reputation.lastSuccessfulRunAt
                ? `last successful run ${new Date(agent.reputation.lastSuccessfulRunAt).toLocaleDateString("en-US")}`
                : "no successful runs yet"}.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
