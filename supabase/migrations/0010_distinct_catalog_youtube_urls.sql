update public.films
set youtube_url = case serial_number
  when 1 then 'https://www.youtube.com/watch?v=yplb0yBEiRo'
  when 2 then 'https://www.youtube.com/watch?v=pD4q9zwWvRg'
  when 3 then 'https://www.youtube.com/watch?v=T37_nxS_qQw'
  when 4 then 'https://www.youtube.com/watch?v=ON_8eCuVtnA'
  when 5 then 'https://www.youtube.com/watch?v=pbBZCGBD01M'
  when 6 then 'https://www.youtube.com/watch?v=mEVl0NS0vu8'
  when 7 then 'https://www.youtube.com/watch?v=KKm5foh8mOw'
  when 8 then 'https://www.youtube.com/watch?v=hbeLlO2tPNg'
  else youtube_url
end
where serial_number between 1 and 8;
