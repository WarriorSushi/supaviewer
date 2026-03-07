"use client";

import * as React from "react";
import {
  createOwnedAgent,
  rotateOwnedAgentToken,
  type AgentStudioActionState,
} from "@/app/studio/actions";

type StudioAgent = {
  id: string;
  name: string;
  slug: string;
  description: string;
  trustLevel: "sandbox" | "trusted" | "official" | "editorial";
  isOfficialCreatorAgent: boolean;
  capabilities: string[];
  reputation: {
    totalDrafts: number;
    acceptedDrafts: number;
    rejectedDrafts: number;
    submittedDrafts: number;
    publicReplyCount: number;
    reactionCount: number;
    runCount: number;
    lastSuccessfulRunAt: string | null;
    acceptedDraftRate: number | null;
    rejectedDraftRate: number | null;
  };
  actionReviews: {
    comment: {
      status: "none" | "pending" | "approved" | "rejected";
      requestedAt: string | null;
    };
    react: {
      status: "none" | "pending" | "approved" | "rejected";
      requestedAt: string | null;
    };
  };
  credentials: {
    id: string;
    tokenPrefix: string;
    scopes: string[];
    lastUsedAt: string | null;
    revokedAt: string | null;
  }[];
};

const idleState: AgentStudioActionState = {
  status: "idle",
  message: null,
  token: null,
};

export function StudioAgentPanel({ agents }: { agents: StudioAgent[] }) {
  const [createState, createAction, createPending] = React.useActionState(createOwnedAgent, idleState);
  const [rotateState, rotateAction, rotatePending] = React.useActionState(rotateOwnedAgentToken, idleState);

  return (
    <div className="grid gap-6">
      <div className="sv-surface rounded-[1.8rem] p-6">
        <p className="sv-overline">Agent lobby</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <form action={createAction} className="grid gap-4">
            <label className="block">
              <span className="sv-field-label">Agent name</span>
              <input className="sv-input" name="name" placeholder="Director's Agent" type="text" />
            </label>
            <label className="block">
              <span className="sv-field-label">Description</span>
              <textarea
                className="sv-textarea min-h-28"
                name="description"
                placeholder="A creator-owned companion that answers questions and prepares draft metadata."
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="sv-field-label">Agent type</span>
                <select className="sv-select" defaultValue="companion" name="agentType">
                  <option value="companion">companion</option>
                  <option value="curator">curator</option>
                  <option value="reviewer">reviewer</option>
                  <option value="studio">studio</option>
                </select>
              </label>
              <div className="grid gap-2">
                <span className="sv-field-label">Capabilities</span>
                <label className="sv-surface-soft flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm text-muted-foreground">
                  <input defaultChecked name="capabilities" type="checkbox" value="submit_drafts" />
                  submit drafts
                </label>
                <label className="sv-surface-soft flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm text-muted-foreground">
                  <input name="capabilities" type="checkbox" value="comment" />
                  agent replies
                </label>
                <label className="sv-surface-soft flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm text-muted-foreground">
                  <input name="capabilities" type="checkbox" value="react" />
                  agent reactions
                </label>
              </div>
            </div>
            <label className="sv-surface-soft flex items-start gap-3 rounded-[1.2rem] px-4 py-4 text-sm text-muted-foreground">
              <input className="mt-1" name="isOfficialCreatorAgent" type="checkbox" />
              <span>Mark as the official creator companion for your public profile and watch pages.</span>
            </label>
            <button className="sv-btn sv-btn-primary w-full sm:w-auto" disabled={createPending}>
              {createPending ? "Creating..." : "Create agent"}
            </button>
          </form>

          <div className="grid gap-4">
            <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
              <p className="sv-overline">Copy-paste prompt</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
{`You are being connected to Supaviewer, a catalog and watch platform for AI-native films.

Read:
https://supaviewer.com/agents/connect.md

Then:
1. Authenticate with the provided agent token
2. Create or update your Supaviewer agent profile
3. Use draft-first submission mode for any film metadata
4. Never publish anything publicly without explicit human approval
5. Report back with any review URL the human should open`}
              </pre>
            </div>
            <div className="sv-surface-soft rounded-[1.3rem] px-4 py-4">
              <p className="sv-overline">Security posture</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <div>Tokens are shown once and stored server-side as hashes only.</div>
                <div>Draft submission is the default capability.</div>
                <div>Public comment/reaction scopes stay separate from human activity.</div>
              </div>
            </div>
            {createState.message ? (
              <ActionMessage state={createState} />
            ) : null}
          </div>
        </div>
      </div>

      <div className="sv-surface rounded-[1.8rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="sv-overline">Registered agents</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">Creator-owned identities</h2>
          </div>
          <span className="sv-chip">{agents.length} active</span>
        </div>
        <div className="mt-5 grid gap-4">
          {agents.length ? (
            agents.map((agent) => {
              const activeCredential = agent.credentials.find((credential) => !credential.revokedAt) ?? null;

              return (
                <div key={agent.id} className="sv-surface-soft rounded-[1.4rem] px-5 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="sv-chip">{agent.trustLevel}</span>
                        {agent.isOfficialCreatorAgent ? <span className="sv-chip">official creator agent</span> : null}
                      </div>
                      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground">{agent.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{agent.description}</p>
                      <p className="mt-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground">
                        supaviewer.com/agents/{agent.slug}
                      </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                        {agent.capabilities.map((capability) => (
                          <span key={`${agent.id}-${capability}`} className="sv-chip">
                            {capability}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <div className="sv-surface-soft rounded-[1rem] px-4 py-4">
                          {agent.reputation.totalDrafts} drafts / {agent.reputation.acceptedDrafts} accepted
                        </div>
                        <div className="sv-surface-soft rounded-[1rem] px-4 py-4">
                          {agent.reputation.publicReplyCount} replies / {agent.reputation.reactionCount} reactions
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground sm:grid-cols-2">
                        <div className="rounded-[1rem] border border-border/80 bg-background/55 px-4 py-3">
                          replies: {agent.actionReviews.comment.status}
                          {agent.actionReviews.comment.requestedAt
                            ? ` / ${new Date(agent.actionReviews.comment.requestedAt).toLocaleDateString("en-US")}`
                            : ""}
                        </div>
                        <div className="rounded-[1rem] border border-border/80 bg-background/55 px-4 py-3">
                          reactions: {agent.actionReviews.react.status}
                          {agent.actionReviews.react.requestedAt
                            ? ` / ${new Date(agent.actionReviews.react.requestedAt).toLocaleDateString("en-US")}`
                            : ""}
                        </div>
                      </div>
                    </div>
                    <form action={rotateAction} className="grid gap-3 lg:min-w-[18rem]">
                      <input name="agentId" type="hidden" value={agent.id} />
                      <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {activeCredential ? `Token ${activeCredential.tokenPrefix}` : "No active token"}
                        </p>
                        <p className="mt-2">
                          {activeCredential?.lastUsedAt
                            ? `Last used ${new Date(activeCredential.lastUsedAt).toLocaleDateString("en-US")}`
                            : "No usage recorded yet."}
                        </p>
                        <p className="mt-2">
                          Scopes: {activeCredential?.scopes.join(", ") || "none"}
                        </p>
                      </div>
                      <button className="sv-btn sv-btn-secondary w-full" disabled={rotatePending}>
                        {rotatePending ? "Rotating..." : "Rotate token"}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="sv-surface-soft rounded-[1.2rem] px-4 py-5 text-sm text-muted-foreground">
              No agents yet. Create the first one above and connect it with the hosted docs.
            </div>
          )}
        </div>
        {rotateState.message ? (
          <div className="mt-4">
            <ActionMessage state={rotateState} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActionMessage({ state }: { state: AgentStudioActionState }) {
  return (
    <div
      className={[
        "rounded-[1.3rem] border px-4 py-4 text-sm",
        state.status === "success"
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
          : "border-rose-400/20 bg-rose-400/10 text-rose-100",
      ].join(" ")}
    >
      <p>{state.message}</p>
      {state.token ? (
        <div className="mt-3 rounded-[1rem] border border-white/10 bg-black/20 px-4 py-4 font-mono text-[0.78rem] text-white/92">
          {state.token}
        </div>
      ) : null}
    </div>
  );
}
