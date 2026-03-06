alter table public.profiles
  alter column id drop default;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1), 'viewer'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.follows enable row level security;
alter table public.saves enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

create policy "users can read profiles"
on public.profiles
for select
to anon, authenticated
using (true);

create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "authenticated users can insert submissions"
on public.submissions
for insert
to authenticated
with check (true);

create policy "users can read own submissions"
on public.submissions
for select
to authenticated
using (true);

create policy "public can read comments"
on public.comments
for select
to anon, authenticated
using (true);

create policy "authenticated users can comment"
on public.comments
for insert
to authenticated
with check (auth.uid() = profile_id);

create policy "users can delete own comments"
on public.comments
for delete
to authenticated
using (auth.uid() = profile_id);

create policy "public can read likes"
on public.likes
for select
to anon, authenticated
using (true);

create policy "authenticated users can manage likes"
on public.likes
for insert
to authenticated
with check (auth.uid() = profile_id);

create policy "authenticated users can remove likes"
on public.likes
for delete
to authenticated
using (auth.uid() = profile_id);

create policy "public can read saves"
on public.saves
for select
to anon, authenticated
using (true);

create policy "authenticated users can manage saves"
on public.saves
for insert
to authenticated
with check (auth.uid() = profile_id);

create policy "authenticated users can remove saves"
on public.saves
for delete
to authenticated
using (auth.uid() = profile_id);

create policy "public can read follows"
on public.follows
for select
to anon, authenticated
using (true);

create policy "authenticated users can manage follows"
on public.follows
for insert
to authenticated
with check (auth.uid() = profile_id);

create policy "authenticated users can remove follows"
on public.follows
for delete
to authenticated
using (auth.uid() = profile_id);
