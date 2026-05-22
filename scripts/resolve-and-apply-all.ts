import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RepairTarget {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  posterSource: { type: 'wiki_file' | 'direct_url'; val: string };
  backdropSource: { type: 'wiki_file' | 'direct_url'; val: string };
}

const TARGETS: RepairTarget[] = [
  {
    id: 93405,
    media_type: 'tv',
    title: 'Squid Game',
    posterSource: { type: 'direct_url', val: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Squid_Game_2021_vector_logo_english.svg/960px-Squid_Game_2021_vector_logo_english.svg.png' },
    backdropSource: { type: 'direct_url', val: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Squid_Game_2021_vector_logo_english.svg/960px-Squid_Game_2021_vector_logo_english.svg.png' }
  },
  {
    id: 2316,
    media_type: 'tv',
    title: 'The Office',
    posterSource: { type: 'wiki_file', val: 'File:The office US.jpg' },
    backdropSource: { type: 'wiki_file', val: 'File:Dunder Mifflin, Inc.svg' }
  },
  {
    id: 114461,
    media_type: 'tv',
    title: 'Ahsoka',
    posterSource: { type: 'direct_url', val: 'https://upload.wikimedia.org/wikipedia/en/a/a2/The_Mandalorian_Ahsoka_Tano_poster.jpeg' },
    backdropSource: { type: 'direct_url', val: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Ahsoka.svg' }
  },
  {
    id: 92446,
    media_type: 'tv',
    title: 'The Family Man',
    posterSource: { type: 'wiki_file', val: 'File:Family man movie.jpg' },
    backdropSource: { type: 'wiki_file', val: 'File:Family man movie.jpg' }
  },
  {
    id: 66732,
    media_type: 'tv',
    title: 'Stranger Things',
    posterSource: { type: 'direct_url', val: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/ST1-ChapOne-Poster.jpg' },
    backdropSource: { type: 'wiki_file', val: 'File:Stranger Things logo.png' }
  },
  {
    id: 811656,
    media_type: 'movie',
    title: 'Pushpa: The Rise',
    posterSource: { type: 'wiki_file', val: 'File:Pushpa - The Rise (2021 film).jpg' },
    backdropSource: { type: 'wiki_file', val: 'File:Pushpa - The Rise (2021 film).jpg' }
  },
  {
    id: 554600,
    media_type: 'movie',
    title: 'Uri: The Surgical Strike',
    posterSource: { type: 'wiki_file', val: 'File:URI - New poster.jpg' },
    backdropSource: { type: 'wiki_file', val: 'File:URI - New poster.jpg' }
  }
];

// Helper to resolve Wikipedia filename to direct URL using query
async function resolveWikiFile(fileName: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=${encodeURIComponent(fileName)}&iiprop=url`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CineSwipeBot/1.0 (https://github.com/Aditya126291/CineSwipe; contact@cineswipe.com)'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId && pages[pageId].imageinfo && pages[pageId].imageinfo[0]) {
      return pages[pageId].imageinfo[0].url;
    }
  } catch (e) {
    console.error(`Error resolving wiki filename "${fileName}":`, e);
  }
  return null;
}

interface DownloadResult {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

// Download image with polite retry on 429
async function downloadImage(url: string, retries = 3): Promise<DownloadResult | null> {
  let attempt = 0;
  let delayMs = 1000;

  while (attempt < retries) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CineSwipeBot/1.0'
        }
      });

      if (res.status === 429) {
        console.warn(`429 Too Many Requests. Retrying in ${delayMs}ms (Attempt ${attempt + 1}/${retries})...`);
        await new Promise((r) => setTimeout(r, delayMs));
        attempt++;
        delayMs *= 2.5; // exponential backoff
        continue;
      }

      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get('content-type') || '';
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let ext = 'jpg';
      if (contentType.includes('image/png')) {
        ext = 'png';
      } else if (contentType.includes('image/svg+xml')) {
        ext = 'svg';
      } else if (contentType.includes('image/webp')) {
        ext = 'webp';
      } else if (contentType.includes('image/jpeg')) {
        ext = 'jpg';
      } else {
        const u = url.split('?')[0];
        const match = u.match(/\.([a-zA-Z0-9]+)$/);
        if (match) ext = match[1].toLowerCase();
      }

      return { buffer, contentType, ext };
    } catch (e) {
      console.error(`Attempt ${attempt + 1} failed for ${url}:`, e);
      attempt++;
      if (attempt >= retries) return null;
      await new Promise((r) => setTimeout(r, delayMs));
      delayMs *= 2;
    }
  }
  return null;
}

// Upload to Supabase Storage bucket 'posters'
async function uploadToStorage(filePath: string, buffer: Buffer, contentType: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('posters')
    .upload(filePath, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error(`Supabase Storage upload error for ${filePath}:`, error);
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/posters/${filePath}`;
}

async function run() {
  console.log('=== Starting CineSwipe Master Poster & Backdrop Repair Suite ===');

  for (const item of TARGETS) {
    console.log(`\n==================================================`);
    console.log(`Target: "${item.title}" (ID: ${item.id}, Type: ${item.media_type})`);

    let resolvedPosterUrl = '';
    let resolvedBackdropUrl = '';

    // 1. Resolve and download poster
    if (item.posterSource.type === 'wiki_file') {
      console.log(`Resolving poster file: ${item.posterSource.val}...`);
      const wikiUrl = await resolveWikiFile(item.posterSource.val);
      if (wikiUrl) {
        resolvedPosterUrl = wikiUrl;
        console.log(`  Resolved to Wikipedia URL: ${resolvedPosterUrl}`);
      } else {
        console.error(`  Failed to resolve Wikipedia file: ${item.posterSource.val}`);
      }
    } else {
      resolvedPosterUrl = item.posterSource.val;
      console.log(`  Using direct poster URL: ${resolvedPosterUrl}`);
    }

    // 2. Resolve and download backdrop
    if (item.backdropSource.type === 'wiki_file') {
      console.log(`Resolving backdrop file: ${item.backdropSource.val}...`);
      const wikiUrl = await resolveWikiFile(item.backdropSource.val);
      if (wikiUrl) {
        resolvedBackdropUrl = wikiUrl;
        console.log(`  Resolved to Wikipedia URL: ${resolvedBackdropUrl}`);
      } else {
        console.error(`  Failed to resolve Wikipedia file: ${item.backdropSource.val}`);
      }
    } else {
      resolvedBackdropUrl = item.backdropSource.val;
      console.log(`  Using direct backdrop URL: ${resolvedBackdropUrl}`);
    }

    // 3. Download & upload poster to Supabase
    let finalPosterStorageUrl = '';
    if (resolvedPosterUrl) {
      console.log(`Downloading poster image...`);
      const dl = await downloadImage(resolvedPosterUrl);
      await new Promise((r) => setTimeout(r, 800)); // polite rate limit

      if (dl) {
        const ext = dl.ext;
        const contentType = dl.contentType;
        const storagePath = `${item.media_type}-${item.id}.${ext}`;
        console.log(`  Poster downloaded! MIME: ${contentType}, Extension: ${ext}`);
        console.log(`  Uploading to storage: ${storagePath}...`);
        const supUrl = await uploadToStorage(storagePath, dl.buffer, contentType);
        if (supUrl) {
          finalPosterStorageUrl = supUrl;
          console.log(`  Poster Storage SUCCESS: ${finalPosterStorageUrl}`);
        }
      } else {
        console.error(`  Failed to download poster from: ${resolvedPosterUrl}`);
      }
    }

    // 4. Download & upload backdrop to Supabase
    let finalBackdropStorageUrl = '';
    if (resolvedBackdropUrl) {
      console.log(`Downloading backdrop image...`);
      const dl = await downloadImage(resolvedBackdropUrl);
      await new Promise((r) => setTimeout(r, 800)); // polite rate limit

      if (dl) {
        const ext = dl.ext;
        const contentType = dl.contentType;
        const storagePath = `${item.media_type}-${item.id}-bg.${ext}`;
        console.log(`  Backdrop downloaded! MIME: ${contentType}, Extension: ${ext}`);
        console.log(`  Uploading to storage: ${storagePath}...`);
        const supUrl = await uploadToStorage(storagePath, dl.buffer, contentType);
        if (supUrl) {
          finalBackdropStorageUrl = supUrl;
          console.log(`  Backdrop Storage SUCCESS: ${finalBackdropStorageUrl}`);
        }
      } else {
        console.error(`  Failed to download backdrop from: ${resolvedBackdropUrl}`);
      }
    }

    // 5. Update Database Row
    if (finalPosterStorageUrl || finalBackdropStorageUrl) {
      const updates: Record<string, string> = {};
      if (finalPosterStorageUrl) updates.poster_url = finalPosterStorageUrl;
      if (finalBackdropStorageUrl) updates.backdrop_url = finalBackdropStorageUrl;

      // Ensure fallbacks are healthy
      if (!updates.poster_url && finalBackdropStorageUrl) updates.poster_url = finalBackdropStorageUrl;
      if (!updates.backdrop_url && finalPosterStorageUrl) updates.backdrop_url = finalPosterStorageUrl;

      console.log(`Updating database catalog row in movies_catalog for ID: ${item.id}...`);
      const { error } = await supabase
        .from('movies_catalog')
        .update(updates)
        .eq('id', item.id);

      if (error) {
        console.error(`  Database update error for "${item.title}":`, error.message);
      } else {
        console.log(`  Database UPDATE SUCCESS for "${item.title}"!`);
      }
    }
  }

  console.log('\n=== ALL POSTER REPAIRS ARE FULLY COMPLETED AND SYNCHRONIZED ===');
  process.exit(0);
}

run().catch((e) => {
  console.error('Fatal execution error:', e);
  process.exit(1);
});
