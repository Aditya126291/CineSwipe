import fs from 'fs';
import path from 'path';

// Helper to check if a YouTube ID has a valid public thumbnail
async function checkThumbnail(key: string): Promise<boolean> {
  const url = `https://i3.ytimg.com/vi/${key}/hqdefault.jpg`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

// Search DuckDuckGo and find working keys
async function findWorkingKeys(title: string): Promise<string[]> {
  const queries = [
    `"${title}" official trailer`,
    `"${title}" trailer`,
    `"${title}" teaser`,
    `"${title}" theme song`,
    `"${title}" intro`
  ];
  
  const workingKeys: string[] = [];
  
  for (const q of queries) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q + ' site:youtube.com')}`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) continue;
      const html = await res.text();
      const decodedHtml = decodeURIComponent(html);
      
      // Match any YouTube watch URLs or embed URLs
      const watchMatches = decodedHtml.match(/v=([a-zA-Z0-9_-]{11})/g) || [];
      const embedMatches = decodedHtml.match(/\/embed\/([a-zA-Z0-9_-]{11})/g) || [];
      
      const candidates = new Set<string>();
      for (const m of watchMatches) candidates.add(m.split('=')[1]);
      for (const m of embedMatches) candidates.add(m.split('/')[2]);
      
      for (const key of candidates) {
        if (!key || key.length !== 11 || workingKeys.includes(key)) continue;
        const exists = await checkThumbnail(key);
        if (exists) {
          console.log(`  Found working key for "${title}": ${key} via query "${q}"`);
          workingKeys.push(key);
        }
        await new Promise(r => setTimeout(r, 50));
      }
    } catch (e: any) {
      console.error(`  Search error for "${title}" query "${q}":`, e.message);
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return workingKeys;
}

const BROKEN = [
  { id: 1399, title: 'Game of Thrones' },
  { id: 1668, title: 'Friends' },
  { id: 2316, title: 'The Office' },
  { id: 76479, title: 'The Boys' },
  { id: 80894, title: 'Sacred Games' },
  { id: 93405, title: 'Squid Game' },
  { id: 104770, title: 'Scam 1992: The Harshad Mehta Story' },
  { id: 114461, title: 'Ahsoka' },
  { id: 572802, title: 'Aquaman and the Lost Kingdom' },
  { id: 784606, title: 'K.G.F: Chapter 2' },
  { id: 811656, title: 'Pushpa: The Rise' }
];

async function run() {
  console.log('=== SEARCHING YOUTUBE KEYS VIA THUMBNAIL CDN ===');
  const results: Record<number, { title: string; keys: string[] }> = {};
  
  for (const item of BROKEN) {
    console.log(`Searching working keys for "${item.title}"...`);
    const keys = await findWorkingKeys(item.title);
    results[item.id] = { title: item.title, keys };
    console.log(`  Result for "${item.title}": ${keys.length} keys found. [${keys.join(', ')}]\n`);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('=== FINAL DISCOVERED KEYS ===');
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
