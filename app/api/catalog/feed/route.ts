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

import { validateCatalogFeedQuery } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Applied Declarative Input Schema Boundary Verification Pattern (Pillar 3)
    const validation = validateCatalogFeedQuery(searchParams);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { mediaType, genreId, page, seed } = validation.parsed!;
    const limit = 20;

    let finalItems: ContentItem[] = [];

    // 1. Fetch from local Supabase catalog
    if (supabase) {
      try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase.from('movies_catalog').select('*');
        if (mediaType !== 'all') {
          query = query.eq('media_type', mediaType);
        }
        if (genreId) {
          query = query.contains('genres', [genreId]);
        }
        query = query.order('id', { ascending: true });

        const { data: dbData, error: dbErr } = await query.range(from, to);

        if (!dbErr && dbData && dbData.length > 0) {
          const mapped = dbData.map((row) => mapCatalogRowToContentItem(row as Record<string, unknown>));
          if (seed) {
            // Deterministic ordering to align all multiplayer clients perfectly
            finalItems = mapped;
          } else {
            // Shuffle server-side to guarantee dynamic starting cards instead of static DB insertion ordering for solo users
            finalItems = mapped.sort(() => Math.random() - 0.5);
          }
        }
      } catch (supaErr) {
        console.error('Supabase fetch failed in feed route:', supaErr);
      }
    }

    // 2. If we have less than a full batch of 20, fill the remainder with TVMaze API!
    if (finalItems.length < limit) {
      const needed = limit - finalItems.length;
      
      let tvmazePage = (page - 1) * 3;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fetchedShows: any[] = [];
      let attempts = 0;
      const maxAttempts = 3;

      while (fetchedShows.length < needed && attempts < maxAttempts && tvmazePage < 300) {
        try {
          const res = await fetch(`https://api.tvmaze.com/shows?page=${tvmazePage}`);
          if (res.status === 404) {
            // Loop back to earlier pages to ensure never-ending scroll
            tvmazePage = 0;
            attempts++;
            continue;
          }
          if (!res.ok) break;

          const shows = await res.json();
          if (shows && shows.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filtered = shows.filter((show: any) => {
              // Quality checks
              if (!show.image?.medium || !show.name) return false;

              // Genre checks
              if (genreId) {
                const tvmazeGenres = mapTmdbGenreToTvmaze(genreId);
                const matchesGenre = show.genres?.some((g: string) =>
                  tvmazeGenres.some((tg: string) => tg.toLowerCase() === g.toLowerCase())
                );
                if (!matchesGenre) return false;
              }

              return true;
            });
            fetchedShows.push(...filtered);
          }
        } catch (fetchErr) {
          console.error(`TVMaze fetch error on page ${tvmazePage}:`, fetchErr);
        }
        tvmazePage++;
        attempts++;
      }

      // Take the first needed shows without any modulo offset that can result in an empty list
      const selectedShows = fetchedShows.slice(0, needed);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tvmazeItems: ContentItem[] = selectedShows.map((show: any) => {
        // Strip HTML summary tags
        const overview = show.summary
          ? show.summary.replace(/<[^>]*>/g, '').trim()
          : '';

        // Map genres to TMDB IDs
        const mappedGenreIds = show.genres
          ? show.genres.map(mapTvmazeGenreToTmdb).filter((id: number) => id > 0)
          : [];

        // Under CC BY-SA, we provide a backlink to the show's TVMaze page
        const tvmazeProvider = {
          name: 'TVMaze',
          logoUrl: '', // Will render custom styling matching other premium badges
          link: show.url || 'https://www.tvmaze.com/',
        };

        return {
          // Use high IDs (offset by 2,000,000) to guarantee no database collisions
          id: 2000000 + Number(show.id),
          title: show.name,
          overview,
          posterUrl: show.image.medium,
          backdropUrl: show.image.original || show.image.medium,
          releaseYear: show.premiered ? show.premiered.substring(0, 4) : '',
          rating: show.rating?.average ? Number(show.rating.average) : 7.0,
          voteCount: show.rating?.average ? 150 : 0,
          genreIds: mappedGenreIds.length > 0 ? mappedGenreIds : (genreId ? [genreId] : []),
          // Map to requested media type to keep the filter intact for the stack
          mediaType: mediaType === 'movie' ? 'movie' : 'tv',
          providers: [tvmazeProvider],
        };
      });

      finalItems.push(...tvmazeItems);
    }

    return NextResponse.json({
      success: true,
      page,
      results: finalItems.slice(0, limit),
      hasMore: finalItems.length >= limit,
    });
  } catch (error: unknown) {
    console.error('API catalog feed route error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
