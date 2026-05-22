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

async function run() {
  const resolvedPath = path.join(__dirname, 'resolved-trailers.json');
  if (!fs.existsSync(resolvedPath)) {
    console.error(`ERROR: File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  console.log(`Loaded ${Object.keys(data).length} resolved trailer keys. Commencing DB Patch...`);

  for (const [idStr, info] of Object.entries(data)) {
    const id = parseInt(idStr, 10);
    const { key, title, ytTitle } = info as any;

    console.log(`Updating ID: ${id} | Title: "${title}" -> Key: ${key} ("${ytTitle}")`);
    const { error } = await supabase
      .from('movies_catalog')
      .update({ trailer_key: key })
      .eq('id', id);

    if (error) {
      console.error(`  ❌ Database update error for ID ${id}:`, error.message);
    } else {
      console.log(`  ✅ Database update SUCCESS!`);
    }
  }

  console.log('\n=== ALL DB TRAILER PATCHES COMPLETED AND SYNCHRONIZED ===');
}

run().catch(console.error);
