insert into public.creators (slug, name, headline, bio, location, followers_count)
values
  (
    'ai-trailer-cinema',
    'AI Trailer Cinema',
    'Feature-length AI spectacle built around survival, warfare, and mythic threat escalation.',
    'AI Trailer Cinema publishes full-length synthetic action films with big thumbnails, high-stakes setups, and clear commercial hooks.',
    'Global',
    28100
  ),
  (
    'epic-ai-films',
    'Epic AI Films',
    'Long-form AI genre cinema focused on worldbuilding, catastrophe, and high-stakes conflict.',
    'Epic AI Films leans into longer sci-fi and fantasy watches with explicit AI-native framing and strong serial potential.',
    'Global',
    33400
  ),
  (
    'bb-amazing-skills',
    'Bb Amazing Skills',
    'Adventure-driven AI feature films with survival stakes and broad-appeal spectacle.',
    'Bb Amazing Skills publishes long AI survival and exploration stories with clear hooks, lush poster frames, and accessible storytelling.',
    'Global',
    19800
  ),
  (
    'space-ai-cinema',
    'SpaceAICinema',
    'Mythic and primordial AI adventure cinema designed for full-screen immersion.',
    'SpaceAICinema focuses on longer synthetic fantasy-adventure films with creature design, exile arcs, and world-scale travel.',
    'Global',
    22100
  )
on conflict (slug) do nothing;

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
values
  (
    24,
    (select id from public.creators where slug = 'ai-trailer-cinema'),
    'zero-degree-freezing-war',
    'ZERO DEGREE: Freezing War',
    'A stranded black-ops survivor crosses a frozen war zone while rival factions close in around him.',
    'ZERO DEGREE is a 62-minute AI action-survival feature built for viewers who want a complete watch, not a tech demo. It leans into snowbound warfare, pursuit tension, and a clear studio-style hook.',
    'https://www.youtube.com/watch?v=qWkl4k5-hVQ',
    'qWkl4k5-hVQ',
    62,
    2026,
    'feature film',
    'War thriller',
    'glacial',
    array['English'],
    array['Kling', 'Runway', 'ElevenLabs'],
    98,
    'public',
    144,
    9600,
    1800,
    '2026-03-06T18:30:00Z'
  ),
  (
    25,
    (select id from public.creators where slug = 'epic-ai-films'),
    'horizon-2080-humanitys-last-hope',
    'HORIZON 2080: Humanity''s Last Hope',
    'A dying Earth sends its last colonists toward a disputed new world where survival may require invasion.',
    'HORIZON 2080 is a 57-minute AI-generated sci-fi feature with explicit long-form ambition: colony ships, planetary discovery, and conflict with a native civilization across a single continuous watch.',
    'https://www.youtube.com/watch?v=L1fiDe0movc',
    'L1fiDe0movc',
    57,
    2025,
    'feature film',
    'Sci-fi',
    'urgent',
    array['English'],
    array['Kling', 'Midjourney', 'ElevenLabs'],
    97,
    'public',
    236,
    268000,
    21400,
    '2026-03-06T12:00:00Z'
  ),
  (
    26,
    (select id from public.creators where slug = 'epic-ai-films'),
    'extinction-protocol',
    'EXTINCTION PROTOCOL',
    'Humanity races through a collapsing Earth as a brutal survival program becomes the only way off-world.',
    'EXTINCTION PROTOCOL pushes the synthetic blockbuster lane further with a full 61-minute runtime, horror pressure, and a cleaner event-movie setup than most AI-native uploads.',
    'https://www.youtube.com/watch?v=urRwoKtI8yE',
    'urRwoKtI8yE',
    61,
    2026,
    'feature film',
    'Sci-fi action horror',
    'apocalyptic',
    array['English'],
    array['Kling', 'Runway', 'ElevenLabs'],
    96,
    'public',
    188,
    103000,
    9300,
    '2026-03-05T20:00:00Z'
  ),
  (
    27,
    (select id from public.creators where slug = 'bb-amazing-skills'),
    'lost-in-the-amazon-survival',
    'Lost in the Amazon: SURVIVAL',
    'A group stranded in the Amazon fights terrain, predators, and each other to make it home.',
    'Lost in the Amazon is a 61-minute AI survival adventure with broader mainstream energy than the average catalog entry, giving Supaviewer a stronger action-adventure rail.',
    'https://www.youtube.com/watch?v=DphM3_ntgPA',
    'DphM3_ntgPA',
    61,
    2026,
    'feature film',
    'Adventure drama',
    'feral',
    array['English'],
    array['Kling', 'Runway', 'ElevenLabs'],
    92,
    'public',
    163,
    332000,
    11800,
    '2026-03-05T10:00:00Z'
  ),
  (
    28,
    (select id from public.creators where slug = 'space-ai-cinema'),
    'crestwalker',
    'CRESTWALKER',
    'An exiled outcast crosses a primordial world and discovers the mark she carries is not a curse but a crown.',
    'CRESTWALKER is a 61-minute AI adventure-fantasy with a real quest shape, creature-driven worldbuilding, and enough scale to fill both collection rails and long-watch recommendations.',
    'https://www.youtube.com/watch?v=D4GFGOAQWAg',
    'D4GFGOAQWAg',
    61,
    2026,
    'feature film',
    'Fantasy adventure',
    'mythic',
    array['English'],
    array['Kling', 'Midjourney', 'ElevenLabs'],
    95,
    'public',
    207,
    459000,
    26200,
    '2026-03-04T18:00:00Z'
  )
on conflict (serial_number) do nothing;

select setval(
  'public.film_serial_seq',
  greatest((select coalesce(max(serial_number), 0) from public.films), 1),
  true
);

insert into public.collection_films (collection_id, film_id, position)
values
  (
    (select id from public.collections where slug = 'festival-contenders'),
    (select id from public.films where serial_number = 24),
    12
  ),
  (
    (select id from public.collections where slug = 'festival-contenders'),
    (select id from public.films where serial_number = 25),
    13
  ),
  (
    (select id from public.collections where slug = 'festival-contenders'),
    (select id from public.films where serial_number = 26),
    14
  ),
  (
    (select id from public.collections where slug = 'festival-contenders'),
    (select id from public.films where serial_number = 28),
    15
  ),
  (
    (select id from public.collections where slug = 'midnight-surrealism'),
    (select id from public.films where serial_number = 25),
    9
  ),
  (
    (select id from public.collections where slug = 'midnight-surrealism'),
    (select id from public.films where serial_number = 28),
    10
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 24),
    21
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 25),
    22
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 26),
    23
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 27),
    24
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 28),
    25
  )
on conflict (collection_id, film_id) do nothing;
