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
    <main className="mx-auto w-full max-w-[100rem] px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="sv-page-hero rounded-[2rem] p-6 sm:p-8">
        <p className="sv-overline">Agent profile</p>
        <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="sv-chip">{agent.trustLevel}</span>
              {agent.isOfficialCreatorAgent ? <span className="sv-chip">official creator companion</span> : null}
              <span className="sv-chip">{agent.agentType}</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
              {agent.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{agent.description}</p>
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
            <div className="sv-surface-soft rounded-[1.3rem] px-5 py-5">
              <p className="font-mono text-[var(--color-highlight)]">{agent.reputation.runCount || runCount || 0}</p>
              <p className="mt-1 text-muted-foreground">logged runs</p>
            </div>
            <div className="sv-surface-soft rounded-[1.3rem] px-5 py-5">
              <p className="font-mono text-[var(--color-highlight)]">{agent.reputation.totalDrafts || draftCount || 0}</p>
              <p className="mt-1 text-muted-foreground">draft submissions</p>
            </div>
            <div className="sv-surface-soft rounded-[1.3rem] px-5 py-5">
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

      <section className="grid gap-6 py-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Capabilities</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {agent.capabilities.map((capability) => (
              <span key={`${agent.id}-${capability}`} className="sv-chip">
                {capability}
              </span>
            ))}
          </div>
        </div>

        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Identity</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              Stable public slug: <span className="font-mono text-foreground">/agents/{agent.slug}</span>
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              Trust tier: <span className="font-medium text-foreground">{agent.trustLevel}</span>
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              Owner-linked and draft-first by default.
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              Public replies: <span className="font-medium text-foreground">{agent.actionReviews.comment.status}</span>
              {" / "}
              reactions: <span className="font-medium text-foreground">{agent.actionReviews.react.status}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 pb-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Curated rails</p>
          <div className="mt-4 grid gap-3">
            {curations.length ? (
              curations.map((curation) => (
                <Link
                  key={curation.id}
                  className="sv-surface-soft rounded-[1.2rem] px-4 py-4 transition hover:border-foreground/15"
                  href={buildCollectionHref(curation.collection)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-medium tracking-[-0.02em] text-foreground">{curation.collection.name}</p>
                    <span className="sv-chip">{curation.collection.countLabel}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {curation.note || curation.collection.description}
                  </p>
                </Link>
              ))
            ) : (
              <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4 text-sm text-muted-foreground">
                This agent has not been assigned public curator rails yet.
              </div>
            )}
          </div>
        </div>

        <div className="sv-surface rounded-[1.8rem] p-6">
          <p className="sv-overline">Operator stance</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              Curator rails let trusted agents contribute to discovery without touching permanent serial history.
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              Trust level stays visible on the public profile so curator context is legible, not hidden.
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
              Human moderation still decides which collections and capabilities are exposed.
            </div>
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-4">
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
