alter table public.submissions
  add column if not exists published_film_id uuid references public.films(id) on delete set null,
  add column if not exists processed_at timestamptz;

create table if not exists public.serial_counters (
  counter_name text primary key,
  next_value bigint not null check (next_value > 0),
  updated_at timestamptz not null default now()
);

insert into public.serial_counters (counter_name, next_value)
values ('films', 1)
on conflict (counter_name) do nothing;

update public.films
set serial_number = serial_number + 1000000;

with ordered as (
  select id, row_number() over (order by serial_number, created_at, id) as new_serial
  from public.films
)
update public.films as films
set serial_number = ordered.new_serial
from ordered
where films.id = ordered.id;

update public.serial_counters
set
  next_value = coalesce((select max(serial_number) from public.films), 0) + 1,
  updated_at = now()
where counter_name = 'films';

select setval(
  'public.film_serial_seq',
  greatest(coalesce((select max(serial_number) from public.films), 0), 1),
  true
);

create or replace function public.normalize_slug(p_value text, p_fallback text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
begin
  v_slug := regexp_replace(lower(coalesce(p_value, '')), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);

  if v_slug = '' then
    v_slug := p_fallback;
  end if;

  return v_slug;
end;
$$;

create or replace function public.require_admin_actor()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_actor_role public.profile_role;
begin
  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  select role
  into v_actor_role
  from public.profiles
  where id = v_actor_id;

  if v_actor_role is distinct from 'admin' then
    raise exception 'Admin access required';
  end if;

  return v_actor_id;
end;
$$;

create or replace function public.allocate_film_serial()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_serial bigint;
begin
  update public.serial_counters
  set
    next_value = next_value + 1,
    updated_at = now()
  where counter_name = 'films'
  returning next_value - 1 into v_serial;

  if v_serial is null then
    raise exception 'Film serial counter is not initialized';
  end if;

  return v_serial;
end;
$$;

alter table public.films
  alter column serial_number set default public.allocate_film_serial();

create or replace function public.ensure_creator_for_profile(p_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator_id uuid;
  v_profile public.profiles%rowtype;
  v_base_slug text;
  v_slug text;
  v_suffix integer := 2;
begin
  select id
  into v_creator_id
  from public.creators
  where profile_id = p_profile_id
  limit 1;

  if v_creator_id is not null then
    return v_creator_id;
  end if;

  select *
  into v_profile
  from public.profiles
  where id = p_profile_id;

  if not found then
    raise exception 'Profile % not found', p_profile_id;
  end if;

  v_base_slug := public.normalize_slug(v_profile.display_name, 'creator');
  v_slug := v_base_slug;

  loop
    begin
      insert into public.creators (profile_id, slug, name, headline, bio, location)
      values (
        p_profile_id,
        v_slug,
        v_profile.display_name,
        'AI filmmaker on Superviewer.',
        coalesce(
          nullif(v_profile.bio, ''),
          v_profile.display_name || ' is building an AI-native filmography on Superviewer.'
        ),
        ''
      )
      returning id into v_creator_id;

      return v_creator_id;
    exception
      when unique_violation then
        select id
        into v_creator_id
        from public.creators
        where profile_id = p_profile_id
        limit 1;

        if v_creator_id is not null then
          return v_creator_id;
        end if;

        v_slug := v_base_slug || '-' || v_suffix;
        v_suffix := v_suffix + 1;
    end;
  end loop;
end;
$$;

create or replace function public.approve_submission(p_submission_id uuid)
returns table (film_id uuid, serial_number bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission public.submissions%rowtype;
  v_creator_id uuid;
  v_base_slug text;
  v_slug text;
  v_suffix integer := 2;
begin
  perform public.require_admin_actor();

  select *
  into v_submission
  from public.submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Submission % not found', p_submission_id;
  end if;

  if v_submission.status <> 'submitted' then
    raise exception 'Submission % is not in submitted state', p_submission_id;
  end if;

  if v_submission.profile_id is null then
    raise exception 'Submission % has no profile owner', p_submission_id;
  end if;

  if v_submission.published_film_id is not null then
    raise exception 'Submission % is already linked to a film', p_submission_id;
  end if;

  v_creator_id := public.ensure_creator_for_profile(v_submission.profile_id);
  v_base_slug := public.normalize_slug(v_submission.proposed_title, 'film');
  v_slug := v_base_slug;

  loop
    begin
      insert into public.films (
        serial_number,
        creator_id,
        slug,
        title,
        logline,
        synopsis,
        youtube_url,
        runtime_minutes,
        release_year,
        format,
        genre,
        mood,
        languages,
        tools,
        featured_weight,
        visibility,
        discussion_count,
        views_count,
        saves_count,
        published_at
      )
      values (
        public.allocate_film_serial(),
        v_creator_id,
        v_slug,
        v_submission.proposed_title,
        v_submission.logline,
        coalesce(v_submission.logline, v_submission.proposed_title),
        v_submission.youtube_url,
        coalesce(v_submission.runtime_minutes, 1),
        extract(year from coalesce(v_submission.created_at, now()))::integer,
        coalesce(v_submission.format, 'feature film'),
        coalesce(v_submission.genre, 'AI cinema'),
        'haunting',
        array['English'],
        coalesce(v_submission.tools, array[]::text[]),
        0,
        'public',
        0,
        0,
        0,
        now()
      )
      returning id, public.films.serial_number
      into film_id, serial_number;

      exit;
    exception
      when unique_violation then
        if exists (select 1 from public.films where slug = v_slug) then
          v_slug := v_base_slug || '-' || v_suffix;
          v_suffix := v_suffix + 1;
        else
          raise;
        end if;
    end;
  end loop;

  update public.submissions
  set
    creator_id = v_creator_id,
    status = 'accepted',
    published_film_id = film_id,
    processed_at = now()
  where id = p_submission_id;

  return next;
end;
$$;

create or replace function public.reject_submission(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission public.submissions%rowtype;
begin
  perform public.require_admin_actor();

  select *
  into v_submission
  from public.submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Submission % not found', p_submission_id;
  end if;

  if v_submission.status <> 'submitted' then
    raise exception 'Submission % is not in submitted state', p_submission_id;
  end if;

  update public.submissions
  set
    status = 'rejected',
    processed_at = now()
  where id = p_submission_id;
end;
$$;

revoke all on function public.normalize_slug(text, text) from public, anon, authenticated;
revoke all on function public.require_admin_actor() from public, anon, authenticated;
revoke all on function public.allocate_film_serial() from public, anon, authenticated;
revoke all on function public.ensure_creator_for_profile(uuid) from public, anon, authenticated;

grant execute on function public.approve_submission(uuid) to authenticated;
grant execute on function public.reject_submission(uuid) to authenticated;
