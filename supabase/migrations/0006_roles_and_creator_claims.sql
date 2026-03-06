create type public.profile_role as enum ('viewer', 'admin');

alter table public.profiles
  add column if not exists role public.profile_role not null default 'viewer';

alter table public.creators
  alter column profile_id drop not null;

create unique index if not exists creators_profile_id_unique
on public.creators(profile_id)
where profile_id is not null;

create table if not exists public.creator_claim_requests (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (creator_id, profile_id)
);

alter table public.creator_claim_requests enable row level security;

create policy "authenticated users can create owned creators"
on public.creators
for insert
to authenticated
with check (auth.uid() = profile_id);

create policy "owners can update creators"
on public.creators
for update
to authenticated
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "users can create own creator claim requests"
on public.creator_claim_requests
for insert
to authenticated
with check (auth.uid() = profile_id);

create policy "users can read own creator claim requests"
on public.creator_claim_requests
for select
to authenticated
using (auth.uid() = profile_id);
