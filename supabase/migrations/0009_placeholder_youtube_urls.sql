update public.films
set youtube_url = 'https://www.youtube.com/watch?v=M7lc1UVf-VE'
where youtube_url in (
  'https://www.youtube.com/watch?v=1',
  'https://www.youtube.com/watch?v=7',
  'https://www.youtube.com/watch?v=12',
  'https://www.youtube.com/watch?v=18',
  'https://www.youtube.com/watch?v=24',
  'https://www.youtube.com/watch?v=31',
  'https://www.youtube.com/watch?v=42'
);
