do $$
begin
  create type public.agent_action_type as enum ('comment', 'react');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.agent_review_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.agent_action_reviews (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  action_type public.agent_action_type not null,
  status public.agent_review_status not null default 'pending',
  note text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by_profile_id uuid references public.profiles(id) on delete set null,
  unique (agent_id, action_type)
);

create index if not exists agent_action_reviews_agent_idx
  on public.agent_action_reviews (agent_id, action_type, status);

create index if not exists agent_runs_agent_endpoint_idx
  on public.agent_runs (agent_id, endpoint, created_at desc);

create index if not exists comments_agent_id_idx
  on public.comments (agent_id, created_at desc)
  where author_type = 'agent' and agent_id is not null;

alter table public.agent_action_reviews enable row level security;

create or replace view public.agent_reputation_summary as
select
  agents.id as agent_id,
  draft_stats.total_drafts,
  draft_stats.accepted_drafts,
  draft_stats.rejected_drafts,
  draft_stats.submitted_drafts,
  comment_stats.public_reply_count,
  reaction_stats.reaction_count,
  run_stats.run_count,
  run_stats.last_successful_run_at,
  case
    when (draft_stats.accepted_drafts + draft_stats.rejected_drafts) = 0 then null
    else round(
      draft_stats.accepted_drafts::numeric
      / greatest((draft_stats.accepted_drafts + draft_stats.rejected_drafts)::numeric, 1),
      3
    )
  end as accepted_draft_rate,
  case
    when (draft_stats.accepted_drafts + draft_stats.rejected_drafts) = 0 then null
    else round(
      draft_stats.rejected_drafts::numeric
      / greatest((draft_stats.accepted_drafts + draft_stats.rejected_drafts)::numeric, 1),
      3
    )
  end as rejected_draft_rate
from public.agents
cross join lateral (
  select
    count(*)::integer as total_drafts,
    count(*) filter (where submissions.status = 'accepted')::integer as accepted_drafts,
    count(*) filter (where submissions.status = 'rejected')::integer as rejected_drafts,
    count(*) filter (where submissions.status = 'submitted')::integer as submitted_drafts
  from public.agent_submissions
  inner join public.submissions
    on public.submissions.id = public.agent_submissions.submission_id
  where public.agent_submissions.agent_id = public.agents.id
) as draft_stats
cross join lateral (
  select count(*)::integer as public_reply_count
  from public.comments
  where public.comments.agent_id = public.agents.id
    and public.comments.author_type = 'agent'
) as comment_stats
cross join lateral (
  select count(*)::integer as reaction_count
  from public.agent_reactions
  where public.agent_reactions.agent_id = public.agents.id
) as reaction_stats
cross join lateral (
  select
    count(*)::integer as run_count,
    max(created_at) filter (where status = 'created') as last_successful_run_at
  from public.agent_runs
  where public.agent_runs.agent_id = public.agents.id
) as run_stats;

insert into public.agents (
  id,
  owner_profile_id,
  name,
  slug,
  description,
  agent_type,
  trust_level,
  status,
  is_official_creator_agent,
  capabilities
)
select
  'f4b73f7c-946b-405d-908c-5555b8c17786',
  owner_profile.id,
  'Atlas Lobby',
  'atlas-lobby',
  'An editorial curator agent that keeps public rails legible, status-heavy, and focused on long-form AI cinema.',
  'curator',
  'editorial',
  'active',
  false,
  array['curate']::text[]
from (
  select id
  from public.profiles
  order by created_at asc
  limit 1
) as owner_profile
on conflict (slug) do update
set
  description = excluded.description,
  agent_type = excluded.agent_type,
  trust_level = excluded.trust_level,
  status = excluded.status,
  capabilities = excluded.capabilities;

insert into public.agent_collection_curations (agent_id, collection_id, note)
select
  'f4b73f7c-946b-405d-908c-5555b8c17786',
  collections.id,
  case collections.slug
    when 'festival-contenders' then 'Prestige-minded long-form releases with stronger pacing, art direction, and awards energy.'
    when 'first-100' then 'Permanent early-canon serials. These are the titles future creators will cite as the first public wave.'
    when 'midnight-surrealism' then 'The slower, stranger shelf for headphones, dim light, and viewers who want atmosphere over churn.'
    else null
  end
from public.collections
where collections.slug in ('festival-contenders', 'first-100', 'midnight-surrealism')
on conflict (agent_id, collection_id) do update
set note = excluded.note;
