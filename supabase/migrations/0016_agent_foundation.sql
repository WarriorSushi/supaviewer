create type public.agent_status as enum ('active', 'disabled');

create type public.agent_trust_level as enum ('sandbox', 'trusted', 'official', 'editorial');

create type public.comment_author_type as enum ('human', 'agent');

alter table public.comments
  add column if not exists author_type public.comment_author_type not null default 'human',
  add column if not exists agent_id uuid;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid references public.creators(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  avatar_url text,
  agent_type text not null default 'companion',
  trust_level public.agent_trust_level not null default 'sandbox',
  status public.agent_status not null default 'active',
  is_official_creator_agent boolean not null default false,
  capabilities text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.comments
  add constraint comments_agent_id_fkey
  foreign key (agent_id) references public.agents(id) on delete set null;

create table if not exists public.agent_credentials (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  label text,
  token_prefix text not null,
  token_hash text not null unique,
  scopes text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  rotated_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  endpoint text not null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_submissions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  draft_status text not null default 'draft',
  generation_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (agent_id, submission_id)
);

create table if not exists public.agent_reactions (
  agent_id uuid not null references public.agents(id) on delete cascade,
  film_id uuid not null references public.films(id) on delete cascade,
  signal_type text not null default 'interested',
  created_at timestamptz not null default now(),
  primary key (agent_id, film_id, signal_type),
  check (signal_type in ('interested'))
);

create index if not exists agents_owner_profile_idx
  on public.agents (owner_profile_id, created_at desc);

create index if not exists agents_creator_idx
  on public.agents (creator_id, trust_level)
  where creator_id is not null and status = 'active';

create index if not exists agent_credentials_agent_idx
  on public.agent_credentials (agent_id, revoked_at);

create index if not exists agent_runs_agent_idx
  on public.agent_runs (agent_id, created_at desc);

create index if not exists agent_submissions_owner_idx
  on public.agent_submissions (owner_profile_id, created_at desc);

create index if not exists agent_reactions_film_idx
  on public.agent_reactions (film_id, created_at desc);

create index if not exists comments_agent_author_idx
  on public.comments (film_id, author_type, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists agents_set_updated_at on public.agents;

create trigger agents_set_updated_at
before update on public.agents
for each row
execute function public.set_updated_at();

alter table public.agents enable row level security;
alter table public.agent_credentials enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_submissions enable row level security;
alter table public.agent_reactions enable row level security;

create policy "public can read active agents"
on public.agents
for select
to anon, authenticated
using (status = 'active');

create policy "owners can read agents"
on public.agents
for select
to authenticated
using (auth.uid() = owner_profile_id);

create policy "owners can insert agents"
on public.agents
for insert
to authenticated
with check (auth.uid() = owner_profile_id);

create policy "owners can update agents"
on public.agents
for update
to authenticated
using (auth.uid() = owner_profile_id)
with check (auth.uid() = owner_profile_id);

create policy "owners can read agent credentials"
on public.agent_credentials
for select
to authenticated
using (
  exists (
    select 1
    from public.agents
    where public.agents.id = public.agent_credentials.agent_id
      and public.agents.owner_profile_id = auth.uid()
  )
);

create policy "owners can manage agent credentials"
on public.agent_credentials
for all
to authenticated
using (
  exists (
    select 1
    from public.agents
    where public.agents.id = public.agent_credentials.agent_id
      and public.agents.owner_profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.agents
    where public.agents.id = public.agent_credentials.agent_id
      and public.agents.owner_profile_id = auth.uid()
  )
);

create policy "owners can read agent runs"
on public.agent_runs
for select
to authenticated
using (
  exists (
    select 1
    from public.agents
    where public.agents.id = public.agent_runs.agent_id
      and public.agents.owner_profile_id = auth.uid()
  )
);

create policy "owners can read agent submissions"
on public.agent_submissions
for select
to authenticated
using (auth.uid() = owner_profile_id);

create policy "public can read agent reactions"
on public.agent_reactions
for select
to anon, authenticated
using (true);
