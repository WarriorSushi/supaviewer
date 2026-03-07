create table if not exists public.founder_badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  serial_start bigint not null,
  serial_end bigint,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (serial_start > 0),
  check (serial_end is null or serial_end >= serial_start)
);

create table if not exists public.trophy_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  target_type text not null check (target_type in ('film', 'creator')),
  assignment_type text not null check (assignment_type in ('manual', 'signal')),
  highlight_label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.trophy_assignments (
  id uuid primary key default gen_random_uuid(),
  trophy_definition_id uuid not null references public.trophy_definitions(id) on delete cascade,
  film_id uuid references public.films(id) on delete cascade,
  creator_id uuid references public.creators(id) on delete cascade,
  awarded_by_profile_id uuid references public.profiles(id) on delete set null,
  note text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique nulls not distinct (trophy_definition_id, film_id, creator_id),
  check (((film_id is not null)::integer + (creator_id is not null)::integer) = 1),
  check (ends_at is null or ends_at >= starts_at)
);

create index if not exists founder_badges_serial_idx
on public.founder_badges(serial_start, serial_end);

create index if not exists trophy_assignments_film_idx
on public.trophy_assignments(film_id, starts_at desc)
where film_id is not null;

create index if not exists trophy_assignments_creator_idx
on public.trophy_assignments(creator_id, starts_at desc)
where creator_id is not null;

alter table public.founder_badges enable row level security;
alter table public.trophy_definitions enable row level security;
alter table public.trophy_assignments enable row level security;

create policy "public can read founder badges"
on public.founder_badges
for select
to anon, authenticated
using (true);

create policy "public can read trophy definitions"
on public.trophy_definitions
for select
to anon, authenticated
using (true);

create policy "public can read trophy assignments"
on public.trophy_assignments
for select
to anon, authenticated
using (
  ends_at is null
  or ends_at >= now()
);

insert into public.founder_badges (slug, name, description, serial_start, serial_end, sort_order)
values
  (
    'founding-100',
    'Founding 100',
    'Accepted within the first 100 permanent Supaviewer serials.',
    1,
    100,
    1
  ),
  (
    'founding-500',
    'Founding 500',
    'Accepted within the first 500 permanent Supaviewer serials.',
    101,
    500,
    2
  ),
  (
    'first-1000',
    'First 1000',
    'Accepted before the catalog crossed its first thousand canonical titles.',
    501,
    1000,
    3
  ),
  (
    'early-canon',
    'Early Canon',
    'Accepted while the AI-native long-form canon was still taking shape.',
    1001,
    2500,
    4
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  serial_start = excluded.serial_start,
  serial_end = excluded.serial_end,
  sort_order = excluded.sort_order;

insert into public.trophy_definitions (
  slug,
  name,
  description,
  target_type,
  assignment_type,
  highlight_label,
  sort_order
)
values
  (
    'most-saved-this-week',
    'Most Saved This Week',
    'Leading the platform in viewer saves over the last seven days.',
    'film',
    'signal',
    'Weekly signal',
    1
  ),
  (
    'most-discussed',
    'Most Discussed',
    'Drawing the strongest conversation signal on Supaviewer right now.',
    'film',
    'signal',
    'Conversation leader',
    2
  ),
  (
    'festival-contender',
    'Festival Contender',
    'Editorial selection for films with standout craft, ambition, and festival-readiness.',
    'film',
    'manual',
    'Editorial',
    3
  ),
  (
    'staff-select',
    'Staff Select',
    'Chosen by Supaviewer editors as a defining work in the catalog.',
    'film',
    'manual',
    'Supaviewer',
    4
  ),
  (
    'breakout-director',
    'Breakout Director',
    'A creator whose catalog presence is accelerating faster than the field.',
    'creator',
    'manual',
    'Creator status',
    5
  ),
  (
    'audience-signal',
    'Audience Signal',
    'Picked up unusual viewer intent through saves, discussion, and repeat discovery.',
    'film',
    'manual',
    'Momentum',
    6
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  target_type = excluded.target_type,
  assignment_type = excluded.assignment_type,
  highlight_label = excluded.highlight_label,
  sort_order = excluded.sort_order;

insert into public.trophy_assignments (trophy_definition_id, film_id, note)
select
  td.id,
  film_ranked.id,
  'Seeded from featured weight to establish the first editorial status surface.'
from public.trophy_definitions td
join lateral (
  select id
  from public.films
  where visibility in ('public', 'limited')
  order by featured_weight desc, serial_number asc
  limit 1
) as film_ranked on true
where td.slug = 'staff-select'
on conflict (trophy_definition_id, film_id, creator_id) do nothing;

insert into public.trophy_assignments (trophy_definition_id, film_id, note)
select
  td.id,
  film_ranked.id,
  'Seeded from featuring and recency to establish the first prestige rail.'
from public.trophy_definitions td
join lateral (
  select id
  from public.films
  where visibility in ('public', 'limited')
  order by featured_weight desc, published_at desc nulls last, serial_number asc
  offset 1
  limit 1
) as film_ranked on true
where td.slug = 'festival-contender'
on conflict (trophy_definition_id, film_id, creator_id) do nothing;

insert into public.trophy_assignments (trophy_definition_id, film_id, note)
select
  td.id,
  film_ranked.id,
  'Seeded from total saves to show early demand signal.'
from public.trophy_definitions td
join lateral (
  select id
  from public.films
  where visibility in ('public', 'limited')
  order by saves_count desc, discussion_count desc, serial_number asc
  limit 1
) as film_ranked on true
where td.slug = 'audience-signal'
on conflict (trophy_definition_id, film_id, creator_id) do nothing;

insert into public.trophy_assignments (trophy_definition_id, creator_id, note)
select
  td.id,
  creator_ranked.creator_id,
  'Seeded from current catalog momentum to establish the first creator status surface.'
from public.trophy_definitions td
join lateral (
  select creator_id
  from public.films
  where visibility in ('public', 'limited')
  group by creator_id
  order by sum(saves_count + discussion_count * 2 + featured_weight * 3) desc, min(serial_number) asc
  limit 1
) as creator_ranked on true
where td.slug = 'breakout-director'
on conflict (trophy_definition_id, film_id, creator_id) do nothing;

create or replace function public.get_live_signal_trophies()
returns table (
  trophy_slug text,
  film_id uuid,
  creator_id uuid,
  note text,
  starts_at timestamptz
)
language sql
stable
set search_path = public
as $$
  with most_saved as (
    select
      'most-saved-this-week'::text as trophy_slug,
      s.film_id,
      null::uuid as creator_id,
      'Leading saves collected during the last seven days.'::text as note,
      now() - interval '7 days' as starts_at,
      count(*) as score
    from public.saves s
    join public.films f on f.id = s.film_id
    where s.created_at >= now() - interval '7 days'
      and f.visibility in ('public', 'limited')
    group by s.film_id
    order by count(*) desc, max(s.created_at) desc, min(f.serial_number) asc
    limit 1
  ),
  most_discussed as (
    select
      'most-discussed'::text as trophy_slug,
      c.film_id,
      null::uuid as creator_id,
      'Strongest active discussion velocity on the platform.'::text as note,
      now() - interval '14 days' as starts_at,
      count(*) as score
    from public.comments c
    join public.films f on f.id = c.film_id
    where c.created_at >= now() - interval '14 days'
      and f.visibility in ('public', 'limited')
    group by c.film_id
    order by count(*) desc, max(c.created_at) desc, min(f.serial_number) asc
    limit 1
  )
  select trophy_slug, film_id, creator_id, note, starts_at
  from most_saved
  union all
  select trophy_slug, film_id, creator_id, note, starts_at
  from most_discussed;
$$;
