import { tmdbFetch, getPosterUrl, getBackdropUrl, getProviderLogoUrl } from './client';
import type { Movie, MovieDetails, TMDBResponse, Genre, ContentItem } from './types';

export async function getPopularMovies(page = 1, genreId?: number): Promise<TMDBResponse<Movie>> {
  const params: Record<string, string> = {
    page: page.toString(),
    language: 'en-US',
    sort_by: 'popularity.desc',
  };
  if (genreId) params.with_genres = genreId.toString();

  return tmdbFetch<TMDBResponse<Movie>>('/discover/movie', params);
}

export async function getPopularTV(page = 1, genreId?: number): Promise<TMDBResponse<Movie>> {
  const params: Record<string, string> = {
    page: page.toString(),
    language: 'en-US',
    sort_by: 'popularity.desc',
  };
  if (genreId) params.with_genres = genreId.toString();

  return tmdbFetch<TMDBResponse<Movie>>('/discover/tv', params);
}

export async function getTrending(mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>(`/trending/${mediaType}/${timeWindow}`);
}

export async function getMovieDetails(id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<MovieDetails> {
  return tmdbFetch<MovieDetails>(`/${mediaType}/${id}`, {
    append_to_response: 'videos,watch/providers',
    language: 'en-US',
  });
}

export async function getTrailerKey(id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<string | null> {
  const details = await getMovieDetails(id, mediaType);
  const trailer = details.videos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser') && v.official
  ) || details.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  ) || details.videos?.results?.find(
    (v) => v.site === 'YouTube'
  );
  return trailer?.key || null;
}

export async function getWatchProviders(id: number, mediaType: 'movie' | 'tv' = 'movie', region = 'IN') {
  const details = await getMovieDetails(id, mediaType);
  const providers = details['watch/providers']?.results?.[region];
  return providers?.flatrate || [];
}

export async function getGenres(mediaType: 'movie' | 'tv' = 'movie'): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>(`/genre/${mediaType}/list`, { language: 'en-US' });
  return data.genres;
}

export function normalizeToContentItem(item: Movie, mediaType?: 'movie' | 'tv'): ContentItem {
  const type = mediaType || item.media_type || 'movie';
  const title = type === 'tv' ? (item.name || item.title) : item.title;
  const date = type === 'tv' ? (item.first_air_date || item.release_date) : item.release_date;

  return {
    id: item.id,
    title,
    overview: item.overview,
    posterUrl: getPosterUrl(item.poster_path),
    backdropUrl: getBackdropUrl(item.backdrop_path),
    releaseYear: date ? new Date(date).getFullYear().toString() : 'N/A',
    rating: Math.round(item.vote_average * 10) / 10,
    voteCount: item.vote_count,
    genreIds: item.genre_ids || [],
    mediaType: type,
    numberOfSeasons: item.number_of_seasons,
  };
}
