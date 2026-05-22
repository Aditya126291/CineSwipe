// Using native global fetch

async function searchYouTubeKey(title: string): Promise<string | null> {
  const query = `${title} Official Trailer site:youtube.com`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    
    // Find all YouTube watch URLs in the HTML
    // DuckDuckGo links are often /l/?kh=-1&uddg=https://www.youtube.com/watch?v=...
    const matches = html.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g);
    if (matches && matches.length > 0) {
      // Return the first distinct key
      for (const match of matches) {
        const key = match.split('v=')[1];
        if (key && key.length === 11) {
          // Verify with oEmbed
          const embedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${key}`;
          const verifyRes = await fetch(embedUrl);
          if (verifyRes.status === 200) {
            return key;
          }
        }
      }
    }
  } catch (e: any) {
    console.error(`Search error for ${title}:`, e.message);
  }
  return null;
}

const BROKEN = [
  { id: 550, title: 'Fight Club' },
  { id: 1399, title: 'Game of Thrones' },
  { id: 1668, title: 'Friends' },
  { id: 2316, title: 'The Office' },
  { id: 19995, title: 'Avatar' },
  { id: 76479, title: 'The Boys' },
  { id: 80894, title: 'Sacred Games' },
  { id: 84958, title: 'Loki' },
  { id: 93405, title: 'Squid Game' },
  { id: 98114, title: 'Panchayat' },
  { id: 104770, title: 'Scam 1992: The Harshad Mehta Story' },
  { id: 114461, title: 'Ahsoka' },
  { id: 157336, title: 'Interstellar' },
  { id: 256040, title: 'Baahubali: The Beginning' },
  { id: 350312, title: 'Baahubali 2: The Conclusion' },
  { id: 554600, title: 'Uri: The Surgical Strike' },
  { id: 572802, title: 'Aquaman and the Lost Kingdom' },
  { id: 693134, title: 'Dune: Part Two' },
  { id: 784606, title: 'K.G.F: Chapter 2' },
  { id: 811656, title: 'Pushpa: The Rise' }
];

async function run() {
  console.log('Searching and validating correct YouTube trailer keys for 20 broken movies...');
  const results: Record<number, string> = {};
  
  for (const movie of BROKEN) {
    console.log(`Searching for "${movie.title}"...`);
    const key = await searchYouTubeKey(movie.title);
    if (key) {
      console.log(`  Found working key: ${key}`);
      results[movie.id] = key;
    } else {
      console.log(`  Could not find any working key for "${movie.title}" via DuckDuckGo search.`);
    }
    await new Promise(r => setTimeout(r, 1000)); // Be polite to DuckDuckGo and YouTube
  }
  
  console.log('\n--- FINAL WORKING KEYS MAP ---');
  console.log(JSON.stringify(results, null, 2));
}

run();
