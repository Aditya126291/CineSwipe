import fs from 'fs';
import path from 'path';

interface Target {
  id: number;
  title: string;
  query: string;
}

const TARGETS: Target[] = [
  { id: 550, title: 'Fight Club', query: 'Fight Club Official Trailer Fox' },
  { id: 1399, title: 'Game of Thrones', query: 'Game of Thrones Official Series Trailer HBO' },
  { id: 1668, title: 'Friends', query: 'Friends Official Theme Song Intro' },
  { id: 2316, title: 'The Office', query: 'The Office US Theme Song Intro' },
  { id: 19995, title: 'Avatar', query: 'Avatar 2009 Official Trailer 20th Century Studios' },
  { id: 76479, title: 'The Boys', query: 'The Boys Season 1 Official Trailer Prime Video' },
  { id: 80894, title: 'Sacred Games', query: 'Sacred Games Season 1 Official Trailer Netflix' },
  { id: 84958, title: 'Loki', query: 'Loki Season 1 Official Trailer Disney Plus' },
  { id: 93405, title: 'Squid Game', query: 'Squid Game Season 1 Official Trailer Netflix' },
  { id: 98114, title: 'Panchayat', query: 'Panchayat Season 1 Official Trailer Prime Video' },
  { id: 104770, title: 'Scam 1992: The Harshad Mehta Story', query: 'Scam 1992 Theme Song Intro SonyLIV' },
  { id: 114461, title: 'Ahsoka', query: 'Ahsoka Season 1 Official Trailer Disney Plus' },
  { id: 157336, title: 'Interstellar', query: 'Interstellar Official Trailer Warner Bros' },
  { id: 256040, title: 'Baahubali: The Beginning', query: 'Baahubali The Beginning Official Trailer Hindi' },
  { id: 350312, title: 'Baahubali 2: The Conclusion', query: 'Baahubali 2 The Conclusion Official Trailer Hindi' },
  { id: 554600, title: 'Uri: The Surgical Strike', query: 'Uri The Surgical Strike Official Trailer RSVPMovies' },
  { id: 572802, title: 'Aquaman and the Lost Kingdom', query: 'Aquaman and the Lost Kingdom Official Trailer Warner Bros' },
  { id: 693134, title: 'Dune: Part Two', query: 'Dune Part Two Official Trailer Warner Bros' },
  { id: 784606, title: 'K.G.F: Chapter 2', query: 'KGF Chapter 2 Official Trailer Hindi Excel Movies' },
  { id: 811656, title: 'Pushpa: The Rise', query: 'Pushpa The Rise Official Trailer Hindi Goldmines' }
];

async function fetchCandidates(query: string): Promise<string[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = new Set<string>();
    
    // videoId match in JSON
    let match;
    const regex = /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g;
    while ((match = regex.exec(html)) !== null) {
      matches.add(match[1]);
    }
    
    // href watch match
    const watchRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    while ((match = watchRegex.exec(html)) !== null) {
      matches.add(match[1]);
    }
    
    return Array.from(matches);
  } catch (e: any) {
    console.error(`Error searching YouTube for query "${query}":`, e.message);
    return [];
  }
}

async function checkThumbnail(key: string): Promise<boolean> {
  const url = `https://i3.ytimg.com/vi/${key}/hqdefault.jpg`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function verifyEmbeddable(key: string): Promise<{ ok: boolean; title?: string }> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${key}`;
  try {
    const res = await fetch(url);
    if (res.status === 200) {
      const data = await res.json();
      return { ok: true, title: data.title };
    }
  } catch {}
  return { ok: false };
}

async function run() {
  console.log('=== CineSwipe Automagic Trailer Resolver ===');
  const results: Record<number, { title: string; key: string; ytTitle: string }> = {};
  
  for (const target of TARGETS) {
    console.log(`\nResolving "${target.title}" (ID: ${target.id})...`);
    const candidates = await fetchCandidates(target.query);
    console.log(`  Found ${candidates.length} candidates. Filtering and testing...`);
    
    let resolved = false;
    // Test the top 8 candidates politely
    for (const key of candidates.slice(0, 8)) {
      const hasThumb = await checkThumbnail(key);
      if (!hasThumb) continue;
      
      // Thumbnail exists, now do oEmbed check to verify full embedding clearance
      const embedCheck = await verifyEmbeddable(key);
      if (embedCheck.ok) {
        console.log(`  🎉 SUCCESS! Key: ${key} | Title: "${embedCheck.title}"`);
        results[target.id] = {
          title: target.title,
          key,
          ytTitle: embedCheck.title || 'Official Trailer'
        };
        resolved = true;
        break;
      }
      await new Promise(r => setTimeout(r, 200)); // polite delay
    }
    
    if (!resolved) {
      console.log(`  ❌ Failed to resolve any working key for "${target.title}"`);
    }
    
    await new Promise(r => setTimeout(r, 1500)); // polite delay between searches
  }
  
  console.log('\n======================================');
  console.log('=== RESOLVED TRAILER KEYS COMPLETE ===');
  console.log('======================================');
  console.log(JSON.stringify(results, null, 2));
  
  fs.writeFileSync(
    path.join(__dirname, 'resolved-trailers.json'),
    JSON.stringify(results, null, 2)
  );
  console.log(`Saved results to ${path.join(__dirname, 'resolved-trailers.json')}`);
}

run().catch(console.error);
