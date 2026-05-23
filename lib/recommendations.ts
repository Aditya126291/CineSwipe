'use client';

import type { ContentItem } from './types/content';

export interface GenreWeights {
  [genreId: number]: number;
}

export interface RecommendationState {
  weights: GenreWeights;
  lastLikedGenre: number | null;
}

/** Instagram-style: long-tail floor, cluster cap, smooth boosts, negative signals on skip */
const FLOOR = 0.03;
const CAP = 0.28;
const LIKE_BOOST = 0.01; // Gradual positive signal (reduced from 0.04)
const CONTEXT_SWITCH_PENALTY = 0.005; // Subtle context switch shift (reduced from 0.03)
const DISLIKE_PENALTY = 0.015; // Gradual negative signal (reduced from 0.06)

export const SUPPORTED_GENRE_IDS = [
  28, 35, 18, 878, 53, 27, 10749, 16, 99, 14, 10765, 10759, 80, 9648,
];

export function initializeWeights(): GenreWeights {
  const N = SUPPORTED_GENRE_IDS.length;
  const initialWeight = 1.0 / N;
  const weights: GenreWeights = {};
  SUPPORTED_GENRE_IDS.forEach((id) => {
    weights[id] = initialWeight;
  });
  return weights;
}

function rebalanceToSimplex(currentWeights: GenreWeights): GenreWeights {
  const genres = Object.keys(currentWeights).map(Number);
  let sum = genres.reduce((acc, g) => acc + currentWeights[g], 0);
  let iterations = 0;

  while (Math.abs(sum - 1.0) > 0.0001 && iterations < 12) {
    const diff = 1.0 - sum;
    const adjustableGenres = genres.filter((g) => {
      if (diff > 0) return currentWeights[g] < CAP;
      return currentWeights[g] > FLOOR;
    });
    if (adjustableGenres.length === 0) break;

    const sumAdjustable = adjustableGenres.reduce((acc, g) => acc + currentWeights[g], 0);
    for (const g of adjustableGenres) {
      const proportion = currentWeights[g] / sumAdjustable;
      currentWeights[g] = Math.min(CAP, Math.max(FLOOR, currentWeights[g] + diff * proportion));
    }
    sum = genres.reduce((acc, g) => acc + currentWeights[g], 0);
    iterations++;
  }

  sum = genres.reduce((acc, g) => acc + currentWeights[g], 0);
  if (Math.abs(sum - 1.0) > 0.000001) {
    const firstGenre = genres[0];
    currentWeights[firstGenre] = Math.min(CAP, Math.max(FLOOR, currentWeights[firstGenre] + (1.0 - sum)));
  }

  return currentWeights;
}

export function getSupportedGenreId(id: number): number {
  if (SUPPORTED_GENRE_IDS.includes(id)) return id;
  // Map TMDB Adventure (12) to Action & Adventure (10759)
  if (id === 12) return 10759;
  return id;
}

export function updateFeedWeights(
  state: RecommendationState,
  newLikedGenre: number
): RecommendationState {
  const currentWeights = { ...state.weights };
  const mappedLiked = getSupportedGenreId(newLikedGenre);

  if (state.lastLikedGenre !== null && state.lastLikedGenre !== mappedLiked) {
    currentWeights[state.lastLikedGenre] = Math.max(
      FLOOR,
      (currentWeights[state.lastLikedGenre] || FLOOR) - CONTEXT_SWITCH_PENALTY
    );
  }

  currentWeights[mappedLiked] = Math.min(
    CAP,
    (currentWeights[mappedLiked] || FLOOR) + LIKE_BOOST
  );

  return {
    weights: rebalanceToSimplex(currentWeights),
    lastLikedGenre: mappedLiked,
  };
}

export function updateFeedWeightsMultiple(
  state: RecommendationState,
  likedGenres: number[]
): RecommendationState {
  if (!likedGenres || likedGenres.length === 0) return state;

  const currentWeights = { ...state.weights };
  const primaryGenre = getSupportedGenreId(likedGenres[0]);

  if (state.lastLikedGenre !== null && state.lastLikedGenre !== primaryGenre) {
    currentWeights[state.lastLikedGenre] = Math.max(
      FLOOR,
      (currentWeights[state.lastLikedGenre] || FLOOR) - CONTEXT_SWITCH_PENALTY
    );
  }

  likedGenres.forEach((genreId, index) => {
    const mappedId = getSupportedGenreId(genreId);
    // Give primary genre full boost, others a 30% minor boost
    const boost = index === 0 ? LIKE_BOOST : LIKE_BOOST * 0.3;
    currentWeights[mappedId] = Math.min(
      CAP,
      (currentWeights[mappedId] || FLOOR) + boost
    );
  });

  return {
    weights: rebalanceToSimplex(currentWeights),
    lastLikedGenre: primaryGenre,
  };
}

/** Negative signal when user dislikes — similar to Instagram "not interested" downrank */
export function penalizeFeedWeights(state: RecommendationState, dislikedGenre: number): RecommendationState {
  const currentWeights = { ...state.weights };
  const mappedDisliked = getSupportedGenreId(dislikedGenre);
  currentWeights[mappedDisliked] = Math.max(
    FLOOR,
    (currentWeights[mappedDisliked] || FLOOR) - DISLIKE_PENALTY
  );
  return {
    weights: rebalanceToSimplex(currentWeights),
    lastLikedGenre: state.lastLikedGenre,
  };
}

export function penalizeFeedWeightsMultiple(
  state: RecommendationState,
  dislikedGenres: number[]
): RecommendationState {
  if (!dislikedGenres || dislikedGenres.length === 0) return state;

  const currentWeights = { ...state.weights };

  dislikedGenres.forEach((genreId, index) => {
    const mappedId = getSupportedGenreId(genreId);
    // Give primary genre full penalty, others a 40% minor penalty
    const penalty = index === 0 ? DISLIKE_PENALTY : DISLIKE_PENALTY * 0.4;
    currentWeights[mappedId] = Math.max(
      FLOOR,
      (currentWeights[mappedId] || FLOOR) - penalty
    );
  });

  return {
    weights: rebalanceToSimplex(currentWeights),
    lastLikedGenre: state.lastLikedGenre,
  };
}

function sessionEntropy(): number {
  if (typeof window === 'undefined') return Math.random() * 0.08;
  const day = new Date().toDateString();
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h << 5) - h + day.charCodeAt(i);
  const x = Math.sin(h) * 10000;
  return (x - Math.floor(x)) * 0.08;
}

export function rankMovies(movies: ContentItem[], weights: GenreWeights): ContentItem[] {
  const entropy = sessionEntropy();
  return [...movies].sort((a, b) => getMovieScore(b, weights, entropy) - getMovieScore(a, weights, entropy));
}

function getMovieScore(movie: ContentItem, weights: GenreWeights, entropy: number): number {
  const genreIds = movie.genreIds || [];
  
  // Use average matched weight to prevent multi-genre cards from dominating single-genre ones
  const matchedGenreWeight = genreIds.length > 0
    ? genreIds.reduce((acc, gid) => acc + (weights[getSupportedGenreId(gid)] || FLOOR), 0) / genreIds.length
    : FLOOR;

  const normalizedPopularity = Math.min(1, (movie.rating || 5) / 10);
  const voteBoost = Math.min(0.05, Math.log10((movie.voteCount || 1) + 1) / 50);

  // Multiplicative base guarantees that penalized genres stay at the bottom,
  // and highly rated/liked genres are prioritized correctly.
  return matchedGenreWeight * (1.0 + normalizedPopularity * 0.2 + voteBoost * 0.1) + entropy;
}
