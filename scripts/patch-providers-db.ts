import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local using path.resolve
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PROVIDERS_PATCH: Record<number, any[]> = {
  // --- MOVIES ---
  157336: [ // Interstellar
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0GP3U1E0P8QTR5VIM6A1L6A4GQ/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' }
  ],
  299534: [ // Avengers: Endgame
    { name: 'Disney+', link: 'https://www.hotstar.com/movies/avengers-endgame/1260010041', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-disney.svg' },
    { name: 'Hotstar', link: 'https://www.hotstar.com/movies/avengers-endgame/1260010041', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hotstar.svg' }
  ],
  19995: [ // Avatar
    { name: 'Disney+', link: 'https://www.hotstar.com/movies/avatar/1260014801', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-disney.svg' },
    { name: 'Hotstar', link: 'https://www.hotstar.com/movies/avatar/1260014801', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hotstar.svg' }
  ],
  550: [ // Fight Club
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0H9N7QG7Y3TN/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' }
  ],
  693134: [ // Dune: Part Two
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0K7SNXMEVAGP/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' },
    { name: 'HBO', link: 'https://www.jiocinema.com/movies/dune-part-two/3929452', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hbo.svg' }
  ],
  572802: [ // Aquaman and the Lost Kingdom
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0H09M7QG7Y3T/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' },
    { name: 'HBO', link: 'https://www.jiocinema.com/movies/aquaman-and-the-lost-kingdom/3895034', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hbo.svg' }
  ],
  256040: [ // Baahubali: The Beginning
    { name: 'Netflix', link: 'https://www.netflix.com/title/80204901', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-netflix.svg' },
    { name: 'Hotstar', link: 'https://www.hotstar.com/movies/baahubali-the-beginning-hindi/1770016089', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hotstar.svg' }
  ],
  350312: [ // Baahubali 2: The Conclusion
    { name: 'Netflix', link: 'https://www.netflix.com/title/80204902', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-netflix.svg' },
    { name: 'Hotstar', link: 'https://www.hotstar.com/movies/baahubali-2-the-conclusion-hindi/1770016091', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hotstar.svg' }
  ],
  579974: [ // RRR
    { name: 'Netflix', link: 'https://www.netflix.com/title/81476453', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-netflix.svg' },
    { name: 'Hotstar', link: 'https://www.hotstar.com/movies/rrr/1260098521', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hotstar.svg' }
  ],
  784606: [ // K.G.F: Chapter 2
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0PD51WY386M/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' }
  ],
  811656: [ // Pushpa: The Rise
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0H09M7QG7Y3T/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' }
  ],
  554600: [ // Uri: The Surgical Strike
    { name: 'ZEE5', link: 'https://www.zee5.com/movies/details/uri-the-surgical-strike/0-0-28564' }
  ],

  // --- TV SHOWS ---
  1396: [ // Breaking Bad
    { name: 'Netflix', link: 'https://www.netflix.com/title/70143825', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-netflix.svg' }
  ],
  1399: [ // Game of Thrones
    { name: 'HBO', link: 'https://www.jiocinema.com/show/game-of-thrones/3739269', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hbo.svg' }
  ],
  66732: [ // Stranger Things
    { name: 'Netflix', link: 'https://www.netflix.com/title/80057281', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-netflix.svg' }
  ],
  2316: [ // The Office
    { name: 'Netflix', link: 'https://www.netflix.com/title/70136120', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-netflix.svg' },
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0H9M7QG7Y3T/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' }
  ],
  1668: [ // Friends
    { name: 'Netflix', link: 'https://www.netflix.com/title/70153404', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-netflix.svg' }
  ],
  76479: [ // The Boys
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0K7SNXMEVAGP/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' }
  ],
  114461: [ // Ahsoka
    { name: 'Disney+', link: 'https://www.hotstar.com/shows/ahsoka/1260148560', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-disney.svg' },
    { name: 'Hotstar', link: 'https://www.hotstar.com/shows/ahsoka/1260148560', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hotstar.svg' }
  ],
  93405: [ // Squid Game
    { name: 'Netflix', link: 'https://www.netflix.com/title/81040344', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-netflix.svg' }
  ],
  82856: [ // The Mandalorian
    { name: 'Disney+', link: 'https://www.hotstar.com/shows/the-mandalorian/1260021071', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-disney.svg' },
    { name: 'Hotstar', link: 'https://www.hotstar.com/shows/the-mandalorian/1260021071', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hotstar.svg' }
  ],
  84958: [ // Loki
    { name: 'Disney+', link: 'https://www.hotstar.com/shows/loki/1260063462', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-disney.svg' },
    { name: 'Hotstar', link: 'https://www.hotstar.com/shows/loki/1260063462', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hotstar.svg' }
  ],
  82068: [ // Mirzapur
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0PD51WY386M/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' }
  ],
  92446: [ // The Family Man
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0H09M7QG7Y3T/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' }
  ],
  80894: [ // Sacred Games
    { name: 'Netflix', link: 'https://www.netflix.com/title/80115328', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-netflix.svg' }
  ],
  104770: [ // Scam 1992
    { name: 'SonyLIV', link: 'https://www.sonyliv.com/shows/scam-1992-the-harshad-mehta-story-1700000292' }
  ],
  98114: [ // Panchayat
    { name: 'Prime Video', link: 'https://www.primevideo.com/detail/0H9N7QG7Y3TN/', logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-prime.svg' }
  ]
};

async function run() {
  console.log('Starting providers database patch...');
  
  for (const [idStr, providers] of Object.entries(PROVIDERS_PATCH)) {
    const id = parseInt(idStr, 10);
    console.log(`Patching ID: ${id} with providers:`, providers.map(p => p.name));
    
    const { error } = await supabase
      .from('movies_catalog')
      .update({ providers })
      .eq('id', id);
      
    if (error) {
      console.error(`Failed to patch ID ${id}:`, error);
    } else {
      console.log(`Successfully patched ID ${id}`);
    }
  }
  
  console.log('Database providers successfully updated!');
}

run();
