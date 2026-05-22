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
    .select('id, title, trailer_key')
    .order('id');

  if (error) {
    console.error('Error fetching catalog:', error);
    return;
  }

  // We only care about the base 27 catalog items (where ID < 1000000)
  const baseItems = data.filter(item => item.id < 1000000);

  console.log(`Checking ${baseItems.length} base items...`);

  for (const item of baseItems) {
    if (!item.trailer_key) {
      console.log(`❌ ID: ${item.id} | Title: ${item.title} | Key: Missing`);
      continue;
    }

    const embedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${item.trailer_key}`;
    try {
      const res = await fetch(embedUrl);
      if (res.status === 200) {
        const metadata = await res.json();
        console.log(`✅ ID: ${item.id} | Title: ${item.title} | Key: ${item.trailer_key} | YT Title: "${metadata.title}"`);
      } else {
        console.log(`❌ ID: ${item.id} | Title: ${item.title} | Key: ${item.trailer_key} | Status: ${res.status} ${res.statusText}`);
      }
    } catch (e: any) {
      console.log(`❌ ID: ${item.id} | Title: ${item.title} | Key: ${item.trailer_key} | Fetch Error: ${e.message}`);
    }
    // Rate limit politely
    await new Promise(r => setTimeout(r, 200));
  }
}

run();
