do $$
begin
  create type public.watch_event_status as enum ('scheduled', 'live', 'ended', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.watch_attendee_type as enum ('human', 'agent');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.watch_presence_state as enum ('watching', 'taking-notes', 'answering-questions', 'hosting', 'away');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.watch_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  film_id uuid not null references public.films(id) on delete cascade,
  creator_id uuid references public.creators(id) on delete set null,
  host_profile_id uuid references public.profiles(id) on delete set null,
  official_agent_id uuid references public.agents(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.watch_event_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create table if not exists public.watch_event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.watch_events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  agent_slug text,
  attendee_type public.watch_attendee_type not null,
  display_name text not null,
  presence_state public.watch_presence_state not null default 'watching',
  trust_level public.agent_trust_level,
  is_official_creator_agent boolean not null default false,
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (event_id, profile_id),
  unique (event_id, agent_id),
  check (
    (attendee_type = 'human' and profile_id is not null and agent_id is null and trust_level is null)
    or
    (attendee_type = 'agent' and agent_id is not null and profile_id is null and agent_slug is not null)
  )
);

create table if not exists public.watch_event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.watch_events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  agent_slug text,
  author_type public.watch_attendee_type not null,
  display_name text not null,
  body text not null,
  trust_level public.agent_trust_level,
  is_official_creator_agent boolean not null default false,
  created_at timestamptz not null default now(),
  check (char_length(trim(body)) > 0),
  check (
    (author_type = 'human' and profile_id is not null and agent_id is null and trust_level is null)
    or
    (author_type = 'agent' and agent_id is not null and profile_id is null and agent_slug is not null)
  )
);

create index if not exists watch_events_film_idx
  on public.watch_events (film_id, starts_at asc);

create index if not exists watch_events_host_idx
  on public.watch_events (host_profile_id, starts_at desc);

create index if not exists watch_events_creator_idx
  on public.watch_events (creator_id, starts_at desc);

create index if not exists watch_event_attendees_event_seen_idx
  on public.watch_event_attendees (event_id, last_seen_at desc);

create index if not exists watch_event_attendees_agent_idx
  on public.watch_event_attendees (agent_id, last_seen_at desc)
  where agent_id is not null;

create index if not exists watch_event_messages_event_created_idx
  on public.watch_event_messages (event_id, created_at desc);

create index if not exists watch_event_messages_agent_idx
  on public.watch_event_messages (agent_id, created_at desc)
  where agent_id is not null;

drop trigger if exists watch_events_set_updated_at on public.watch_events;

create trigger watch_events_set_updated_at
before update on public.watch_events
for each row
execute function public.set_updated_at();

alter table public.watch_events enable row level security;
alter table public.watch_event_attendees enable row level security;
alter table public.watch_event_messages enable row level security;

drop policy if exists "public can read watch events" on public.watch_events;
create policy "public can read watch events"
on public.watch_events
for select
to anon, authenticated
using (true);

drop policy if exists "hosts can create watch events" on public.watch_events;
create policy "hosts can create watch events"
on public.watch_events
for insert
to authenticated
with check (auth.uid() = host_profile_id);

drop policy if exists "hosts can update watch events" on public.watch_events;
create policy "hosts can update watch events"
on public.watch_events
for update
to authenticated
using (auth.uid() = host_profile_id)
with check (auth.uid() = host_profile_id);

drop policy if exists "public can read watch attendees" on public.watch_event_attendees;
create policy "public can read watch attendees"
on public.watch_event_attendees
for select
to anon, authenticated
using (true);

drop policy if exists "users can join watch lounges" on public.watch_event_attendees;
create policy "users can join watch lounges"
on public.watch_event_attendees
for insert
to authenticated
with check (
  attendee_type = 'human'
  and auth.uid() = profile_id
  and exists (
    select 1
    from public.watch_events
    where public.watch_events.id = public.watch_event_attendees.event_id
  )
);

drop policy if exists "users can refresh own watch presence" on public.watch_event_attendees;
create policy "users can refresh own watch presence"
on public.watch_event_attendees
for update
to authenticated
using (attendee_type = 'human' and auth.uid() = profile_id)
with check (attendee_type = 'human' and auth.uid() = profile_id);

drop policy if exists "public can read watch messages" on public.watch_event_messages;
create policy "public can read watch messages"
on public.watch_event_messages
for select
to anon, authenticated
using (true);

drop policy if exists "users can post watch messages" on public.watch_event_messages;
create policy "users can post watch messages"
on public.watch_event_messages
for insert
to authenticated
with check (
  author_type = 'human'
  and auth.uid() = profile_id
  and exists (
    select 1
    from public.watch_events
    where public.watch_events.id = public.watch_event_messages.event_id
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'watch_events'
  ) then
    alter publication supabase_realtime add table public.watch_events;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'watch_event_attendees'
  ) then
    alter publication supabase_realtime add table public.watch_event_attendees;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'watch_event_messages'
  ) then
    alter publication supabase_realtime add table public.watch_event_messages;
  end if;
end
$$;

insert into public.watch_events (
  slug,
  title,
  description,
  film_id,
  creator_id,
  host_profile_id,
  official_agent_id,
  starts_at,
  ends_at,
  status
)
select
  'afterlight-valley-launch-party',
  'Afterlight Valley Launch Party',
  'A synchronous premiere room for the film, with the side rail reserved for human chat and creator-side agent company.',
  films.id,
  films.creator_id,
  (
    select profiles.id
    from public.profiles
    order by profiles.created_at asc
    limit 1
  ),
  (
    select agents.id
    from public.agents
    where agents.slug = 'atlas-lobby'
      and agents.status = 'active'
    limit 1
  ),
  now() + interval '2 days',
  now() + interval '2 days 2 hours',
  'scheduled'
from public.films
where public.films.slug = 'afterlight-valley'
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  official_agent_id = excluded.official_agent_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status;

insert into public.watch_event_attendees (
  event_id,
  agent_id,
  agent_slug,
  attendee_type,
  display_name,
  presence_state,
  trust_level,
  is_official_creator_agent,
  is_host,
  joined_at,
  last_seen_at
)
select
  watch_events.id,
  agents.id,
  agents.slug,
  'agent',
  agents.name,
  'hosting',
  agents.trust_level,
  agents.is_official_creator_agent,
  false,
  now(),
  now()
from public.watch_events
inner join public.agents
  on public.agents.id = public.watch_events.official_agent_id
where public.watch_events.slug = 'afterlight-valley-launch-party'
on conflict (event_id, agent_id) do update
set
  display_name = excluded.display_name,
  presence_state = excluded.presence_state,
  trust_level = excluded.trust_level,
  is_official_creator_agent = excluded.is_official_creator_agent,
  last_seen_at = excluded.last_seen_at;

insert into public.watch_event_messages (
  event_id,
  agent_id,
  agent_slug,
  author_type,
  display_name,
  body,
  trust_level,
  is_official_creator_agent,
  created_at
)
select
  watch_events.id,
  agents.id,
  agents.slug,
  'agent',
  agents.name,
  'House lights in ten. Human chat lives on the left rail; agent context stays separate so the premiere stays readable.',
  agents.trust_level,
  agents.is_official_creator_agent,
  now()
from public.watch_events
inner join public.agents
  on public.agents.id = public.watch_events.official_agent_id
where public.watch_events.slug = 'afterlight-valley-launch-party'
  and not exists (
    select 1
    from public.watch_event_messages
    where public.watch_event_messages.event_id = public.watch_events.id
      and public.watch_event_messages.agent_id = public.agents.id
      and public.watch_event_messages.body = 'House lights in ten. Human chat lives on the left rail; agent context stays separate so the premiere stays readable.'
  );
