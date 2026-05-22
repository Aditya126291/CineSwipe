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

interface RepairItem {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster: string;
  backdrop: string;
}

const REPAIR_ITEMS: RepairItem[] = [
  {
    id: 93405,
    media_type: 'tv',
    title: 'Squid Game',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Squid_Game_2021_vector_logo_english.svg/960px-Squid_Game_2021_vector_logo_english.svg.png',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Squid_game_text.png'
  },
  {
    id: 2316,
    media_type: 'tv',
    title: 'The Office',
    poster: 'https://upload.wikimedia.org/wikipedia/en/8/80/The_Office_US_title_card.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Dunder_Mifflin%2C_Inc.svg/1280px-Dunder_Mifflin%2C_Inc.svg.png'
  },
  {
    id: 114461,
    media_type: 'tv',
    title: 'Ahsoka',
    poster: 'https://upload.wikimedia.org/wikipedia/en/b/bf/Ahsoka_%28TV_series%29_poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ahsoka_logo.png'
  },
  {
    id: 92446,
    media_type: 'tv',
    title: 'The Family Man',
    poster: 'https://upload.wikimedia.org/wikipedia/en/1/1d/The_Family_Man_poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/0/07/The_Family_Man_film_logo.png'
  },
  {
    id: 66732,
    media_type: 'tv',
    title: 'Stranger Things',
    poster: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Stranger_Things_soundtrack_album_cover.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Stranger_Things_logo.png'
  },
  {
    id: 811656,
    media_type: 'movie',
    title: 'Pushpa: The Rise',
    poster: 'https://upload.wikimedia.org/wikipedia/en/7/75/Pushpa_-_The_Rise_%28film%29_poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Pushpa_The_Rise_film_logo.png'
  },
  {
    id: 554600,
    media_type: 'movie',
    title: 'Uri: The Surgical Strike',
    poster: 'https://upload.wikimedia.org/wikipedia/en/3/3b/URI_-_The_Surgical_Strike.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Uri_The_Surgical_Strike_Logo.png'
  }
];

interface DownloadedImage {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

async function downloadImage(url: string): Promise<DownloadedImage | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CineSwipeBot/1.0'
      }
    });

    if (!res.ok) {
      throw new Error(`Fetch failed with status ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Map MIME type to correct file extension
    let ext = 'jpg';
    if (contentType.includes('image/png')) {
      ext = 'png';
    } else if (contentType.includes('image/gif')) {
      ext = 'gif';
    } else if (contentType.includes('image/svg+xml')) {
      ext = 'svg';
    } else if (contentType.includes('image/webp')) {
      ext = 'webp';
    } else if (contentType.includes('image/jpeg')) {
      ext = 'jpg';
    } else {
      // Fallback based on URL extension
      const urlWithoutQuery = url.split('?')[0];
      const match = urlWithoutQuery.match(/\.([a-zA-Z0-9]+)$/);
      if (match) {
        ext = match[1].toLowerCase();
      }
    }

    return { buffer, contentType, ext };
  } catch (err) {
    console.error(`Failed to download image from ${url}:`, err);
    return null;
  }
}

async function uploadToStorage(filePath: string, buffer: Buffer, contentType: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('posters')
    .upload(filePath, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error(`Upload error for ${filePath}:`, error);
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/posters/${filePath}`;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('=== Step 1: Repairing & Patches for Broken/MIME-mismatched Posters ===');
  for (const item of REPAIR_ITEMS) {
    console.log(`\n----------------------------------------`);
    console.log(`Processing: "${item.title}" (ID: ${item.id}, ${item.media_type})`);

    let posterUrl = '';
    let backdropUrl = '';

    // 1. Download & Upload Poster
    console.log(`Downloading poster from: ${item.poster}`);
    const posterData = await downloadImage(item.poster);
    await delay(600); // polite rate limit

    if (posterData) {
      const posterFileName = `${item.media_type}-${item.id}.${posterData.ext}`;
      console.log(`Poster downloaded successfully! MIME: ${posterData.contentType}, Ext: ${posterData.ext}`);
      console.log(`Uploading to Supabase Storage as: ${posterFileName}...`);
      const res = await uploadToStorage(posterFileName, posterData.buffer, posterData.contentType);
      if (res) {
        posterUrl = res;
        console.log(`Poster Upload SUCCESS: ${posterUrl}`);
      }
    } else {
      console.error(`Poster Download FAILED for "${item.title}"`);
    }

    // 2. Download & Upload Backdrop
    console.log(`Downloading backdrop from: ${item.backdrop}`);
    const backdropData = await downloadImage(item.backdrop);
    await delay(600); // polite rate limit

    if (backdropData) {
      const backdropFileName = `${item.media_type}-${item.id}-bg.${backdropData.ext}`;
      console.log(`Backdrop downloaded successfully! MIME: ${backdropData.contentType}, Ext: ${backdropData.ext}`);
      console.log(`Uploading to Supabase Storage as: ${backdropFileName}...`);
      const res = await uploadToStorage(backdropFileName, backdropData.buffer, backdropData.contentType);
      if (res) {
        backdropUrl = res;
        console.log(`Backdrop Upload SUCCESS: ${backdropUrl}`);
      }
    } else {
      console.error(`Backdrop Download FAILED for "${item.title}"`);
    }

    // 3. Update Database
    if (posterUrl || backdropUrl) {
      const updates: Record<string, string> = {};
      if (posterUrl) updates.poster_url = posterUrl;
      if (backdropUrl) updates.backdrop_url = backdropUrl;

      // Handle Fallbacks
      if (!updates.poster_url && backdropUrl) updates.poster_url = backdropUrl;
      if (!updates.backdrop_url && posterUrl) updates.backdrop_url = posterUrl;

      console.log(`Updating database fields in movies_catalog table for ID: ${item.id}...`);
      const { error: dbError } = await supabase
        .from('movies_catalog')
        .update(updates)
        .eq('id', item.id);

      if (dbError) {
        console.error(`DB Update failed for "${item.title}":`, dbError.message);
      } else {
        console.log(`DB Update SUCCESS for "${item.title}"!`);
      }
    }
  }

  console.log('\n=== REPAIR COMPLETED SUCCESSFULY ===');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
