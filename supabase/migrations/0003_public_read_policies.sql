alter table public.creators enable row level security;
alter table public.films enable row level security;
alter table public.collections enable row level security;
alter table public.collection_films enable row level security;

create policy "public can read creators"
on public.creators
for select
to anon, authenticated
using (true);

create policy "public can read public and limited films"
on public.films
for select
to anon, authenticated
using (visibility in ('public', 'limited'));

create policy "public can read collections"
on public.collections
for select
to anon, authenticated
using (true);

create policy "public can read collection films"
on public.collection_films
for select
to anon, authenticated
using (true);
