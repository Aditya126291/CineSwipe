import fs from 'fs';
import path from 'path';

async function testQuery(query: string): Promise<string[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) {
      console.log(`Fetch YouTube failed with status ${res.status}`);
      return [];
    }
    const html = await res.text();
    
    // Find all watch?v= matches
    const regex = /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(html)) !== null) {
      matches.add(match[1]);
    }
    
    // Also try matching standard watch links just in case
    const watchRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    while ((match = watchRegex.exec(html)) !== null) {
      matches.add(match[1]);
    }
    
    const candidates = Array.from(matches);
    console.log(`Query "${query}" found ${candidates.length} unique video IDs.`);
    return candidates;
  } catch (e: any) {
    console.error(`Error querying YouTube:`, e.message);
    return [];
  }
}

async function verifyKey(key: string): Promise<boolean> {
  const url = `https://i3.ytimg.com/vi/${key}/hqdefault.jpg`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function run() {
  const query = 'Game of Thrones Official Trailer HBO';
  const candidates = await testQuery(query);
  
  console.log('Verifying candidates against Thumbnail CDN...');
  for (const key of candidates.slice(0, 15)) {
    const ok = await verifyKey(key);
    console.log(`  Key: ${key} -> Valid Thumbnail: ${ok ? 'YES' : 'NO'}`);
  }
}

run();
