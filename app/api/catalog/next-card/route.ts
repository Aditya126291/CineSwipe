import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mapCatalogRowToContentItem } from '@/lib/catalog/map-row';
import type { ContentItem } from '@/lib/types/content';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Map TMDB Genre ID to TVMaze genre strings
const mapTmdbGenreToTvmaze = (id: number): string[] => {
  switch (id) {
    case 28: return ['Action'];
    case 35: return ['Comedy'];
    case 18: return ['Drama'];
    case 878: return ['Science-Fiction'];
    case 53: return ['Thriller'];
    case 27: return ['Horror'];
    case 10749: return ['Romance'];
    case 16: return ['Animation', 'Anime'];
    case 99: return ['Documentary'];
    case 14: return ['Fantasy'];
    case 10759: return ['Action', 'Adventure'];
    case 80: return ['Crime'];
    case 9648: return ['Mystery'];
    default: return [];
  }
};

// Map TVMaze genre string to TMDB ID
const mapTvmazeGenreToTmdb = (genre: string): number => {
  switch (genre.toLowerCase()) {
    case 'action': return 28;
    case 'adventure': return 10759;
    case 'comedy': return 35;
    case 'drama': return 18;
    case 'science-fiction': return 878;
    case 'thriller': return 53;
    case 'horror': return 27;
    case 'romance': return 10749;
    case 'animation':
    case 'anime': return 16;
    case 'documentary': return 99;
    case 'fantasy': return 14;
    case 'crime': return 80;
    case 'mystery': return 9648;
    default: return 0;
  }
};

// Standard supported genre list
const SUPPORTED_GENRE_IDS = [
  28, 35, 18, 878, 53, 27, 10749, 16, 99, 14, 10765, 10759, 80, 9648
];

import { validateNextCardPayload } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    
    // Applied Declarative Input Schema Boundary Verification Pattern (Pillar 3)
    const validation = validateNextCardPayload(rawBody);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { mediaType, selectedGenreId, weights, seen, recent } = validation.parsed!;

    // 1. Determine target genre using Roulette Wheel Selection (if no specific genre filter is active)
    let chosenGenre: number | undefined = selectedGenreId ? Number(selectedGenreId) : undefined;
    
    if (!chosenGenre) {
      const genres = Object.keys(weights).map(Number).filter(id => SUPPORTED_GENRE_IDS.includes(id));
      if (genres.length > 0) {
        const totalWeight = genres.reduce((sum, g) => sum + (Number(weights[g]) || 0), 0);
        if (totalWeight > 0) {
          let r = Math.random() * totalWeight;
          for (const g of genres) {
            r -= Number(weights[g]) || 0;
            if (r <= 0) {
              chosenGenre = g;
              break;
            }
          }
        }
      }
      if (!chosenGenre) {
        // Fallback: pick a random supported genre
        chosenGenre = SUPPORTED_GENRE_IDS[Math.floor(Math.random() * SUPPORTED_GENRE_IDS.length)];
      }
    }

    // 2. Determine chosen media type with anti-clustering
    let chosenMediaType = mediaType;
    if (mediaType === 'all') {
      // Check if last two recent cards were of same media type to prevent clustering
      if (recent.length >= 2 && recent[0].mediaType === recent[1].mediaType) {
        // Prefer the other type with 80% probability
        const opposite = recent[0].mediaType === 'movie' ? 'tv' : 'movie';
        chosenMediaType = Math.random() < 0.8 ? opposite : recent[0].mediaType;
      } else {
        chosenMediaType = Math.random() < 0.5 ? 'movie' : 'tv';
      }
    }

    // 3. Query candidate pool from Supabase or TVMaze
    let candidatePool: ContentItem[] = [];
    const seenSet = new Set<number>(seen.map(Number));

    // Fetch from Supabase Catalog
    if (supabase) {
      try {
        let query = supabase.from('movies_catalog').select('*');
        if (chosenMediaType !== 'all') {
          query = query.eq('media_type', chosenMediaType);
        }
        if (chosenGenre) {
          query = query.contains('genres', [chosenGenre]);
        }
        
        // Grab a larger slice to ensure we have unseen candidates after filtering
        const { data: dbData, error: dbErr } = await query.limit(40);
        
        if (!dbErr && dbData && dbData.length > 0) {
          const mapped = dbData.map((row) => mapCatalogRowToContentItem(row as Record<string, unknown>));
          candidatePool.push(...mapped);
        }
      } catch (err) {
        console.error('Supabase fetch failed in next-card endpoint:', err);
      }
    }

    // Fetch from TVMaze if we need more candidates or chosenMediaType is tv/all
    if (chosenMediaType === 'tv' || chosenMediaType === 'all') {
      try {
        // Semi-randomize pages to introduce diversity in starting pools
        const randomTvmazePage = Math.floor(Math.random() * 6); // Pages 0 to 5
        const res = await fetch(`https://api.tvmaze.com/shows?page=${randomTvmazePage}`);
        if (res.ok) {
          const shows = await res.json();
          if (shows && shows.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filteredShows = shows.filter((show: any) => {
              if (!show.image?.medium || !show.name) return false;
              if (chosenGenre) {
                const tvmazeGenres = mapTmdbGenreToTvmaze(chosenGenre);
                const matchesGenre = show.genres?.some((g: string) =>
                  tvmazeGenres.some((tg: string) => tg.toLowerCase() === g.toLowerCase())
                );
                if (!matchesGenre) return false;
              }
              return true;
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tvmazeItems: ContentItem[] = filteredShows.map((show: any) => {
              const overview = show.summary
                ? show.summary.replace(/<[^>]*>/g, '').trim()
                : '';
              const mappedGenreIds = show.genres
                ? show.genres.map(mapTvmazeGenreToTmdb).filter((id: number) => id > 0)
                : [];
              const tvmazeProvider = {
                name: 'TVMaze',
                logoUrl: '',
                link: show.url || 'https://www.tvmaze.com/',
              };
              return {
                id: 2000000 + Number(show.id),
                title: show.name,
                overview,
                posterUrl: show.image.medium,
                backdropUrl: show.image.original || show.image.medium,
                releaseYear: show.premiered ? show.premiered.substring(0, 4) : '',
                rating: show.rating?.average ? Number(show.rating.average) : 7.0,
                voteCount: show.rating?.average ? 150 : 0,
                genreIds: mappedGenreIds.length > 0 ? mappedGenreIds : (chosenGenre ? [chosenGenre] : []),
                mediaType: 'tv',
                providers: [tvmazeProvider],
              };
            });

             candidatePool.push(...tvmazeItems);

            // Self-seeding database: programmatically write TVMaze shows straight into Supabase database catalog
            if (supabase && tvmazeItems.length > 0) {
              try {
                const dbRows = tvmazeItems.map(item => ({
                  id: item.id,
                  title: item.title,
                  overview: item.overview,
                  rating: item.rating,
                  vote_count: item.voteCount,
                  media_type: item.mediaType,
                  release_year: item.releaseYear,
                  poster_url: item.posterUrl,
                  backdrop_url: item.backdropUrl,
                  genres: item.genreIds,
                  providers: item.providers
                }));
                await supabase.from('movies_catalog').upsert(dbRows, { onConflict: 'id' });
              } catch (dbUpsertErr) {
                console.error('[Database Cache] Failed to seed TVMaze items:', dbUpsertErr);
              }
            }
          }
        }
      } catch (err) {
        console.error('TVMaze fetch failed in next-card endpoint:', err);
      }
    }

    // 4. Filter out seen items
    let unseenCandidates = candidatePool.filter(item => !seenSet.has(item.id));

    // WIDEN SEARCH ON GENRE EXHAUSTION FALLBACK (Pillar 3 & 4)
    // If the selected genre is fully exhausted (0 unseen candidates), we widen the candidate query pool
    // to ALL genres in the database before resorting to repeating. This guarantees the user will see
    // every other movie/show in the entire database exactly once before any item repeats!
    if (unseenCandidates.length === 0 && chosenGenre) {
      const widerPool: ContentItem[] = [];
      
      // A. Query Supabase without genre constraints
      if (supabase) {
        try {
          let queryWider = supabase.from('movies_catalog').select('*');
          if (chosenMediaType !== 'all') {
            queryWider = queryWider.eq('media_type', chosenMediaType);
          }
          // Fetch up to 40 items to cover the entire catalog
          const { data: dbDataWider, error: dbErrWider } = await queryWider.limit(40);
          if (!dbErrWider && dbDataWider && dbDataWider.length > 0) {
            const mappedWider = dbDataWider.map((row) => mapCatalogRowToContentItem(row as Record<string, unknown>));
            widerPool.push(...mappedWider);
          }
        } catch (err) {
          console.error('Supabase wider fetch failed in next-card endpoint:', err);
        }
      }

      // B. Query TVMaze without genre constraints
      if (chosenMediaType === 'tv' || chosenMediaType === 'all') {
        try {
          const randomTvmazePage = Math.floor(Math.random() * 6);
          const res = await fetch(`https://api.tvmaze.com/shows?page=${randomTvmazePage}`);
          if (res.ok) {
            const shows = await res.json();
            if (shows && shows.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const filteredShows = shows.filter((show: any) => show.image?.medium && show.name);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tvmazeItems: ContentItem[] = filteredShows.map((show: any) => {
                const overview = show.summary ? show.summary.replace(/<[^>]*>/g, '').trim() : '';
                const mappedGenreIds = show.genres ? show.genres.map(mapTvmazeGenreToTmdb).filter((id: number) => id > 0) : [];
                return {
                  id: 2000000 + Number(show.id),
                  title: show.name,
                  overview,
                  posterUrl: show.image.medium,
                  backdropUrl: show.image.original || show.image.medium,
                  releaseYear: show.premiered ? show.premiered.substring(0, 4) : '',
                  rating: show.rating?.average ? Number(show.rating.average) : 7.0,
                  voteCount: show.rating?.average ? 150 : 0,
                  genreIds: mappedGenreIds.length > 0 ? mappedGenreIds : [],
                  mediaType: 'tv',
                  providers: [{ name: 'TVMaze', logoUrl: '', link: show.url || 'https://www.tvmaze.com/' }],
                };
              });
              widerPool.push(...tvmazeItems);

              // Self-seeding database: programmatically write TVMaze shows straight into Supabase database catalog
              if (supabase && tvmazeItems.length > 0) {
                try {
                  const dbRows = tvmazeItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    overview: item.overview,
                    rating: item.rating,
                    vote_count: item.voteCount,
                    media_type: item.mediaType,
                    release_year: item.releaseYear,
                    poster_url: item.posterUrl,
                    backdrop_url: item.backdropUrl,
                    genres: item.genreIds,
                    providers: item.providers
                  }));
                  await supabase.from('movies_catalog').upsert(dbRows, { onConflict: 'id' });
                } catch (dbUpsertErr) {
                  console.error('[Database Cache] Failed to seed TVMaze items:', dbUpsertErr);
                }
              }
            }
          }
        } catch (err) {
          console.error('TVMaze wider fetch failed in next-card endpoint:', err);
        }
      }

      // Filter the wider pool using seenSet
      const unseenWider = widerPool.filter(item => !seenSet.has(item.id));
      if (unseenWider.length > 0) {
        unseenCandidates = unseenWider;
      }
    }

    // 5. Apply Anti-Sameyness / Diversity penalties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentList = recent as any[];

    const scoredCandidates = unseenCandidates.map(candidate => {
      let penalty = 0;

      // Rule A: Sequel/Series similarity penalty (heavy: +0.8)
      // Check if title shares word prefixes or starts with same keywords to prevent consecutive sequels/series seasons
      const titleLower = candidate.title.toLowerCase();
      const firstWord = titleLower.split(' ')[0] || '';
      
      const isSeriesRepeat = recentList.slice(0, 3).some(r => {
        const rTitleLower = String(r.title || '').toLowerCase();
        // If the candidate shares the exact first word (more than 3 letters)
        if (firstWord.length > 3 && rTitleLower.startsWith(firstWord)) return true;
        // If the title is highly similar (e.g. contains substantial overlap)
        if (rTitleLower.includes(titleLower) || titleLower.includes(rTitleLower)) return true;
        return false;
      });

      if (isSeriesRepeat) {
        penalty += 0.8;
      }

      // Rule B: Genre clustering penalty (moderate: +0.4)
      // If the candidate's primary genre matches any genre of the last two cards
      const primaryGenre = candidate.genreIds?.[0];
      if (primaryGenre) {
        const isGenreClustering = recentList.slice(0, 2).some(r => 
          (r.genreIds || []).includes(primaryGenre)
        );
        if (isGenreClustering) {
          penalty += 0.4;
        }
      }

      // Rule C: Provider repeat penalty (minor: +0.3)
      // Avoid showing TVMaze items consecutively if the last 3 cards were TVMaze
      const isTvmaze = candidate.id >= 2000000;
      if (isTvmaze) {
        const consecutiveTvmazeCount = recentList.slice(0, 3).filter(r => Number(r.id) >= 2000000).length;
        if (consecutiveTvmazeCount >= 2) {
          penalty += 0.3;
        }
      }

      // Compute final score
      const baseScore = (candidate.rating || 6) / 10 + Math.log10((candidate.voteCount || 1) + 1) / 100;
      return {
        item: candidate,
        finalScore: baseScore - penalty
      };
    });

    // Sort by penalized score descending
    scoredCandidates.sort((a, b) => b.finalScore - a.finalScore);

    // 6. Select the best card or fallback if empty
    let selectedItem: ContentItem | null = null;
    if (scoredCandidates.length > 0) {
      // Pick the top item
      selectedItem = scoredCandidates[0].item;
    } else {
      // Emergency fallback: If everything matching the chosen genre/media type has been swiped,
      // we implement a Least-Recently-Seen (LRS) cooldown replacement pattern.
      // This ranks candidates by their index in the 'seen' array (meaning the movie seen longest ago is preferred).
      // It also heavily penalizes any candidate currently in the 'recent' list or at the very end of 'seen' to prevent consecutive duplicates.
      if (candidatePool.length > 0) {
        const fallbackCandidates = candidatePool.map(candidate => {
          // Find index in seen list
          const seenIndex = seen.indexOf(candidate.id);
          
          // If not in seen, it has high priority (index = -1)
          // Otherwise, lower index in 'seen' is better because it was seen longer ago
          let score = seenIndex === -1 ? -100 : seenIndex;
          
          // Heavily penalize if it is in the recent deck (last 5 items) to prevent repeats
          const isRecent = recent.some((r: { id: number }) => Number(r.id) === candidate.id);
          if (isRecent) {
            score += 10000; // Push score very high (meaning it's disqualified/penalized)
          }

          // Penalize if it's the absolute last item swiped in seen
          if (seen.length > 0 && seen[seen.length - 1] === candidate.id) {
            score += 5000;
          }

          return {
            item: candidate,
            score
          };
        });

        // Sort ascending by score (so lowest score/longest-ago-seen is selected first)
        fallbackCandidates.sort((a, b) => a.score - b.score);
        selectedItem = fallbackCandidates[0].item;
      } else if (supabase) {
        // Ultimate database fallback
        const { data } = await supabase.from('movies_catalog').select('*').limit(5);
        if (data && data.length > 0) {
          selectedItem = mapCatalogRowToContentItem(data[0] as Record<string, unknown>);
        }
      }
    }

    if (!selectedItem) {
      throw new Error('No catalog items available.');
    }

    return NextResponse.json({
      success: true,
      card: selectedItem,
    });
  } catch (error: unknown) {
    console.error('API catalog next-card route error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
