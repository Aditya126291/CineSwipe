'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPopularMovies, getPopularTV, normalizeToContentItem, getGenres } from '@/lib/tmdb/movies';
import { getMockContent, MOCK_GENRES, seededRandom } from '@/lib/tmdb/mock-data';
import { hasTMDBKey, proxyImageUrl } from '@/lib/tmdb/client';
import { supabase, hasSupabase } from '@/lib/supabase/client';
import { initializeWeights, rankMovies } from '@/lib/recommendations';
import type { ContentItem, Genre } from '@/lib/tmdb/types';


export function useMovies(mediaType: 'movie' | 'tv' | 'all', genreId?: number, shuffleSeed?: string) {
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

  const rankFetchedMovies = useCallback((items: ContentItem[]) => {
    if (shuffleSeed) return items; // Keep sync order in multiplayer!
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

  const loadMovies = useCallback(async (pageNum: number, clear = false) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try to load from Supabase Curated Catalog (Commercial-friendly, fast, robust)
      if (hasSupabase()) {
        let query = supabase!.from('movies_catalog').select('*');
        if (mediaType !== 'all') {
          query = query.eq('media_type', mediaType);
        }
        if (genreId) {
          query = query.contains('genres', [genreId]);
        }

        const { data, error } = await query;
        
        if (!error && data && data.length > 0) {
          const fetched: ContentItem[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            overview: item.overview,
            rating: Number(item.rating),
            voteCount: item.vote_count,
            mediaType: item.media_type,
            releaseYear: item.release_year,
            posterUrl: proxyImageUrl(item.poster_url, 'w500'),
            backdropUrl: proxyImageUrl(item.backdrop_url, 'w1280'),
            genreIds: item.genres || [],
            trailerKey: item.trailer_key,
            providers: item.providers || []
          }));

          const ranked = rankFetchedMovies(fetched);

          if (shuffleSeed) {
            const rng = seededRandom(shuffleSeed + '_' + pageNum);
            const shuffled = [...ranked];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(rng() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setMovies((prev) => (clear ? shuffled : [...prev, ...shuffled]));
          } else {
            setMovies((prev) => (clear ? ranked : [...prev, ...ranked]));
          }
          return;
        }
      }

      // 2. Failover to TMDB if API key is active
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

        const ranked = rankFetchedMovies(fetched);

        if (shuffleSeed) {
          const rng = seededRandom(shuffleSeed + '_' + pageNum);
          const shuffled = [...ranked];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          setMovies((prev) => (clear ? shuffled : [...prev, ...shuffled]));
        } else {
          setMovies((prev) => (clear ? ranked : [...prev, ...ranked]));
        }
      } else {
        // 3. Fallback to local high-res curated static array
        const mockData = getMockContent(mediaType, genreId, shuffleSeed);
        const ranked = rankFetchedMovies(mockData);
        setMovies((prev) => (clear ? ranked : [...prev, ...ranked]));
      }
    } catch (err: any) {
      console.error('Failed to fetch movies, using static fallback:', err);
      const mockData = getMockContent(mediaType, genreId, shuffleSeed);
      const ranked = rankFetchedMovies(mockData);
      setMovies((prev) => (clear ? ranked : [...prev, ...ranked]));
    } finally {
      setLoading(false);
    }
  }, [mediaType, genreId, shuffleSeed, rankFetchedMovies]);

  // Reload movies when filters change or when shuffleSeed changes (important for lobby startup sync)
  useEffect(() => {
    setPage(1);
    loadMovies(1, true);
  }, [mediaType, genreId, shuffleSeed, loadMovies]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage, false);
  };

  return { movies, setMovies, genres, loading, error, loadMore };
}
