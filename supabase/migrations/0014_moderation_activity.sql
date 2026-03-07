alter table public.moderation_cases
  add column if not exists case_type text not null default 'manual',
  add column if not exists comment_id uuid references public.comments(id) on delete set null,
  add column if not exists actor_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists notes text,
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists moderation_cases_created_at_idx
  on public.moderation_cases (created_at desc);

create index if not exists moderation_cases_case_type_idx
  on public.moderation_cases (case_type);

create index if not exists moderation_cases_status_idx
  on public.moderation_cases (status);
