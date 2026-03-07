create table if not exists public.film_daily_views (
  film_id uuid not null references public.films(id) on delete cascade,
  viewer_token text not null,
  viewed_on date not null default current_date,
  profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (film_id, viewer_token, viewed_on)
);

alter table public.film_daily_views enable row level security;

create or replace function public.refresh_film_save_count(p_film_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.films
  set saves_count = (
    select count(*)::integer
    from public.saves
    where film_id = p_film_id
  )
  where id = p_film_id;
end;
$$;

create or replace function public.refresh_film_discussion_count(p_film_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.films
  set discussion_count = (
    select count(*)::integer
    from public.comments
    where film_id = p_film_id
  )
  where id = p_film_id;
end;
$$;

create or replace function public.handle_save_count_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_film_save_count(coalesce(new.film_id, old.film_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.handle_discussion_count_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_film_discussion_count(coalesce(new.film_id, old.film_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists saves_count_sync_after_insert on public.saves;
create trigger saves_count_sync_after_insert
after insert on public.saves
for each row
execute function public.handle_save_count_sync();

drop trigger if exists saves_count_sync_after_delete on public.saves;
create trigger saves_count_sync_after_delete
after delete on public.saves
for each row
execute function public.handle_save_count_sync();

drop trigger if exists comments_count_sync_after_insert on public.comments;
create trigger comments_count_sync_after_insert
after insert on public.comments
for each row
execute function public.handle_discussion_count_sync();

drop trigger if exists comments_count_sync_after_delete on public.comments;
create trigger comments_count_sync_after_delete
after delete on public.comments
for each row
execute function public.handle_discussion_count_sync();

create or replace function public.record_film_view(
  p_film_id uuid,
  p_viewer_token text,
  p_profile_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer := 0;
begin
  if p_film_id is null or coalesce(trim(p_viewer_token), '') = '' then
    return false;
  end if;

  insert into public.film_daily_views (film_id, viewer_token, profile_id)
  values (p_film_id, trim(p_viewer_token), p_profile_id)
  on conflict do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update public.films
    set views_count = views_count + 1
    where id = p_film_id;

    return true;
  end if;

  return false;
end;
$$;

update public.films as films
set saves_count = counts.total
from (
  select film_id, count(*)::integer as total
  from public.saves
  group by film_id
) as counts
where films.id = counts.film_id;

update public.films
set saves_count = 0
where id not in (select distinct film_id from public.saves);

update public.films as films
set discussion_count = counts.total
from (
  select film_id, count(*)::integer as total
  from public.comments
  group by film_id
) as counts
where films.id = counts.film_id;

update public.films
set discussion_count = 0
where id not in (select distinct film_id from public.comments);

grant execute on function public.record_film_view(uuid, text, uuid) to anon, authenticated;

revoke all on function public.refresh_film_save_count(uuid) from public, anon, authenticated;
revoke all on function public.refresh_film_discussion_count(uuid) from public, anon, authenticated;
revoke all on function public.handle_save_count_sync() from public, anon, authenticated;
revoke all on function public.handle_discussion_count_sync() from public, anon, authenticated;
