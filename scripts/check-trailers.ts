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

async function run() {
  const { data, error } = await supabase
    .from('movies_catalog')
    .select('id, title, media_type, trailer_key')
    .order('id');

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  console.log('--- ALL TRAILER KEYS ---');
  for (const item of data) {
    console.log(`ID: ${item.id} | Title: ${item.title} | Key: ${item.trailer_key}`);
  }
}

run();
