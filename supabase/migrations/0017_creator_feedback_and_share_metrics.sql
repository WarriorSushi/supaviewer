alter table public.submissions
  add column if not exists rejection_reason text,
  add column if not exists rejection_details text,
  add column if not exists reviewed_at timestamptz;

alter table public.submissions
  drop constraint if exists submissions_rejection_reason_check;

alter table public.submissions
  add constraint submissions_rejection_reason_check
  check (
    rejection_reason is null
    or rejection_reason in (
      'invalid-source',
      'duplicate-source',
      'rights-ambiguity',
      'insufficient-metadata',
      'not-long-form-fit',
      'other'
    )
  );

alter table public.agent_submissions
  add column if not exists promoted_at timestamptz;

create table if not exists public.share_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  film_id uuid references public.films(id) on delete cascade,
  creator_id uuid references public.creators(id) on delete cascade,
  surface text not null default 'unknown',
  created_at timestamptz not null default now(),
  check (((film_id is not null)::int + (creator_id is not null)::int) = 1),
  check (char_length(surface) between 1 and 64)
);

create index if not exists share_events_film_idx
  on public.share_events (film_id, created_at desc)
  where film_id is not null;

create index if not exists share_events_creator_idx
  on public.share_events (creator_id, created_at desc)
  where creator_id is not null;

alter table public.share_events enable row level security;

create policy "public can insert share events"
on public.share_events
for insert
to anon, authenticated
with check (true);
