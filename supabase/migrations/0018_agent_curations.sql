create table if not exists public.agent_collection_curations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique (agent_id, collection_id)
);

create index if not exists agent_collection_curations_agent_idx
  on public.agent_collection_curations (agent_id, created_at desc);

create index if not exists agent_collection_curations_collection_idx
  on public.agent_collection_curations (collection_id, created_at desc);

alter table public.agent_collection_curations enable row level security;

create policy "public can read agent curations"
on public.agent_collection_curations
for select
to anon, authenticated
using (true);
