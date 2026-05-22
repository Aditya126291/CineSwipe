import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const localEnvPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(localEnvPath)) {
  fs.readFileSync(localEnvPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase
    .from('movies_catalog')
    .select('*')
    .eq('id', 93405)
    .single();

  if (error) {
    console.error('DB Error:', error);
    return;
  }

  console.log('Squid Game Catalog Row:');
  console.log(JSON.stringify(data, null, 2));

  for (const urlKey of ['poster_url', 'backdrop_url'] as const) {
    const url = data[urlKey];
    console.log(`\nFetching ${urlKey}: ${url}`);
    try {
      const res = await fetch(url);
      console.log(`  Status: ${res.status} ${res.statusText}`);
      console.log(`  Headers Content-Type: ${res.headers.get('content-type')}`);
      console.log(`  Headers Content-Length: ${res.headers.get('content-length')}`);
      const buf = await res.arrayBuffer();
      console.log(`  Downloaded bytes: ${buf.byteLength}`);
      const uint8 = new Uint8Array(buf.slice(0, 16));
      const hex = Array.from(uint8).map(b => b.toString(16).padStart(2, '0')).join(' ');
      console.log(`  Hex signature: ${hex}`);
    } catch (e: any) {
      console.error(`  Fetch error: ${e.message}`);
    }
  }
}

check();
