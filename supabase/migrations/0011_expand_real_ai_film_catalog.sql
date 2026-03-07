insert into public.creators (slug, name, headline, bio, location, followers_count)
values
  (
    'foregone-films',
    'Foregone Films',
    'Long-form AI cautionary cinema about intelligence, power, and collapse.',
    'Foregone Films publishes longer AI-native speculative dramas with a polished, festival-minded tone.',
    'Global',
    12800
  ),
  (
    'epic-movies-ai',
    'Epic Movies AI',
    'Large-scale fantasy and siege cinema built with AI workflows.',
    'Epic Movies AI focuses on mythic battles, dark fantasy worlds, and serialized AI-native spectacle.',
    'Global',
    21400
  ),
  (
    'neovision',
    'NeoVision',
    'Near-future AI cinema about social change, technology, and everyday life.',
    'NeoVision leans into accessible, polished AI short films with clear world-building and strong thumbnail identity.',
    'Global',
    9400
  ),
  (
    'vijayakumar-anbalagan',
    'Vijayakumar Anbalagan',
    'Mythic AI filmmaking rooted in devotion, scale, and stylized action.',
    'Vijayakumar Anbalagan publishes AI films that blend mythic Indian imagery with synthetic cinematic spectacle.',
    'India',
    7300
  ),
  (
    'veoverse-ai',
    'VeoVerseAI',
    'Historic reimaginings and action-driven AI shorts built around Veo workflows.',
    'VeoVerseAI experiments with historical scenes, military tension, and cinematic promptcraft.',
    'Global',
    5200
  ),
  (
    'ai-director-dave-clark',
    'AI Director Dave Clark',
    'Premium AI shorts spanning sci-fi, noir, and studio-style concept execution.',
    'Dave Clark publishes some of the cleanest AI-native short films on YouTube, often centered on new model releases.',
    'Los Angeles',
    16700
  ),
  (
    'openai',
    'OpenAI',
    'Model-native short films and showcase pieces from the Sora ecosystem.',
    'OpenAI publishes benchmark creative work that demonstrates where native video generation is heading.',
    'San Francisco',
    500000
  ),
  (
    'gabe-michael',
    'Gabe Michael',
    'Fast, stylish AI suspense shorts with commercial polish.',
    'Gabe Michael focuses on compact AI-native story pieces, especially using Runway workflows and Gen:48 formats.',
    'Global',
    8700
  ),
  (
    'shawam-entertainment',
    'Shawam Entertainment',
    'Short-form AI mood films with polished Google Flow and Veo execution.',
    'Shawam Entertainment publishes tightly cut AI shorts designed around atmosphere and strong single-concept hooks.',
    'Global',
    6100
  ),
  (
    'runway',
    'Runway',
    'Official AI-native film showcases and benchmark narrative shorts.',
    'Runway publishes official films and experiments that often define the current ceiling of AI-native visual storytelling.',
    'New York',
    240000
  ),
  (
    'storybook-studios',
    'Storybook Studios',
    'Award-oriented AI short filmmaking with a lyrical tone.',
    'Storybook Studios leans into concise AI narratives with festival language and strong emotional framing.',
    'Global',
    6800
  ),
  (
    'alex-naghavi',
    'Alex Naghavi',
    'Precision-edited Gen:48 shorts with a premium commercial finish.',
    'Alex Naghavi creates compact AI shorts that feel highly art-directed and built for sharing.',
    'Global',
    4900
  ),
  (
    'dubcreation',
    'DubCreation',
    'Dark-comedy AI shorts with an effects-heavy digital look.',
    'DubCreation publishes stylized AI-generated shorts with horror-comedy energy and awards-circuit positioning.',
    'Global',
    4300
  ),
  (
    'james-muni-creations',
    'James Muni Creations',
    'Spiritual thriller storytelling rendered through AI-driven cinematic imagery.',
    'James Muni Creations builds devotional and supernatural AI films aimed at big emotional stakes.',
    'India',
    7600
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
    9,
    (select id from public.creators where slug = 'foregone-films'),
    'writing-doom',
    'Writing Doom',
    'An award-winning AI short about superintelligence, alignment failure, and the people left trying to explain it.',
    'Writing Doom plays like a polished long-form warning shot: interview fragments, speculative systems thinking, and near-future collapse stitched into a single AI-native watch session.',
    'https://www.youtube.com/watch?v=xfMQ7hzyFW4',
    27,
    2024,
    'feature film',
    'Sci-fi',
    'foreboding',
    array['English'],
    array['Runway', 'Sora', 'ElevenLabs'],
    99,
    'public',
    318,
    241000,
    28800,
    '2026-03-05T00:00:00Z'
  ),
  (
    10,
    (select id from public.creators where slug = 'epic-movies-ai'),
    'age-of-kingdoms-riverguard',
    'Age of Kingdoms: The Fall of Riverguard',
    'An AI fantasy war film where an orc invasion crushes the last line holding Riverguard together.',
    'This longer-form siege fantasy leans into castle warfare, massed armies, and high-contrast AI worldbuilding built for viewers who want scale over novelty.',
    'https://www.youtube.com/watch?v=gm1GXgivIEA',
    24,
    2026,
    'mid-length film',
    'Fantasy',
    'epic',
    array['English'],
    array['Kling', 'Runway', 'ElevenLabs'],
    96,
    'public',
    267,
    198000,
    22100,
    '2026-03-04T00:00:00Z'
  ),
  (
    11,
    (select id from public.creators where slug = 'neovision'),
    'life-in-2050',
    'Life in 2050',
    'A ten-minute AI cinematic imagining how ordinary life reshapes itself under future infrastructure and social systems.',
    'Life in 2050 is a compact future-society piece that works well as a catalog browse title because the premise is clear, the runtime is real, and the visuals are easy to pitch.',
    'https://www.youtube.com/watch?v=DK9sJyOIuPE',
    10,
    2025,
    'mid-length film',
    'Speculative drama',
    'reflective',
    array['English'],
    array['Veo', 'Runway'],
    89,
    'public',
    121,
    93000,
    8700,
    '2026-03-03T00:00:00Z'
  ),
  (
    12,
    (select id from public.creators where slug = 'vijayakumar-anbalagan'),
    'garuda-ai-film-2025',
    'Garuda',
    'A mythic AI short film that turns devotional iconography into stylized cinematic action.',
    'Garuda is a shorter but visually assertive AI film with a strong title, strong poster potential, and a clear mythic identity for the browse grid.',
    'https://www.youtube.com/watch?v=Zb_ZJzjIJ5I',
    7,
    2025,
    'short film',
    'Fantasy',
    'mythic',
    array['English'],
    array['Runway', 'Kling'],
    84,
    'public',
    96,
    74000,
    6200,
    '2026-03-02T00:00:00Z'
  ),
  (
    13,
    (select id from public.creators where slug = 'veoverse-ai'),
    'd-day-1944',
    'D-DAY 1944',
    'A war-themed AI short built with Google Veo and Kling, framed like a compressed historical film sequence.',
    'D-DAY 1944 is a compact historical-action entry that broadens the catalog beyond abstract sci-fi and fantasy toward event-driven cinematic AI video.',
    'https://www.youtube.com/watch?v=nU5i6AQx4a4',
    4,
    2025,
    'short film',
    'War drama',
    'tense',
    array['English'],
    array['Veo', 'Kling'],
    82,
    'public',
    87,
    68000,
    5900,
    '2026-03-01T12:00:00Z'
  ),
  (
    14,
    (select id from public.creators where slug = 'ai-director-dave-clark'),
    'my-very-first-sora-2-short-film',
    'My Very First Sora 2 Short Film',
    'A polished Sora 2 concept short that showcases native text-to-video cinematic control.',
    'This title works as a strong catalog proof-point for how creator-led Sora shorts can sit beside more polished studio work inside the same library.',
    'https://www.youtube.com/watch?v=JhH3uxcdM1M',
    3,
    2026,
    'short film',
    'Sci-fi',
    'slick',
    array['English'],
    array['Sora'],
    88,
    'public',
    104,
    81000,
    7100,
    '2026-03-01T06:00:00Z'
  ),
  (
    15,
    (select id from public.creators where slug = 'openai'),
    'critterz-remastered-with-sora',
    'CRITTERZ — Remastered with Sora',
    'An official Sora showcase short with a distinctive synthetic world and strong share appeal.',
    'CRITTERZ is exactly the kind of recognizable AI-native title that helps Supaviewer feel like a central catalog rather than a random embed directory.',
    'https://www.youtube.com/watch?v=qjuk0YCUdo8',
    5,
    2026,
    'short film',
    'Animation',
    'playful',
    array['English'],
    array['Sora'],
    95,
    'public',
    186,
    152000,
    18400,
    '2026-02-28T00:00:00Z'
  ),
  (
    16,
    (select id from public.creators where slug = 'gabe-michael'),
    'dont-push',
    'DON''T PUSH',
    'A compact suspense short built for Runway''s Gen:48 format with a clear hook and strong thumbnail energy.',
    'DON''T PUSH gives the catalog a shorter high-pressure suspense piece that still feels premium and intentional rather than disposable.',
    'https://www.youtube.com/watch?v=qPCfK_ZJg3A',
    3,
    2025,
    'short film',
    'Thriller',
    'urgent',
    array['English'],
    array['Runway'],
    83,
    'public',
    79,
    59000,
    5100,
    '2026-02-28T12:00:00Z'
  ),
  (
    17,
    (select id from public.creators where slug = 'shawam-entertainment'),
    'alone-flow-by-google',
    'Alone',
    'A minimalist Google Flow and Veo short that leans into isolation, mood, and clean execution.',
    'Alone is a useful catalog title because it is short, highly watchable, and broadens the mix of official-tool-generated aesthetics inside the browse shelves.',
    'https://www.youtube.com/watch?v=iwc1a6SIHEg',
    2,
    2025,
    'short film',
    'Mystery',
    'lonely',
    array['English'],
    array['Flow', 'Veo'],
    78,
    'public',
    62,
    47000,
    4200,
    '2026-02-27T18:00:00Z'
  ),
  (
    18,
    (select id from public.creators where slug = 'runway'),
    'morningstar-runway',
    'Morningstar',
    'An official Runway short that helps anchor the catalog with a recognizable platform-backed entry.',
    'Morningstar is a clean benchmark piece: short, polished, and useful as a familiar title that can be shared back into Supaviewer.',
    'https://www.youtube.com/watch?v=BwoCznxxMBw',
    2,
    2024,
    'short film',
    'Sci-fi',
    'stylized',
    array['English'],
    array['Runway'],
    90,
    'public',
    133,
    109000,
    12100,
    '2026-02-27T06:00:00Z'
  ),
  (
    19,
    (select id from public.creators where slug = 'epic-movies-ai'),
    'age-of-kingdoms-mont-saint-michel',
    'Age of Kingdoms: Mont-Saint-Michel',
    'A 35-minute AI siege fantasy built around an overwhelming orc assault on Mont-Saint-Michel.',
    'This is one of the strongest long-form additions for your current thesis because it is materially longer, clearly cinematic, and obviously meant to be watched rather than skimmed.',
    'https://www.youtube.com/watch?v=NV0qsPcz_p0',
    35,
    2026,
    'feature film',
    'Fantasy',
    'cataclysmic',
    array['English'],
    array['Kling', 'Runway', 'ElevenLabs'],
    97,
    'public',
    241,
    176000,
    20300,
    '2026-02-26T00:00:00Z'
  ),
  (
    20,
    (select id from public.creators where slug = 'storybook-studios'),
    'the-barrier',
    'The Barrier',
    'An award-winning AI short that gives the catalog another recognizable prestige marker.',
    'The Barrier strengthens the “curated AI cinema” angle because it reads like an awards-circuit short rather than a prompt experiment.',
    'https://www.youtube.com/watch?v=Bpwbtmmmb4I',
    5,
    2025,
    'short film',
    'Drama',
    'elegiac',
    array['English'],
    array['Runway', 'Midjourney'],
    91,
    'public',
    111,
    85000,
    9600,
    '2026-02-25T00:00:00Z'
  ),
  (
    21,
    (select id from public.creators where slug = 'alex-naghavi'),
    'feast',
    'Feast',
    'A Gen:48-winning AI short with a compact, highly shareable format.',
    'Feast is a strong social-discovery title because the runtime is tiny, the quality is high, and the award framing gives it immediate context inside the catalog.',
    'https://www.youtube.com/watch?v=yZefgqg2OU8',
    2,
    2025,
    'short film',
    'Dark fantasy',
    'intense',
    array['English'],
    array['Runway'],
    85,
    'public',
    68,
    52000,
    4900,
    '2026-02-24T00:00:00Z'
  ),
  (
    22,
    (select id from public.creators where slug = 'dubcreation'),
    'generating',
    'GENERATING...',
    'An AI-generated dark comedy with awards-circuit framing and a stronger auteur label than most demo shorts.',
    'GENERATING... adds tonal variety to the catalog and rounds out the shelf with something more comedic, eerie, and art-directed.',
    'https://www.youtube.com/watch?v=aFPBxb3-93I',
    4,
    2025,
    'short film',
    'Dark comedy',
    'offbeat',
    array['English'],
    array['Kling', 'Seedance'],
    80,
    'public',
    59,
    41000,
    3600,
    '2026-02-23T00:00:00Z'
  ),
  (
    23,
    (select id from public.creators where slug = 'james-muni-creations'),
    'pavanputra',
    'Pavanputra',
    'A spiritual thriller AI short with an explicitly Indian mythic identity.',
    'Pavanputra broadens the catalog geographically and tonally, giving Supaviewer a more international AI-cinema mix.',
    'https://www.youtube.com/watch?v=9M3sY2z52Y4',
    5,
    2025,
    'short film',
    'Spiritual thriller',
    'devotional',
    array['English'],
    array['Kling', 'Runway'],
    79,
    'public',
    54,
    39000,
    3400,
    '2026-02-22T00:00:00Z'
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
    (select id from public.films where serial_number = 9),
    6
  ),
  (
    (select id from public.collections where slug = 'festival-contenders'),
    (select id from public.films where serial_number = 10),
    7
  ),
  (
    (select id from public.collections where slug = 'festival-contenders'),
    (select id from public.films where serial_number = 15),
    8
  ),
  (
    (select id from public.collections where slug = 'festival-contenders'),
    (select id from public.films where serial_number = 19),
    9
  ),
  (
    (select id from public.collections where slug = 'festival-contenders'),
    (select id from public.films where serial_number = 20),
    10
  ),
  (
    (select id from public.collections where slug = 'festival-contenders'),
    (select id from public.films where serial_number = 21),
    11
  ),
  (
    (select id from public.collections where slug = 'midnight-surrealism'),
    (select id from public.films where serial_number = 11),
    4
  ),
  (
    (select id from public.collections where slug = 'midnight-surrealism'),
    (select id from public.films where serial_number = 14),
    5
  ),
  (
    (select id from public.collections where slug = 'midnight-surrealism'),
    (select id from public.films where serial_number = 16),
    6
  ),
  (
    (select id from public.collections where slug = 'midnight-surrealism'),
    (select id from public.films where serial_number = 17),
    7
  ),
  (
    (select id from public.collections where slug = 'midnight-surrealism'),
    (select id from public.films where serial_number = 22),
    8
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 9),
    6
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 10),
    7
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 11),
    8
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 12),
    9
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 13),
    10
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 14),
    11
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 15),
    12
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 16),
    13
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 17),
    14
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 18),
    15
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 19),
    16
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 20),
    17
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 21),
    18
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 22),
    19
  ),
  (
    (select id from public.collections where slug = 'first-100'),
    (select id from public.films where serial_number = 23),
    20
  )
on conflict (collection_id, film_id) do nothing;
