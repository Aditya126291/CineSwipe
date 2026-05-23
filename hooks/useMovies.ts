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

// Persistent Seen List helper functions
export function getSeenMovieIds(): number[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('cineswipe-seen-ids');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveSeenMovieId(id: number) {
  if (typeof window === 'undefined') return;
  const seen = getSeenMovieIds();
  if (!seen.includes(id)) {
    seen.push(id);
    // Keep only the most recent 2000 seen IDs
    if (seen.length > 2000) {
      seen.shift();
    }
    localStorage.setItem('cineswipe-seen-ids', JSON.stringify(seen));
  }
}

export function removeSeenMovieId(id: number) {
  if (typeof window === 'undefined') return;
  const seen = getSeenMovieIds();
  const updated = seen.filter((x) => x !== id);
  localStorage.setItem('cineswipe-seen-ids', JSON.stringify(updated));
}

export function getStoredWeights() {
  if (typeof window === 'undefined') return initializeWeights();
  const stored = localStorage.getItem('cineswipe-genre-weights');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initializeWeights();
    }
  }
  return initializeWeights();
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

  // --- LOBBY/ROOM MODE: Batch-based deterministic fetching ---
  const shownMovieIdsRef = useRef<Set<number>>(new Set());

  const rankFetchedMovies = useCallback((items: ContentItem[]) => {
    if (shuffleSeed) return items;
    const weights = getStoredWeights();
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

      items.forEach((item) => shownMovieIdsRef.current.add(item.id));
      const hasTvmaze = items.some(item => item.id >= 2000000);
      setCatalogSource(hasTvmaze ? 'tvmaze' : 'supabase');
      setMovies((prev) => (clear ? output : [...prev, ...output]));
      setHasMore(items.length >= CATALOG_BATCH_SIZE);
    },
    [rankFetchedMovies, shuffleSeed]
  );

  const loadMoviesBatch = useCallback(
    async (pageNum: number, clear = false) => {
      if (loadingMoreRef.current && !clear) return;
      loadingMoreRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const finalItems: ContentItem[] = [];
        let currentPage = pageNum;
        let consecutiveEmptyAttempts = 0;

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
    [mediaType, genreId, shuffleSeed, finalizeBatch]
  );


  // --- SOLO SWIPE MODE: Dynamic single-card probabilistic queue ---
  const primeSoloQueue = useCallback(async (currentMediaType: 'movie' | 'tv' | 'all', currentGenreId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const initialList: ContentItem[] = [];
      const globalSeen = getSeenMovieIds();
      const weights = getStoredWeights();
      const recent: ContentItem[] = [];

      // Priming 4 disjoint cards in a loop
      for (let i = 0; i < 4; i++) {
        const res = await fetch('/api/catalog/next-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaType: currentMediaType,
            selectedGenreId: currentGenreId,
            weights,
            seen: [...globalSeen, ...initialList.map(item => item.id)],
            recent: recent.map(item => ({ id: item.id, title: item.title, genreIds: item.genreIds, mediaType: item.mediaType }))
          })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.card) {
          initialList.push(data.card);
          recent.unshift(data.card);
        }
      }

      setMovies(initialList);
      const hasTvmaze = initialList.some(item => item.id >= 2000000);
      setCatalogSource(hasTvmaze ? 'tvmaze' : 'supabase');
      setHasMore(true);
    } catch (err) {
      console.error('Failed to prime solo queue:', err);
      setError('Could not initialize movie feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNext = useCallback(async () => {
    try {
      const globalSeen = getSeenMovieIds();
      const weights = getStoredWeights();
      
      // Grab the last 3 cards as context for diversity check
      const recent = movies.slice(-3);

      const res = await fetch('/api/catalog/next-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType,
          selectedGenreId: genreId,
          weights,
          seen: [...globalSeen, ...movies.map(item => item.id)],
          recent: recent.map(item => ({ id: item.id, title: item.title, genreIds: item.genreIds, mediaType: item.mediaType }))
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.card) {
        setMovies((prev) => {
          // Double-check to avoid duplicate loads in client queue
          if (prev.some(item => item.id === data.card.id)) return prev;
          return [...prev, data.card];
        });
      }
    } catch (err) {
      console.error('Failed to fetch next dynamic card:', err);
    }
  }, [movies, mediaType, genreId]);


  // Initialize and reload feed when parameters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (shuffleSeed) {
        // Room sync determinism mode
        shownMovieIdsRef.current.clear();
        setPage(1);
        setHasMore(true);
        loadMoviesBatch(1, true);
      } else {
        // Real-time dynamic solo swipe mode
        primeSoloQueue(mediaType, genreId);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [mediaType, genreId, shuffleSeed, loadMoviesBatch, primeSoloQueue]);

  // Load more when reaching near the end (only for Room mode sync fallback)
  const loadMore = useCallback(() => {
    if (shuffleSeed) {
      if (!hasMore || loading) return;
      const nextPage = page + 1;
      setPage(nextPage);
      loadMoviesBatch(nextPage, false);
    }
  }, [page, hasMore, loading, loadMoviesBatch, shuffleSeed]);

  return { 
    movies, 
    setMovies, 
    genres, 
    loading, 
    error, 
    loadMore, 
    hasMore, 
    catalogSource, 
    page,
    fetchNext
  };
}
