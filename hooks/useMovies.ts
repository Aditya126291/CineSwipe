'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, hasSupabase } from '@/lib/supabase/client';
import { initializeWeights, rankMovies } from '@/lib/recommendations';
import { mapCatalogRowToContentItem } from '@/lib/catalog/map-row';
import { preloadPosterImages } from '@/lib/catalog/preload';
import type { ContentItem, Genre } from '@/lib/types/content';
// Removed unused TMDB imports and mock data

export const CATALOG_BATCH_SIZE = 20;

export type CatalogSource = 'supabase' | 'unknown';

export const ALL_GENRES: Genre[] = [
  { id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' },
  { id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' }, { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' }, { id: 16, name: 'Animation' }, { id: 99, name: 'Documentary' },
  { id: 14, name: 'Fantasy' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10759, name: 'Action & Adventure' }, { id: 80, name: 'Crime' }, { id: 9648, name: 'Mystery' }
];

export function seededRandom(seed: string) {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function useMovies(
  mediaType: 'movie' | 'tv' | 'all',
  genreId?: number,
  shuffleSeed?: string,
  prefetchFromIndex?: number
) {
  const [movies, setMovies] = useState<ContentItem[]>([]);
  const genres = ALL_GENRES;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [catalogSource, setCatalogSource] = useState<CatalogSource>('unknown');
  const loadingMoreRef = useRef(false);

  const rankFetchedMovies = useCallback((items: ContentItem[]) => {
    if (shuffleSeed) return items;
    let weights = initializeWeights();
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cineswipe-genre-weights');
      if (stored) {
        try {
          weights = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse weights', e);
        }
      }
    }
    return rankMovies(items, weights);
  }, [shuffleSeed]);

  const finalizeBatch = useCallback(
    async (items: ContentItem[], source: CatalogSource, clear: boolean, pageNum: number) => {
      const ranked = rankFetchedMovies(items);

      let output = ranked;
      if (shuffleSeed) {
        const rng = seededRandom(shuffleSeed + '_' + pageNum);
        output = [...ranked];
        for (let i = output.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [output[i], output[j]] = [output[j], output[i]];
        }
      }

      setCatalogSource(source);
      setMovies((prev) => (clear ? output : [...prev, ...output]));
      setHasMore(output.length >= CATALOG_BATCH_SIZE);
    },
    [rankFetchedMovies, shuffleSeed]
  );

  const loadMovies = useCallback(
    async (pageNum: number, clear = false) => {
      if (loadingMoreRef.current && !clear) return;
      loadingMoreRef.current = true;
      setLoading(true);
      setError(null);

      try {
        let finalItems: ContentItem[] = [];

        if (hasSupabase()) {
          try {
            // Standard pagination to ensure no repeats
            const from = (pageNum - 1) * CATALOG_BATCH_SIZE;
            const to = from + CATALOG_BATCH_SIZE - 1;

            let query = supabase!.from('movies_catalog').select('*');
            if (mediaType !== 'all') {
              query = query.eq('media_type', mediaType);
            }
            if (genreId) {
              query = query.contains('genres', [genreId]);
            }
            // Order by ID to ensure consistent pagination before ranking locally
            query = query.order('id', { ascending: true });

            const { data: dbData, error: dbErr } = await query.range(from, to);

            if (dbErr) throw dbErr;

            if (dbData && dbData.length > 0) {
              finalItems = dbData.map((row) => mapCatalogRowToContentItem(row as Record<string, unknown>));
            }
          } catch (supaErr) {
            console.error('Supabase fetching error:', supaErr);
            setError('Could not load titles from catalog. Please try again.');
          }
        } else {
          setError('Supabase is not configured. Catalog is offline.');
        }

        await finalizeBatch(finalItems, hasSupabase() ? 'supabase' : 'unknown', clear, pageNum);
        setHasMore(finalItems.length > 0);
      } catch (err: unknown) {
        console.error('Failed to fetch movies:', err);
        setError('Could not load titles. Please check your internet connection and try again.');
        setMovies([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        loadingMoreRef.current = false;
      }
    },
    [mediaType, genreId, finalizeBatch]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      loadMovies(1, true);
    }, 0);
    return () => clearTimeout(timer);
  }, [mediaType, genreId, shuffleSeed, loadMovies]);

  useEffect(() => {
    if (prefetchFromIndex == null || movies.length === 0) return;
    preloadPosterImages(movies, prefetchFromIndex + 1, 4);
    if (hasMore && prefetchFromIndex >= movies.length - 5 && !loading) {
      const nextPage = page + 1;
      setTimeout(() => {
        setPage(nextPage);
        loadMovies(nextPage, false);
      }, 0);
    }
  }, [prefetchFromIndex, movies, hasMore, loading, page, loadMovies]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage, false);
  };

  return { movies, setMovies, genres, loading, error, loadMore, hasMore, catalogSource, page };
}
