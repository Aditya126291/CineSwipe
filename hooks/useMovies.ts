'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeWeights, rankMovies } from '@/lib/recommendations';
import type { ContentItem, Genre } from '@/lib/types/content';

export const CATALOG_BATCH_SIZE = 20;

export type CatalogSource = 'supabase' | 'tvmaze' | 'unknown';

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
  }
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

  // In-memory set to prevent ANY repeated cards inside the active section
  const shownMovieIdsRef = useRef<Set<number>>(new Set());

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
    async (items: ContentItem[], clear: boolean, pageNum: number) => {
      const ranked = rankFetchedMovies(items);

      let output = ranked;
      if (shuffleSeed) {
        let h = 0xdeadbeef;
        for (let i = 0; i < shuffleSeed.length; i++) {
          h = Math.imul(h ^ shuffleSeed.charCodeAt(i), 2654435761);
        }
        // Custom seeded random since randomizer is simple
        const rng = () => {
          h = Math.imul(h ^ (h >>> 16), 2246822507);
          h = Math.imul(h ^ (h >>> 13), 3266489909);
          return ((h ^= h >>> 16) >>> 0) / 4294967296;
        };

        output = [...ranked];
        for (let i = output.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [output[i], output[j]] = [output[j], output[i]];
        }
      }

      // Add all shown IDs to our seen set to block repeats
      items.forEach((item) => shownMovieIdsRef.current.add(item.id));

      // Classify the catalog source based on IDs
      const hasTvmaze = items.some(item => item.id >= 2000000);
      const source: CatalogSource = hasTvmaze ? 'tvmaze' : 'supabase';

      setCatalogSource(source);
      setMovies((prev) => (clear ? output : [...prev, ...output]));
      setHasMore(items.length >= CATALOG_BATCH_SIZE);
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
        const finalItems: ContentItem[] = [];
        let currentPage = pageNum;
        let consecutiveEmptyAttempts = 0;

        // Auto-paginate on the server in a loop if the returned batch contains 
        // items we've already shown in this section. This keeps the feed truly continuous!
        while (finalItems.length < CATALOG_BATCH_SIZE && consecutiveEmptyAttempts < 5) {
          const url = `/api/catalog/feed?mediaType=${mediaType}&page=${currentPage}${
            genreId ? `&genreId=${genreId}` : ''
          }${shuffleSeed ? `&seed=${shuffleSeed}` : ''}`;

          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`API returned HTTP ${res.status}`);
          }

          const data = await res.json();
          if (!data.results || data.results.length === 0) {
            consecutiveEmptyAttempts++;
            currentPage++;
            if (!data.hasMore) break;
            continue;
          }

          // Filter out items that are already in shownMovieIdsRef
          const unseen = data.results.filter(
            (item: ContentItem) =>
              !shownMovieIdsRef.current.has(item.id) &&
              !finalItems.some((f) => f.id === item.id)
          );

          finalItems.push(...unseen);

          if (!data.hasMore) break;
          currentPage++;
        }

        await finalizeBatch(finalItems, clear, pageNum);
      } catch (err: unknown) {
        console.error('Failed to fetch movies:', err);
        setError('Could not load titles. Please check your connection and try again.');
        if (clear) {
          setMovies([]);
        }
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
      // Clear the seen set strictly when changing sections, matching Instagram Reels exactly!
      shownMovieIdsRef.current.clear();
      setPage(1);
      setHasMore(true);
      loadMovies(1, true);
    }, 0);
    return () => clearTimeout(timer);
  }, [mediaType, genreId, shuffleSeed, loadMovies]);

  // Load more when reaching near the end of the loaded stack
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage, false);
  }, [page, hasMore, loading, loadMovies]);

  return { movies, setMovies, genres, loading, error, loadMore, hasMore, catalogSource, page };
}
