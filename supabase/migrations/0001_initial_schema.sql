create extension if not exists pgcrypto;

create type public.film_format as enum (
  'feature film',
  'mid-length film',
  'episode',
  'short film'
);

create type public.visibility_status as enum (
  'public',
  'limited',
  'hidden',
  'removed'
);

create type public.submission_status as enum (
  'draft',
  'submitted',
  'accepted',
  'rejected'
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

create table public.creators (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  slug text not null unique,
  name text not null,
  headline text,
  bio text,
  location text,
  followers_count integer not null default 0,
  created_at timestamptz not null default now()
);

create sequence public.film_serial_seq start 1 increment 1 no cycle;

create table public.films (
  id uuid primary key default gen_random_uuid(),
  serial_number bigint not null unique default nextval('public.film_serial_seq'),
  creator_id uuid not null references public.creators(id) on delete cascade,
  slug text not null unique,
  title text not null,
  logline text,
  synopsis text,
  youtube_url text not null,
  runtime_minutes integer not null check (runtime_minutes > 0),
  release_year integer,
  format public.film_format not null,
  genre text not null,
  mood text,
  languages text[] not null default '{}',
  tools text[] not null default '{}',
  featured_weight integer not null default 0,
  visibility public.visibility_status not null default 'limited',
  discussion_count integer not null default 0,
  views_count integer not null default 0,
  saves_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index films_serial_number_idx on public.films(serial_number);
create index films_search_idx on public.films(title, genre, serial_number);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.collection_films (
  collection_id uuid not null references public.collections(id) on delete cascade,
  film_id uuid not null references public.films(id) on delete cascade,
  position integer not null default 0,
  primary key (collection_id, film_id)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.creators(id) on delete set null,
  youtube_url text not null,
  proposed_title text not null,
  runtime_minutes integer,
  format public.film_format,
  genre text,
  logline text,
  tools text[] not null default '{}',
  rights_confirmed boolean not null default false,
  ai_confirmed boolean not null default false,
  status public.submission_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.follows (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, creator_id)
);

create table public.saves (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  film_id uuid not null references public.films(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, film_id)
);

create table public.likes (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  film_id uuid not null references public.films(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, film_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  film_id uuid not null references public.films(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  film_id uuid references public.films(id) on delete cascade,
  submission_id uuid references public.submissions(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
