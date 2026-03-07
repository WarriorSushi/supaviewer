create or replace function public._supaviewer_brand_replace(value text)
returns text
language sql
immutable
as $$
  select
    case
      when value is null then null
      else replace(
        replace(
          replace(
            replace(value, 'https://super' || 'viewer.com', 'https://supa' || 'viewer.com'),
            'super' || 'viewer.com',
            'supa' || 'viewer.com'
          ),
          'Super' || 'viewer',
          'Supa' || 'viewer'
        ),
        'super' || 'viewer',
        'supa' || 'viewer'
      )
    end
$$;

update public.profiles
set bio = public._supaviewer_brand_replace(bio)
where bio is not null;

update public.creators
set
  headline = public._supaviewer_brand_replace(headline),
  bio = public._supaviewer_brand_replace(bio)
where headline is not null or bio is not null;

update public.agents
set description = public._supaviewer_brand_replace(description)
where description is not null;

update public.films
set
  logline = public._supaviewer_brand_replace(logline),
  synopsis = public._supaviewer_brand_replace(synopsis)
where logline is not null or synopsis is not null;

update public.collections
set description = public._supaviewer_brand_replace(description)
where description is not null;

update public.founder_badges
set
  name = public._supaviewer_brand_replace(name),
  description = public._supaviewer_brand_replace(description);

update public.trophy_definitions
set
  name = public._supaviewer_brand_replace(name),
  description = public._supaviewer_brand_replace(description),
  highlight_label = public._supaviewer_brand_replace(highlight_label);

update public.watch_events
set
  title = public._supaviewer_brand_replace(title),
  description = public._supaviewer_brand_replace(description)
where title is not null or description is not null;

drop function public._supaviewer_brand_replace(text);
