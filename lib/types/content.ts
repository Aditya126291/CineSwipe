export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  media_type: 'movie' | 'tv';
  // TV series specific
  name?: string;
  first_air_date?: string;
  number_of_seasons?: number;
}

export interface MovieDetails extends Movie {
  runtime: number | null;
  genres: Genre[];
  videos: {
    results: Video[];
  };
  ['watch/providers']?: WatchProviderResponse;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderResponse {
  results: Record<string, {
    link?: string;
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
  }>;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Normalized content item used in the app
export interface ContentItem {
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  releaseYear: string;
  rating: number;
  voteCount: number;
  genreIds: number[];
  mediaType: 'movie' | 'tv';
  trailerKey?: string;
  providers?: {
    name: string;
    logoUrl: string;
    link?: string;
  }[];
  numberOfSeasons?: number;
}
