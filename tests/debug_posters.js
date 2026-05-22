/**
 * Deep poster diagnostic — run: node tests/debug_posters.js
 * Requires dev server for proxy checks: npm run dev
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const BASE = process.env.DEBUG_BASE_URL || 'http://localhost:3000';
const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const hasTmdb = !!(process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY);

function resolvePosterUrl(raw) {
  if (!raw || !String(raw).trim()) return { resolved: null, reason: 'empty' };
  const value = String(raw).trim();
  if (value.includes('poster-placeholder')) return { resolved: null, reason: 'placeholder-token' };

  if (value.includes('image.tmdb.org')) {
    try {
      const parsed = new URL(value);
      const match = parsed.pathname.match(/\/t\/p\/([^/]+)(\/.*)/);
      if (match) {
        return {
          resolved: `${BASE}/api/proxy-image?path=${encodeURIComponent(match[2])}&size=${match[1]}`,
          reason: 'tmdb-full-url',
        };
      }
    } catch {
      return { resolved: null, reason: 'bad-tmdb-url' };
    }
  }

  if (value.startsWith('/api/proxy-image')) {
    return { resolved: value.startsWith('http') ? value : `${BASE}${value}`, reason: 'already-proxied' };
  }

  if (value.startsWith('http')) return { resolved: value, reason: 'external-http' };

  const p = value.startsWith('/') ? value : `/${value}`;
  if (!/^\/[a-zA-Z0-9_.\-/]+$/.test(p)) return { resolved: null, reason: 'invalid-path-chars' };
  return { resolved: `${BASE}/api/proxy-image?path=${encodeURIComponent(p)}&size=w500`, reason: 'tmdb-path' };
}

function headStatus(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? require('https') : http;
    const req = lib.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve(0));
    req.on('timeout', () => {
      req.destroy();
      resolve(0);
    });
    req.end();
  });
}

async function main() {
  console.log('=== Poster pipeline debug ===\n');
  console.log('TMDB key present:', hasTmdb, '(enrich is DISABLED in app without this)');
  console.log('Supabase present:', hasSupabase);
  console.log('Proxy base:', BASE, '\n');

  if (!hasSupabase) {
    console.log('No Supabase — app uses mock/TMDB only.');
    return;
  }

  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await sb.from('movies_catalog').select('id,title,poster_url,media_type').order('id');
  if (error) {
    console.error('DB error:', error.message);
    return;
  }

  let ok = 0;
  let bad = 0;
  const broken = [];

  for (const row of data) {
    const { resolved, reason } = resolvePosterUrl(row.poster_url);
    let status = 'SKIP';
    if (resolved) {
      const code = await headStatus(resolved);
      status = String(code);
      if (code === 200) ok++;
      else {
        bad++;
        broken.push({ id: row.id, title: row.title, reason, raw: (row.poster_url || '').slice(0, 60), resolved, status: code });
      }
    } else {
      bad++;
      broken.push({ id: row.id, title: row.title, reason, raw: row.poster_url, resolved: null, status: 'NO_URL' });
    }
  }

  console.log(`Total rows: ${data.length}`);
  console.log(`Proxy OK (200): ${ok}`);
  console.log(`Broken/missing: ${bad}\n`);

  if (broken.length) {
    console.log('--- Broken posters (fix with TMDB hydrate) ---');
    broken.forEach((b) => console.log(JSON.stringify(b)));
  }

  if (!hasTmdb && bad > 0) {
    console.log('\n>>> ROOT CAUSE: No TMDB API key — broken DB URLs cannot be auto-repaired.');
    console.log('>>> Add NEXT_PUBLIC_TMDB_API_KEY to .env.local and run: npm run catalog:hydrate');
  }
}

main().catch(console.error);
