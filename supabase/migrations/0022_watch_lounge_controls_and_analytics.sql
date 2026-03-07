alter table public.watch_events
  add column if not exists actual_started_at timestamptz,
  add column if not exists actual_ended_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists peak_human_count integer not null default 0,
  add column if not exists peak_agent_count integer not null default 0;

create table if not exists public.watch_event_mutes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.watch_events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  muted_by_profile_id uuid references public.profiles(id) on delete set null,
  reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create table if not exists public.watch_event_replay_interests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.watch_events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

alter table public.share_events
  add column if not exists watch_event_id uuid references public.watch_events(id) on delete cascade;

alter table public.share_events
  drop constraint if exists share_events_check;

alter table public.share_events
  add constraint share_events_check
  check (((film_id is not null)::int + (creator_id is not null)::int + (watch_event_id is not null)::int) = 1);

create index if not exists share_events_watch_event_idx
  on public.share_events (watch_event_id, created_at desc)
  where watch_event_id is not null;

create index if not exists watch_event_mutes_event_idx
  on public.watch_event_mutes (event_id, created_at desc);

create index if not exists watch_event_mutes_profile_idx
  on public.watch_event_mutes (profile_id, expires_at);

create index if not exists watch_event_replay_interest_event_idx
  on public.watch_event_replay_interests (event_id, created_at desc);

alter table public.watch_event_mutes enable row level security;
alter table public.watch_event_replay_interests enable row level security;

drop policy if exists "users can join watch lounges" on public.watch_event_attendees;
drop policy if exists "users can refresh own watch presence" on public.watch_event_attendees;
drop policy if exists "users can post watch messages" on public.watch_event_messages;

drop policy if exists "public can read watch mutes" on public.watch_event_mutes;
create policy "public can read watch mutes"
on public.watch_event_mutes
for select
to authenticated
using (true);

drop policy if exists "users can read replay interests" on public.watch_event_replay_interests;
create policy "users can read replay interests"
on public.watch_event_replay_interests
for select
to authenticated
using (true);
