alter table public.films
  add column if not exists availability_note text;
