alter table public.creators
  add column if not exists profile_id uuid references public.profiles(id) on delete set null;

alter table public.submissions
  add column if not exists profile_id uuid references public.profiles(id) on delete set null;

drop policy if exists "authenticated users can insert submissions" on public.submissions;
drop policy if exists "users can read own submissions" on public.submissions;

create policy "authenticated users can insert own submissions"
on public.submissions
for insert
to authenticated
with check (auth.uid() = profile_id);

create policy "users can read own submissions"
on public.submissions
for select
to authenticated
using (auth.uid() = profile_id);
