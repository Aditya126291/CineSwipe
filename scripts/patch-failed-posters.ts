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

const PATCH_ITEMS = [
  {
    id: 157336,
    media_type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/1280px-Crab_Nebula.jpg'
  },
  {
    id: 256040,
    media_type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Baahubali_The_Beginning_poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Baahubali_cast.jpg'
  },
  {
    id: 350312,
    media_type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/en/9/93/Baahubali_2_The_Conclusion_poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/First_look_launch_of_Baahubali_2_%28cropped%29.jpg'
  },
  {
    id: 579974,
    media_type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/SS_Rajamouli%2C_Ram_Charan%2C_Alia_Bhatt%2C_N.T.Rama_Rao_Jr._At_The_RRR_Press_Meet_in_Chennai.jpg'
  },
  {
    id: 784606,
    media_type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/en/d/d0/K.G.F_Chapter_2.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Easwari_Rao%2C_Prashanth_Neel%2C_Yash%2C_Srinidhi_Shetty_Promote_KGF_Chapter_2_in_Chennai.jpg'
  },
  {
    id: 550,
    media_type: 'movie',
    poster: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Soap_Fight_Club.jpg'
  },
  {
    id: 114461,
    media_type: 'tv',
    poster: 'https://upload.wikimedia.org/wikipedia/en/a/a2/The_Mandalorian_Ahsoka_Tano_poster.jpeg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Ahsoka.svg'
  },
  {
    id: 92446,
    media_type: 'tv',
    poster: 'https://upload.wikimedia.org/wikipedia/en/1/1d/The_Family_Man_poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/en/a/aa/The_Family_Man_logo.webp'
  },
  {
    id: 2316,
    media_type: 'tv',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/The_Office_US_logo.svg/1280px-The_Office_US_logo.svg.png',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Dunder_Mifflin%2C_Inc.svg/1280px-Dunder_Mifflin%2C_Inc.svg.png'
  },
  {
    id: 80894,
    media_type: 'tv',
    poster: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Sacred_Games_Title.png',
    backdrop: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Sacred_Games_Title.png'
  },
  {
    id: 82068,
    media_type: 'tv',
    poster: 'https://upload.wikimedia.org/wikipedia/en/3/3c/Mirzapur_Amazon_original_poster.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/en/1/1a/Mirzapur_Logo.png'
  },
  {
    id: 98114,
    media_type: 'tv',
    poster: 'https://upload.wikimedia.org/wikipedia/en/a/ac/Panchayat_%28TV_series%29_logo.png',
    backdrop: 'https://upload.wikimedia.org/wikipedia/en/a/ac/Panchayat_%28TV_series%29_logo.png'
  },
  {
    id: 104770,
    media_type: 'tv',
    poster: 'https://upload.wikimedia.org/wikipedia/en/c/c8/Scam_1992_poster.png',
    backdrop: 'https://upload.wikimedia.org/wikipedia/en/c/c8/Scam_1992_poster.png'
  },
  {
    id: 93405,
    media_type: 'tv',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Squid_Game_2021_vector_logo_english.svg/960px-Squid_Game_2021_vector_logo_english.svg.png',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Squid_Game_2021_vector_logo_english.svg/960px-Squid_Game_2021_vector_logo_english.svg.png'
  }
];

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CineSwipeBot/1.0 (https://github.com/Aditya126291/CineSwipe; contact@cineswipe.com)'
      }
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
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
  console.log('=== Step 1: Scanning & Uploading Missing Assets ===');
  for (const item of PATCH_ITEMS) {
    console.log(`\nProcessing failed asset patch for: ${item.media_type} ${item.id}...`);

    let posterUrl = '';
    let backdropUrl = '';

    // Download Poster
    const posterExt = item.poster.endsWith('.svg') || item.poster.includes('.svg/') ? 'svg' : item.poster.includes('.png') ? 'png' : 'jpg';
    const posterFileName = `${item.media_type}-${item.id}.${posterExt}`;
    const posterMime = posterExt === 'svg' ? 'image/svg+xml' : posterExt === 'png' ? 'image/png' : 'image/jpeg';
    
    console.log(`Downloading poster from ${item.poster}...`);
    const posterBuffer = await downloadImage(item.poster);
    await delay(500);

    if (posterBuffer) {
      console.log(`Uploading poster ${posterFileName}...`);
      const res = await uploadToStorage(posterFileName, posterBuffer, posterMime);
      if (res) {
        posterUrl = res;
        console.log(`Poster SUCCESS: ${posterUrl}`);
      }
    } else {
      console.error(`Poster DOWNLOAD FAILED for ${item.id}`);
    }

    // Download Backdrop
    const backdropExt = item.backdrop.endsWith('.svg') || item.backdrop.includes('.svg/') ? 'svg' : item.backdrop.includes('.png') ? 'png' : 'jpg';
    const backdropFileName = `${item.media_type}-${item.id}-bg.${backdropExt}`;
    const backdropMime = backdropExt === 'svg' ? 'image/svg+xml' : backdropExt === 'png' ? 'image/png' : 'image/jpeg';

    console.log(`Downloading backdrop from ${item.backdrop}...`);
    const backdropBuffer = await downloadImage(item.backdrop);
    await delay(500);

    if (backdropBuffer) {
      console.log(`Uploading backdrop ${backdropFileName}...`);
      const res = await uploadToStorage(backdropFileName, backdropBuffer, backdropMime);
      if (res) {
        backdropUrl = res;
        console.log(`Backdrop SUCCESS: ${backdropUrl}`);
      }
    } else {
      console.error(`Backdrop DOWNLOAD FAILED for ${item.id}`);
    }

    if (posterUrl || backdropUrl) {
      const updates: Record<string, string> = {};
      if (posterUrl) updates.poster_url = posterUrl;
      if (backdropUrl) updates.backdrop_url = backdropUrl;

      // Also ensure if one is missing, fallback to the other
      if (!updates.poster_url && backdropUrl) updates.poster_url = backdropUrl;
      if (!updates.backdrop_url && posterUrl) updates.backdrop_url = posterUrl;

      console.log(`Updating database row for ID: ${item.id}...`);
      const { error: dbError } = await supabase
        .from('movies_catalog')
        .update(updates)
        .eq('id', item.id);

      if (dbError) {
        console.error(`DB Update error for ${item.id}:`, dbError.message);
      } else {
        console.log(`DB Update SUCCESS for ${item.id}`);
      }
    }
  }

  console.log('\n=== PATCH COMPLETED ===');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal Patch Error:', err);
  process.exit(1);
});
