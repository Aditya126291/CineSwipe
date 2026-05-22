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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('movies_catalog')
    .select('id, title, media_type, poster_url, backdrop_url')
    .order('id');

  if (error) {
    console.error('Error fetching catalog:', error);
    process.exit(1);
  }

  console.log('--- ALL CATALOG ITEMS ---');
  for (const item of data) {
    console.log(`ID: ${item.id} | Title: ${item.title} | Type: ${item.media_type}`);
    console.log(`  Poster:   ${item.poster_url}`);
    console.log(`  Backdrop: ${item.backdrop_url}`);
  }
}

run();
