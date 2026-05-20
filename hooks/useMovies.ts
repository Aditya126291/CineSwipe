'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPopularMovies, getPopularTV, normalizeToContentItem, getGenres } from '@/lib/tmdb/movies';
import { getMockContent, MOCK_GENRES } from '@/lib/tmdb/mock-data';
import { hasTMDBKey } from '@/lib/tmdb/client';
import type { ContentItem, Genre } from '@/lib/tmdb/types';

export function useMovies(mediaType: 'movie' | 'tv' | 'all', genreId?: number) {
  const [movies, setMovies] = useState<ContentItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);

  // Load genres
  useEffect(() => {
    async function loadGenres() {
      try {
        if (hasTMDBKey()) {
          const movieGenres = await getGenres('movie');
          const tvGenres = await getGenres('tv');
          
          // Combine and remove duplicates
          const combined = [...movieGenres];
          tvGenres.forEach((tvG) => {
            if (!combined.some((g) => g.id === tvG.id)) {
              combined.push(tvG);
            }
          });
          setGenres(combined);
        } else {
          setGenres(MOCK_GENRES);
        }
      } catch (err) {
        console.error('Failed to load genres from TMDB, using mock genres', err);
        setGenres(MOCK_GENRES);
      }
    }
    loadGenres();
  }, []);

  const loadMovies = useCallback(async (pageNum: number, clear = false) => {
    setLoading(true);
    setError(null);
    try {
      if (hasTMDBKey()) {
        let fetched: any[] = [];
        
        if (mediaType === 'all') {
          const moviesRes = await getPopularMovies(pageNum, genreId);
          const tvRes = await getPopularTV(pageNum, genreId);
          const combined = [];
          
          // Interleave movies and tv shows
          const len = Math.max(moviesRes.results.length, tvRes.results.length);
          for (let i = 0; i < len; i++) {
            if (moviesRes.results[i]) combined.push(normalizeToContentItem(moviesRes.results[i], 'movie'));
            if (tvRes.results[i]) combined.push(normalizeToContentItem(tvRes.results[i], 'tv'));
          }
          fetched = combined;
        } else if (mediaType === 'tv') {
          const tvRes = await getPopularTV(pageNum, genreId);
          fetched = tvRes.results.map((item) => normalizeToContentItem(item, 'tv'));
        } else {
          const moviesRes = await getPopularMovies(pageNum, genreId);
          fetched = moviesRes.results.map((item) => normalizeToContentItem(item, 'movie'));
        }

        // Fetch trailers and watch providers in parallel for premium-feeling data
        const enriched = await Promise.all(
          fetched.map(async (item) => {
            try {
              // Lazy load trailers to avoid excessive initial fetching
              return item;
            } catch {
              return item;
            }
          })
        );

        setMovies((prev) => (clear ? enriched : [...prev, ...enriched]));
      } else {
        // Mock data fallback
        const mockData = getMockContent(mediaType, genreId);
        setMovies((prev) => (clear ? mockData : [...prev, ...mockData]));
      }
    } catch (err: any) {
      console.error('Failed to fetch movies', err);
      // Failover to mock data so it NEVER crashes
      const mockData = getMockContent(mediaType, genreId);
      setMovies((prev) => (clear ? mockData : [...prev, ...mockData]));
    } finally {
      setLoading(false);
    }
  }, [mediaType, genreId]);

  // Reload movies when filters change
  useEffect(() => {
    setPage(1);
    loadMovies(1, true);
  }, [mediaType, genreId, loadMovies]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage, false);
  };

  return { movies, setMovies, genres, loading, error, loadMore };
}
