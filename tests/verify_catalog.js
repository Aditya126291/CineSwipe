/**
 * Catalog pipeline smoke test (run: node tests/verify_catalog.js)
 * Requires .env.local with Supabase and/or TMDB keys for full pass.
 */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const hasTmdb = !!process.env.NEXT_PUBLIC_TMDB_API_KEY;

async function main() {
  console.log('=== CineSwipe catalog verification ===');
  console.log('Supabase configured:', hasSupabase);
  console.log('TMDB configured:', hasTmdb);

  if (hasSupabase) {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data, error, count } = await supabase
      .from('movies_catalog')
      .select('id,title,poster_url,media_type', { count: 'exact' })
      .range(0, 19);

    if (error) {
      console.error('FAIL: movies_catalog query:', error.message);
    } else {
      console.log(`OK: fetched ${data?.length || 0} rows (total ~${count})`);
      const missingPoster = (data || []).filter((r) => !r.poster_url);
      console.log(`Rows missing poster_url: ${missingPoster.length}`);
      if (missingPoster.length) {
        console.log('  Examples:', missingPoster.slice(0, 3).map((r) => r.title).join(', '));
      }
    }
  }

  if (hasTmdb) {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/98114?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
    );
    const json = await res.json();
    console.log('OK: TMDB Panchayat poster_path:', json.poster_path || '(none)');
  }

  console.log('Batch size constant: 20 (see hooks/useMovies CATALOG_BATCH_SIZE)');
  console.log('Swipe persist: lib/catalog/persist.ts upserts on each swipe when Supabase is on');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
