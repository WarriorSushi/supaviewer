create or replace function public.extract_youtube_video_id(p_url text)
returns text
language plpgsql
immutable
strict
set search_path = public
as $$
declare
  v_match text[];
begin
  v_match := regexp_match(p_url, '(?:youtu\.be/|youtube\.com/watch\?v=|youtube\.com/embed/|youtube\.com/shorts/)([A-Za-z0-9_-]{11})');
  return v_match[1];
end;
$$;

alter table public.films
  add column if not exists youtube_video_id text;

alter table public.submissions
  add column if not exists youtube_video_id text;

update public.films
set youtube_video_id = public.extract_youtube_video_id(youtube_url)
where youtube_video_id is null;

update public.submissions
set youtube_video_id = public.extract_youtube_video_id(youtube_url)
where youtube_video_id is null;

alter table public.films
  alter column youtube_video_id set not null;

alter table public.submissions
  alter column youtube_video_id set not null;

create unique index if not exists films_youtube_video_id_idx
  on public.films (youtube_video_id);

create unique index if not exists submissions_active_youtube_video_id_idx
  on public.submissions (youtube_video_id)
  where status <> 'rejected';

drop function if exists public.approve_submission(uuid);

create or replace function public.approve_submission(p_submission_id uuid)
returns table (film_id uuid, serial_number bigint, slug text)
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

  if exists (
    select 1
    from public.films
    where youtube_video_id = v_submission.youtube_video_id
  ) then
    raise exception 'A film already exists for video %', v_submission.youtube_video_id;
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
        youtube_video_id,
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
        v_submission.youtube_video_id,
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
      returning id, public.films.serial_number, public.films.slug
      into film_id, serial_number, slug;

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

revoke all on function public.extract_youtube_video_id(text) from public, anon, authenticated;
grant execute on function public.approve_submission(uuid) to authenticated;
