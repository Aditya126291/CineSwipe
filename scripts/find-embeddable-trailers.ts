// Using native global fetch

async function findEmbeddableKey(title: string): Promise<string | null> {
  const queries = [
    `"${title}" official trailer`,
    `"${title}" trailer ign`,
    `"${title}" trailer rotten tomatoes`,
    `"${title}" series trailer`
  ];
  
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
      
      // Parse out video IDs: look for v=XXXXXXXXXXX in hrefs
      // DDG encodes URLs like /l/?kh=-1&uddg=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DXXXXXXXXXXX
      const decodedHtml = decodeURIComponent(html);
      const matches = decodedHtml.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g);
      
      if (matches) {
        const uniqueKeys = Array.from(new Set(matches.map(m => m.split('v=')[1])));
        
        for (const key of uniqueKeys) {
          if (!key || key.length !== 11) continue;
          
          const embedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${key}`;
          try {
            const verifyRes = await fetch(embedUrl);
            if (verifyRes.status === 200) {
              const metadata: any = await verifyRes.json();
              console.log(`  Found Working Embeddable Key for "${title}": ${key} ("${metadata.title}")`);
              return key;
            }
          } catch (e) {}
          await new Promise(r => setTimeout(r, 50));
        }
      }
    } catch (e: any) {
      console.error(`  Search error for "${title}" query "${q}":`, e.message);
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return null;
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
  console.log('--- FINDING EMBEDDABLE TRAILERS ---');
  const results: Record<number, string> = {};
  
  for (const item of BROKEN) {
    console.log(`Finding embeddable key for "${item.title}"...`);
    const key = await findEmbeddableKey(item.title);
    if (key) {
      results[item.id] = key;
    } else {
      console.log(`  ❌ Failed to find any working, embeddable key for "${item.title}"`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n--- FINAL VERIFIED KEY MAP ---');
  console.log(JSON.stringify(results, null, 2));
}

run();
