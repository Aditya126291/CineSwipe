import fs from 'fs';
import path from 'path';

const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Squid_Game_2021_vector_logo_english.svg/960px-Squid_Game_2021_vector_logo_english.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/The_Office_US_logo.svg/1280px-The_Office_US_logo.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Dunder_Mifflin,_Inc.svg/1280px-Dunder_Mifflin,_Inc.svg.png',
  'https://upload.wikimedia.org/wikipedia/en/b/bf/Ahsoka_%28TV_series%29_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/a/a2/The_Mandalorian_Ahsoka_Tano_poster.jpeg',
  'https://upload.wikimedia.org/wikipedia/commons/a/aa/Ahsoka.svg',
  'https://upload.wikimedia.org/wikipedia/en/7/7a/Stranger_Things_soundtrack_album_cover.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/3/38/Stranger_Things_logo.png',
  'https://upload.wikimedia.org/wikipedia/en/7/75/Pushpa_-_The_Rise_%28film%29_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b3/Pushpa_The_Rise_film_logo.png',
  'https://upload.wikimedia.org/wikipedia/en/3/3b/URI_-_The_Surgical_Strike.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/ae/Uri_The_Surgical_Strike_Logo.png'
];

async function test() {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'CineSwipeBot/1.0 (https://github.com/Aditya126291/CineSwipe; contact@cineswipe.com)'
        }
      });
      console.log(`URL: ${url}`);
      console.log(`  Status: ${res.status} ${res.statusText}`);
      console.log(`  MIME:   ${res.headers.get('content-type')}`);
    } catch (e: any) {
      console.log(`URL: ${url} -> ERROR: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

test();
