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

// Define provider logos to download & self-host
const PROVIDER_LOGOS = [
  { name: 'netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { name: 'prime', url: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg' },
  { name: 'disney', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg' },
  { name: 'hotstar', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Hotstar_logo.svg' },
  { name: 'hbo', url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg' }
];

// All 27 Movies and TV Series with stable Wikimedia/public fallback URLs
const CATALOG_ITEMS = [
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    rating: 8.4,
    vote_count: 34521,
    media_type: 'movie',
    release_year: '2014',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Crab_Nebula.jpg',
    genres: [878, 18],
    trailer_key: 'zSWdZVtXT7U',
    providers: [{ name: 'Prime Video', link: 'https://www.amazon.in/gp/video/detail/B00T568B38/?tag=cineswipe-21', logo_name: 'prime' }]
  },
  {
    id: 299534,
    title: 'Avengers: Endgame',
    overview: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions and restore balance to the universe.',
    rating: 8.3,
    vote_count: 24500,
    media_type: 'movie',
    release_year: '2019',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Endgame_San_Diego_Comic-Con_2019.jpg',
    genres: [28, 12, 878],
    trailer_key: 'TcMBFSGVi1c',
    providers: [
      { name: 'Disney+', link: 'https://www.hotstar.com/in/movies/avengers-endgame/1260010041', logo_name: 'disney' },
      { name: 'Hotstar', link: 'https://www.hotstar.com/in/movies/avengers-endgame/1260010041', logo_name: 'hotstar' }
    ]
  },
  {
    id: 19995,
    title: 'Avatar',
    overview: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following his orders and protecting the world he feels is his home.',
    rating: 7.9,
    vote_count: 31000,
    media_type: 'movie',
    release_year: '2009',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/d/d6/Avatar_%282009_film%29_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Moraine_Lake_17092005.jpg',
    genres: [28, 12, 14, 878],
    trailer_key: '5PSNL1q36VY',
    providers: [
      { name: 'Disney+', link: 'https://www.hotstar.com/in/movies/avatar/1260014801', logo_name: 'disney' },
      { name: 'Hotstar', link: 'https://www.hotstar.com/in/movies/avatar/1260014801', logo_name: 'hotstar' }
    ]
  },
  {
    id: 550,
    title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel male deviance into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.',
    rating: 8.4,
    vote_count: 28034,
    media_type: 'movie',
    release_year: '1999',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Soap_Fight_Club.jpg',
    genres: [18, 53],
    trailer_key: 'qtRydYf7V54',
    providers: [{ name: 'Prime Video', link: 'https://www.amazon.in/gp/video/detail/B08XLPZ4H3/?tag=cineswipe-21', logo_name: 'prime' }]
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    rating: 8.2,
    vote_count: 8100,
    media_type: 'movie',
    release_year: '2024',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Dune_Part_Two_Logo.png',
    genres: [878, 12],
    trailer_key: 'Way9DexNy3w',
    providers: [{ name: 'Prime Video', link: 'https://www.amazon.in/gp/video/detail/B0CV5V9H18/?tag=cineswipe-21', logo_name: 'prime' }]
  },
  {
    id: 572802,
    title: 'Aquaman and the Lost Kingdom',
    overview: 'Black Manta, still driven by a need to avenge his father\'s death and wielding the power of the mythic Black Trident, will stop at nothing to take Aquaman down once and for all. To defeat him, Aquaman must turn to his imprisoned brother Orm, the former King of Atlantis, to forge an unlikely alliance.',
    rating: 6.3,
    vote_count: 3800,
    media_type: 'movie',
    release_year: '2023',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/1/1b/Aquaman_and_the_Lost_Kingdom_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Aquaman_and_the_Lost_Kingdom_San_Diego_Comic-Con_2023.jpg',
    genres: [28, 14],
    trailer_key: 'UGc5TLO6Q90',
    providers: [{ name: 'Prime Video', link: 'https://www.amazon.in/gp/video/detail/B0CQCQRDF4/?tag=cineswipe-21', logo_name: 'prime' }]
  },
  {
    id: 256040,
    title: 'Baahubali: The Beginning',
    overview: 'A child from the Mahishmati kingdom is raised by tribal people and grows up to be a strong, adventurous man. He falls in love with a warrior rebel girl, and in trying to win her heart, sneaks into the kingdom and discovers his true royal heritage.',
    rating: 7.5,
    vote_count: 5000,
    media_type: 'movie',
    release_year: '2015',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/d/d1/Baahubali_The_Beginning_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Baahubali_film_logo.png',
    genres: [28, 18],
    trailer_key: 'sOEg_QqMAC0',
    providers: [
      { name: 'Hotstar', link: 'https://www.hotstar.com/in/movies/baahubali-the-beginning/1770016089', logo_name: 'hotstar' },
      { name: 'Netflix', link: 'https://www.netflix.com/title/80204901', logo_name: 'netflix' }
    ]
  },
  {
    id: 350312,
    title: 'Baahubali 2: The Conclusion',
    overview: 'When Bhallaladeva conspires against his brother to become the king of Mahishmati, he gets him killed by Kattappa. Years later, Baahubali\'s son returns to avenge his father\'s death.',
    rating: 7.9,
    vote_count: 6000,
    media_type: 'movie',
    release_year: '2017',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Baahubali_the_Conclusion_Poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Baahubali_The_Conclusion_promotions.jpg',
    genres: [28, 18],
    trailer_key: 'qD-6d8Dy3JE',
    providers: [
      { name: 'Hotstar', link: 'https://www.hotstar.com/in/movies/baahubali-2-the-conclusion/1770016091', logo_name: 'hotstar' },
      { name: 'Netflix', link: 'https://www.netflix.com/title/80204902', logo_name: 'netflix' }
    ]
  },
  {
    id: 579974,
    title: 'RRR',
    overview: 'A fictional history of two legendary revolutionaries\' journey away from home before they began fighting for their country in the 1920s.',
    rating: 7.9,
    vote_count: 12000,
    media_type: 'movie',
    release_year: '2022',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/6/69/RRR_film_logo.png',
    genres: [28, 18],
    trailer_key: 'NgBoMJy386M',
    providers: [
      { name: 'Netflix', link: 'https://www.netflix.com/title/81476453', logo_name: 'netflix' },
      { name: 'Hotstar', link: 'https://www.hotstar.com/in/movies/rrr/1260098521', logo_name: 'hotstar' }
    ]
  },
  {
    id: 784606,
    title: 'K.G.F: Chapter 2',
    overview: 'The blood-soaked land of Kolar Gold Fields (KGF) has a new overlord now - Rocky, whose name strikes fear in the heart of his foes. His allies look up to Rocky as their Savior, the government sees him as a threat to law and order.',
    rating: 7.3,
    vote_count: 4000,
    media_type: 'movie',
    release_year: '2022',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/d/d0/K.G.F_Chapter_2.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/KGF_Chapter_2_Poster.jpg',
    genres: [28, 80],
    trailer_key: 't3NquDgH390',
    providers: [{ name: 'Prime Video', link: 'https://www.amazon.in/gp/video/detail/B0B5JZQLNW/?tag=cineswipe-21', logo_name: 'prime' }]
  },
  {
    id: 811656,
    title: 'Pushpa: The Rise',
    overview: 'A red sander smuggler, Pushpa, rises to power in the Seshachalam forests of Andhra Pradesh. Along the way, he encounters a ruthless police officer who threatens to destroy his empire.',
    rating: 7.2,
    vote_count: 3000,
    media_type: 'movie',
    release_year: '2021',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/7/75/Pushpa_-_The_Rise_%28film%29_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Pushpa_The_Rise_film_logo.png',
    genres: [28, 18],
    trailer_key: 'pKctjlGbFNA',
    providers: [{ name: 'Prime Video', link: 'https://www.amazon.in/gp/video/detail/B09P7QHL9P/?tag=cineswipe-21', logo_name: 'prime' }]
  },
  {
    id: 554600,
    title: 'Uri: The Surgical Strike',
    overview: 'Divided over five chapters, the film chronicles the true events of the surgical strikes conducted by the Indian military against terrorist launchpads in Pakistan-administered Kashmir in 2016.',
    rating: 7.3,
    vote_count: 2500,
    media_type: 'movie',
    release_year: '2019',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/3/3b/URI_-_The_Surgical_Strike.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Uri_The_Surgical_Strike_Logo.png',
    genres: [28, 18],
    trailer_key: 'VVY3O6n_T3g',
    providers: []
  },
  {
    id: 1396,
    title: 'Breaking Bad',
    overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family\'s future.',
    rating: 8.9,
    vote_count: 13500,
    media_type: 'tv',
    release_year: '2008',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/6/61/Breaking_Bad_Season_5_DVD_Cover.png',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Breaking_Bad_title_card.png',
    genres: [18, 80],
    trailer_key: 'HhesaQXLuRY',
    providers: [{ name: 'Netflix', link: 'https://www.netflix.com/title/70143825', logo_name: 'netflix' }]
  },
  {
    id: 1399,
    title: 'Game of Thrones',
    overview: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.',
    rating: 8.4,
    vote_count: 22100,
    media_type: 'tv',
    release_year: '2011',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/9/9d/Game_of_Thrones_Season_8_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Game_of_Thrones_title_card.jpg',
    genres: [10765, 18],
    trailer_key: 'bjqEWgDVy04',
    providers: [
      { name: 'Hotstar', link: 'https://www.hotstar.com/in/shows/game-of-thrones/8184', logo_name: 'hotstar' },
      { name: 'HBO', link: 'https://www.hbo.com/game-of-thrones', logo_name: 'hbo' }
    ]
  },
  {
    id: 66732,
    title: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    rating: 8.6,
    vote_count: 17800,
    media_type: 'tv',
    release_year: '2016',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Stranger_Things_soundtrack_album_cover.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Stranger_Things_logo.png',
    genres: [10765, 9648],
    trailer_key: 'b9EkMc79ZSU',
    providers: [{ name: 'Netflix', link: 'https://www.netflix.com/title/80057281', logo_name: 'netflix' }]
  },
  {
    id: 2316,
    title: 'The Office',
    overview: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
    rating: 8.6,
    vote_count: 9800,
    media_type: 'tv',
    release_year: '2005',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/8/80/The_Office_US_title_card.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Dunder_Mifflin%2C_Inc.svg',
    genres: [35],
    trailer_key: '2iKdm68nVwg',
    providers: [
      { name: 'Netflix', link: 'https://www.netflix.com/title/70136120', logo_name: 'netflix' },
      { name: 'Prime Video', link: 'https://www.primevideo.com/detail/The-Office/0H9M7QG7Y3T', logo_name: 'prime' }
    ]
  },
  {
    id: 1668,
    title: 'Friends',
    overview: 'Six young people navigate their personal and professional lives in Manhattan, experiencing relationship struggles, career updates, and hilarious social situations.',
    rating: 8.5,
    vote_count: 10500,
    media_type: 'tv',
    release_year: '1994',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/d/d6/Friends_season_one_cast.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Friends_logo.svg',
    genres: [35],
    trailer_key: 'hDNNmeeJs1Q',
    providers: [{ name: 'Netflix', link: 'https://www.netflix.com/title/70153404', logo_name: 'netflix' }]
  },
  {
    id: 76479,
    title: 'The Boys',
    overview: 'A fun and irreverent take on what happens when superheroes—who are as popular as celebrities—abuse their superpowers rather than use them for good.',
    rating: 8.5,
    vote_count: 10200,
    media_type: 'tv',
    release_year: '2019',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/6/6b/The_Boys_season_1_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/0/00/The_Boys_Logo.png',
    genres: [10765, 10759],
    trailer_key: 'M1bhOaLv4FU',
    providers: [{ name: 'Prime Video', link: 'https://www.primevideo.com/detail/The-Boys/0K7SNXMEVAGP', logo_name: 'prime' }]
  },
  {
    id: 114461,
    title: 'Ahsoka',
    overview: 'Former Jedi Knight Ahsoka Tano investigates an emerging threat to a vulnerable galaxy after the fall of the Empire.',
    rating: 7.4,
    vote_count: 2800,
    media_type: 'tv',
    release_year: '2023',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/b/bf/Ahsoka_%28TV_series%29_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ahsoka_logo.png',
    genres: [10765, 10759],
    trailer_key: 'J7-ZJ7u93S4',
    providers: [
      { name: 'Disney+', link: 'https://www.hotstar.com/in/shows/ahsoka/1260148560', logo_name: 'disney' },
      { name: 'Hotstar', link: 'https://www.hotstar.com/in/shows/ahsoka/1260148560', logo_name: 'hotstar' }
    ]
  },
  {
    id: 93405,
    title: 'Squid Game',
    overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits with deadly high stakes.',
    rating: 7.8,
    vote_count: 14200,
    media_type: 'tv',
    release_year: '2021',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/d/d7/Squid_Game_title_card.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Squid_game_text.png',
    genres: [10759, 18],
    trailer_key: 'oqxAJKy0R4A',
    providers: [{ name: 'Netflix', link: 'https://www.netflix.com/title/81040344', logo_name: 'netflix' }]
  },
  {
    id: 82856,
    title: 'The Mandalorian',
    overview: 'After the defeat of the Galactic Empire, a lone gunfighter makes his way through the outer reaches of the lawless galaxy, protecting a mysterious infant creature.',
    rating: 8.4,
    vote_count: 9200,
    media_type: 'tv',
    release_year: '2019',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/0/08/The_Mandalorian_season_1_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/The_Mandalorian_title_card.jpg',
    genres: [10765, 10759],
    trailer_key: 'aOC8E8z_ifw',
    providers: [
      { name: 'Disney+', link: 'https://www.hotstar.com/in/shows/the-mandalorian/1260021071', logo_name: 'disney' },
      { name: 'Hotstar', link: 'https://www.hotstar.com/in/shows/the-mandalorian/1260021071', logo_name: 'hotstar' }
    ]
  },
  {
    id: 84958,
    title: 'Loki',
    overview: 'After stealing the Tesseract during the events of Avengers: Endgame, an alternate version of Loki is brought to the mysterious Time Variance Authority (TVA).',
    rating: 8.2,
    vote_count: 11200,
    media_type: 'tv',
    release_year: '2021',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/a/ad/Loki_season_1_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Loki_title_card.jpg',
    genres: [10765, 10759],
    trailer_key: 'nW948Va-76g',
    providers: [
      { name: 'Disney+', link: 'https://www.hotstar.com/in/shows/loki/1260063462', logo_name: 'disney' },
      { name: 'Hotstar', link: 'https://www.hotstar.com/in/shows/loki/1260063462', logo_name: 'hotstar' }
    ]
  },
  {
    id: 82068,
    title: 'Mirzapur',
    overview: 'A shocking incident at a wedding procession ignites a series of events entangling the lives of two families in the lawless town of Mirzapur.',
    rating: 8.2,
    vote_count: 2200,
    media_type: 'tv',
    release_year: '2018',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/3/3c/Mirzapur_Amazon_original_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Mirzapur_Official_Logo.png',
    genres: [80, 18],
    trailer_key: 'ZNeGF-PvRHY',
    providers: [{ name: 'Prime Video', link: 'https://www.primevideo.com/detail/Mirzapur/0PD51WY386M', logo_name: 'prime' }]
  },
  {
    id: 92446,
    title: 'The Family Man',
    overview: 'Srikant Tiwari is a middle-class man who also serves as a world-class spy in the National Investigation Agency\'s special cell, trying to balance his family and national security.',
    rating: 8.2,
    vote_count: 1800,
    media_type: 'tv',
    release_year: '2019',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/1/1d/The_Family_Man_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/0/07/The_Family_Man_film_logo.png',
    genres: [80, 18],
    trailer_key: 'XatRGut65VI',
    providers: [{ name: 'Prime Video', link: 'https://www.primevideo.com/detail/The-Family-Man/0H09M7QG7Y3T', logo_name: 'prime' }]
  },
  {
    id: 80894,
    title: 'Sacred Games',
    overview: 'A link in their pasts leads an honest police officer to a fugitive gang boss whose cryptic warning spurs the officer on a quest to save Mumbai from cataclysm.',
    rating: 8.0,
    vote_count: 1400,
    media_type: 'tv',
    release_year: '2018',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Sacred_Games_Netflix_original_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Sacred_games_netflix_logo.png',
    genres: [80, 18],
    trailer_key: '28j8hfySgE4',
    providers: [{ name: 'Netflix', link: 'https://www.netflix.com/title/80115328', logo_name: 'netflix' }]
  },
  {
    id: 104770,
    title: 'Scam 1992: The Harshad Mehta Story',
    overview: 'Set in 1980s and 90s Bombay, Scam 1992 follows the life of Harshad Mehta, a stockbroker who took the stock market to dizzying heights before his catastrophic downfall.',
    rating: 8.5,
    vote_count: 1100,
    media_type: 'tv',
    release_year: '2020',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/d/dd/Scam_1992_poster.jpg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Scam_1992_Logo.png',
    genres: [18, 80],
    trailer_key: '2gb9lG3j0K8',
    providers: []
  },
  {
    id: 98114,
    title: 'Panchayat',
    overview: 'An engineering graduate, Abhishek, is unable to find a job suited to his qualifications. He accepts the job of a secretary of a Panchayat office in a remote village in Uttar Pradesh.',
    rating: 8.3,
    vote_count: 1200,
    media_type: 'tv',
    release_year: '2020',
    poster_src: 'https://upload.wikimedia.org/wikipedia/en/5/50/Panchayat_poster.jpeg',
    backdrop_src: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Panchayat_Logo.png',
    genres: [35, 18],
    trailer_key: '5S-tVslB2gI',
    providers: [{ name: 'Prime Video', link: 'https://www.primevideo.com/detail/Panchayat/0H9N7QG7Y3TN', logo_name: 'prime' }]
  }
];

// Helper to download an image as Buffer
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

// Helper to upload buffer to Supabase Storage
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

const MOCK_IMAGE_PATHS: Record<number, { poster: string, backdrop: string }> = {
  157336: { poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg' },
  299534: { poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg' },
  19995: { poster: 'https://image.tmdb.org/t/p/w500/jRXYjXNq0cs2TcJ6Vxl2BaMIsqt.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/vL5LR6WdxWPjLPFRLe133jXWsh5.jpg' },
  550: { poster: 'https://image.tmdb.org/t/p/w500/2lECpi35Hnbpa4y46JX0aY3AWTy.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/8uO0gUM8aNqYLs1OsTBQiXu0fEv.jpg' },
  693134: { poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg' },
  572802: { poster: 'https://image.tmdb.org/t/p/w500/8xV47NDrjdZDpkVcCFqkdHa3T0C.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/bckxSN9ueOgm0gJpVJmPQrecWul.jpg' },
  256040: { poster: 'https://image.tmdb.org/t/p/w500/9942aZ7l9HhGg7Wb6qK55o4hB6q.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/8h58JgY01hD14p31Vw1yS1aW45m.jpg' },
  350312: { poster: 'https://image.tmdb.org/t/p/w500/5q6F2yG19q148YpL2Jk4Jg4Jq4.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/hH20lJ4q9b7F4fW7wZ9l8m3o1fB.jpg' },
  579974: { poster: 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0yeO1WMe6.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/7u1H61HqBOn8VNTyW9F56z7Z3bN.jpg' },
  784606: { poster: 'https://image.tmdb.org/t/p/w500/bXrZ5iGlPq7rwcnBgP7O2hB1iB4.jpg', backdrop: 'https://image.tmdb.org/t/p/w500/bXrZ5iGlPq7rwcnBgP7O2hB1iB4.jpg' },
  811656: { poster: 'https://image.tmdb.org/t/p/w500/pMMPFqD9sPqG9N6Hw7iZ2wQk2bL.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/p8oYl4hM1t23T7r4mZfG6Y5y0X9.jpg' },
  554600: { poster: 'https://image.tmdb.org/t/p/w500/yA2Rgg0sD5K2Vw1K4dJjM0F5o5e.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/gEDzACsdPbsHZQ0I80FLYFCf2nt.jpg' },
  1396: { poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg' },
  1399: { poster: 'https://image.tmdb.org/t/p/w500/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg' },
  66732: { poster: 'https://image.tmdb.org/t/p/w500/49WJzLaN395J47k6q5xYw7s36y8.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/56v2KjBlYj4fOhLEnDAJZRLoAVb.jpg' },
  2316: { poster: 'https://image.tmdb.org/t/p/w500/qrvCbw6OejJ8X1wWw6C9vAgbG6R.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/2t71s2gX3jQ0y4H9mNnQkG7y3t.jpg' },
  1668: { poster: 'https://image.tmdb.org/t/p/w500/f496cm9enuEsZgSPzCwnTICQR53.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/qdIMHd4sEfJSckfVJfKQvisL02a.jpg' },
  76479: { poster: 'https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/7q448EVOnuE3gVAx24krzO7SNXM.jpg' },
  114461: { poster: 'https://image.tmdb.org/t/p/w500/eSVvx8xys2NuFhl8fevXt41wX7v.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/kUaFsOFtfCN3Jk2yP9GLnVr1CxI.jpg' },
  93405: { poster: 'https://image.tmdb.org/t/p/w500/dDlA0H1uF24aXm6Gj92l25O6Z7D.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg' },
  82856: { poster: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg' },
  84958: { poster: 'https://image.tmdb.org/t/p/w500/voHUmluYmKyleFkTu3lOXQG702u.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/voHUmluYmKyleFkTu3lOXQG702u.jpg' },
  82068: { poster: 'https://image.tmdb.org/t/p/w500/n9T8LTVyU4g0M2e2L08zB3fW9B.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/n9T8LTVyU4g0M2e2L08zB3fW9B.jpg' },
  92446: { poster: 'https://image.tmdb.org/t/p/w500/tkj4Z25fD4xWd9C4q5i6R26w90g.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/tkj4Z25fD4xWd9C4q5i6R26w90g.jpg' },
  80894: { poster: 'https://image.tmdb.org/t/p/w500/hGqRpsgP3eB4G9hWn9X9p3p5E6B.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/hGqRpsgP3eB4G9hWn9X9p3p5E6B.jpg' },
  104770: { poster: 'https://image.tmdb.org/t/p/w500/jN4s0KzP8WjP5n3O0XfWw2r2U0X.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/jN4s0KzP8WjP5n3O0XfWw2r2U0X.jpg' },
  98114: { poster: 'https://image.tmdb.org/t/p/w500/7WUHngqDuLG7COA1P0X2nVjpRQN.jpg', backdrop: 'https://image.tmdb.org/t/p/w1280/7WUHngqDuLG7COA1P0X2nVjpRQN.jpg' }
};

const PROVIDER_IMAGE_PATHS: Record<string, string> = {
  netflix: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
  prime: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg',
  disney: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg',
  hotstar: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg',
  hbo: 'https://image.tmdb.org/t/p/w92/tuomPhY2UtuPTqqFnKMVHvZ1n9m.png'
};

async function run() {
  console.log('=== Step 0: Ensuring Storage Bucket Exists ===');
  try {
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('posters', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      fileSizeLimit: 5242880
    });
    if (bucketError) {
      console.log('Bucket "posters" already exists or message:', bucketError.message);
    } else {
      console.log('Bucket "posters" created successfully!');
    }
  } catch (err) {
    console.warn('Non-blocking bucket ensure catch:', err);
  }

  console.log('\n=== Step 1: Uploading Provider Logos ===');
  const providerUrls: Record<string, string> = {};

  for (const provider of PROVIDER_LOGOS) {
    const fileName = `provider-${provider.name}.${provider.url.endsWith('.svg') ? 'svg' : 'jpg'}`;
    const mimeType = provider.url.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';
    
    const downloadUrl = PROVIDER_IMAGE_PATHS[provider.name] || provider.url;
    console.log(`Downloading ${provider.name} logo from ${downloadUrl}...`);
    let buffer = await downloadImage(downloadUrl);
    
    if (!buffer && downloadUrl !== provider.url) {
      console.log(`  Falling back to original Wikipedia URL: ${provider.url}`);
      buffer = await downloadImage(provider.url);
    }
    await delay(1000);
    
    if (buffer) {
      console.log(`Uploading ${fileName} to storage...`);
      const publicUrl = await uploadToStorage(fileName, buffer, mimeType);
      if (publicUrl) {
        providerUrls[provider.name] = publicUrl;
        console.log(`  SUCCESS: ${publicUrl}`);
      }
    } else {
      console.error(`  FAILED to download ${provider.name} logo.`);
    }
  }

  console.log('\n=== Step 2: Uploading Catalog Posters and Backdrops ===');
  for (const item of CATALOG_ITEMS) {
    console.log(`\nProcessing Item: [${item.media_type.toUpperCase()}] ${item.title} (ID: ${item.id})...`);
    
    const overrides = MOCK_IMAGE_PATHS[item.id];
    
    const posterFileName = `${item.media_type}-${item.id}.jpg`;
    const posterSrc = overrides ? overrides.poster : item.poster_src;
    console.log(`  Downloading poster from ${posterSrc}...`);
    let posterBuffer = await downloadImage(posterSrc);
    
    if (!posterBuffer && posterSrc !== item.poster_src) {
      console.log(`  Poster TMDB failed. Falling back to Wikipedia: ${item.poster_src}`);
      posterBuffer = await downloadImage(item.poster_src);
    }
    await delay(1000);
    let posterUrl = '';
    
    if (posterBuffer) {
      console.log(`  Uploading poster ${posterFileName}...`);
      const resUrl = await uploadToStorage(posterFileName, posterBuffer, 'image/jpeg');
      if (resUrl) {
        posterUrl = resUrl;
        console.log(`  Poster SUCCESS: ${posterUrl}`);
      }
    } else {
      console.error(`  Poster FAILED.`);
    }

    const backdropFileName = `${item.media_type}-${item.id}-bg.jpg`;
    const backdropSrc = overrides ? overrides.backdrop : item.backdrop_src;
    console.log(`  Downloading backdrop from ${backdropSrc}...`);
    let backdropBuffer = await downloadImage(backdropSrc);
    
    if (!backdropBuffer && backdropSrc !== item.backdrop_src) {
      console.log(`  Backdrop TMDB failed. Falling back to Wikipedia: ${item.backdrop_src}`);
      backdropBuffer = await downloadImage(item.backdrop_src);
    }
    await delay(1000);
    let backdropUrl = '';
    
    if (backdropBuffer) {
      console.log(`  Uploading backdrop ${backdropFileName}...`);
      const resUrl = await uploadToStorage(backdropFileName, backdropBuffer, 'image/jpeg');
      if (resUrl) {
        backdropUrl = resUrl;
        console.log(`  Backdrop SUCCESS: ${backdropUrl}`);
      }
    } else {
      console.error(`  Backdrop FAILED.`);
    }

    const mappedProviders = item.providers.map(p => {
      const hostedLogo = providerUrls[p.logo_name] || '/poster-placeholder.svg';
      return {
        name: p.name,
        link: p.link,
        logoUrl: hostedLogo
      };
    });

    console.log(`  Saving [${item.media_type}] ${item.title} to PostgreSQL movies_catalog table...`);
    const { error: dbError } = await supabase
      .from('movies_catalog')
      .upsert({
        id: item.id,
        title: item.title,
        overview: item.overview,
        rating: item.rating,
        vote_count: item.vote_count,
        media_type: item.media_type,
        release_year: item.release_year,
        poster_url: posterUrl || '/poster-placeholder.svg',
        backdrop_url: backdropUrl || posterUrl || '/poster-placeholder.svg',
        genres: item.genres,
        trailer_key: item.trailer_key,
        providers: mappedProviders
      }, { onConflict: 'id' });

    if (dbError) {
      console.error(`  Database SAVE ERROR for ${item.title}:`, dbError.message);
    } else {
      console.log(`  Database SAVE SUCCESS!`);
    }
  }

  console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY ===');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
