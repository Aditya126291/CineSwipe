/**
 * One-time repair: fix all movies_catalog poster_url values from TMDB.
 * Usage: npm run catalog:hydrate
 * Requires: NEXT_PUBLIC_TMDB_API_KEY (or TMDB_API_KEY) + Supabase env in .env.local
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

const TMDB_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE = process.env.DEBUG_BASE_URL || 'http://localhost:3000';

async function main() {
  if (!TMDB_KEY) {
    console.error('ERROR: Set NEXT_PUBLIC_TMDB_API_KEY in .env.local');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await sb.from('movies_catalog').select('id, title, media_type');
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Hydrating ${data.length} catalog rows via ${BASE}/api/catalog/hydrate ...`);

  const res = await fetch(`${BASE}/api/catalog/hydrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persist: true,
      items: data.map((r) => ({ id: r.id, mediaType: r.media_type, title: r.title })),
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('Hydrate failed:', json);
    process.exit(1);
  }

  console.log(`Repaired: ${json.repaired}, Failed: ${json.failed}`);
  json.results?.filter((r) => !r.ok).forEach((r) => console.log('  FAIL', r));

  console.log('\nRe-run: node tests/debug_posters.js');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
