'use client';

import type { ContentItem } from './tmdb/types';

export interface GenreWeights {
  [genreId: number]: number; // Percentage as a decimal (e.g. 0.15 for 15%)
}

export interface RecommendationState {
  weights: GenreWeights;
  lastLikedGenre: number | null;
}

const FLOOR = 0.02; // 2% Minimum floor
const CAP = 0.25;   // 25% Maximum cap
const BOOST = 0.05; // 5% Growth logic

// Default genres supported in CineSwipe
export const SUPPORTED_GENRE_IDS = [
  28, 35, 18, 878, 53, 27, 10749, 16, 99, 14, 10765, 10759, 80, 9648
];

/**
 * Initializes the genre weights at a balanced state.
 * All genres start with an equal share, ensuring the sum is exactly 100%.
 */
export function initializeWeights(): GenreWeights {
  const N = SUPPORTED_GENRE_IDS.length;
  const initialWeight = 1.0 / N;
  const weights: GenreWeights = {};
  
  SUPPORTED_GENRE_IDS.forEach((id) => {
    weights[id] = initialWeight;
  });
  
  return weights;
}

/**
 * Calculates new genre reservations based on standard likes/superlikes.
 * Applies Floor limits, Cap limits, Context-Switch penalty, and Simplex Projection rebalancing.
 */
export function updateFeedWeights(
  state: RecommendationState,
  newLikedGenre: number
): RecommendationState {
  const currentWeights = { ...state.weights };
  const genres = Object.keys(currentWeights).map(Number);
  
  // Apply Context-Switch Penalty
  if (state.lastLikedGenre !== null && state.lastLikedGenre !== newLikedGenre) {
    // Deduct the 5% boost from the context-switched genre
    currentWeights[state.lastLikedGenre] = Math.max(
      FLOOR,
      (currentWeights[state.lastLikedGenre] || FLOOR) - BOOST
    );
  }

  // Apply growth (+5%) to the newly liked genre
  currentWeights[newLikedGenre] = Math.min(
    CAP,
    (currentWeights[newLikedGenre] || FLOOR) + BOOST
  );

  // Proportional Rebalancing (Box-Constrained Simplex Projection)
  let sum = genres.reduce((acc, g) => acc + currentWeights[g], 0);
  let iterations = 0;
  const maxIterations = 10;

  while (Math.abs(sum - 1.0) > 0.0001 && iterations < maxIterations) {
    const diff = 1.0 - sum;

    const adjustableGenres = genres.filter((g) => {
      if (diff > 0) return currentWeights[g] < CAP;
      return currentWeights[g] > FLOOR;
    });

    if (adjustableGenres.length === 0) break;

    const sumAdjustable = adjustableGenres.reduce((acc, g) => acc + currentWeights[g], 0);

    for (const g of adjustableGenres) {
      const proportion = currentWeights[g] / sumAdjustable;
      const adjustment = diff * proportion;
      currentWeights[g] = Math.min(CAP, Math.max(FLOOR, currentWeights[g] + adjustment));
    }

    sum = genres.reduce((acc, g) => acc + currentWeights[g], 0);
    iterations++;
  }

  // Final exact adjustment to clean up floating point anomalies
  sum = genres.reduce((acc, g) => acc + currentWeights[g], 0);
  if (Math.abs(sum - 1.0) > 0.000001) {
    const firstGenre = genres[0];
    currentWeights[firstGenre] = Math.min(CAP, Math.max(FLOOR, currentWeights[firstGenre] + (1.0 - sum)));
  }

  return {
    weights: currentWeights,
    lastLikedGenre: newLikedGenre,
  };
}

/**
 * Scores and ranks movies based on:
 * 1. Personalization: sum of genre weights matching the movie
 * 2. Popularity: normalized global trendiness score
 * 3. Serendipity/Entropy: slight randomized exploration factor (honoring the 2% floor)
 */
export function rankMovies(
  movies: ContentItem[],
  weights: GenreWeights
): ContentItem[] {
  return [...movies].sort((a, b) => {
    const scoreA = getMovieScore(a, weights);
    const scoreB = getMovieScore(b, weights);
    return scoreB - scoreA; // Descending score order
  });
}

function getMovieScore(movie: ContentItem, weights: GenreWeights): number {
  const genreIds = movie.genreIds || [];
  
  // Sum matched genre weights
  const matchedGenreWeight = genreIds.reduce((acc, gid) => {
    return acc + (weights[gid] || FLOOR);
  }, 0);

  // Normalize popularity (assuming base score is between 0 and 100, capped at 100)
  const normalizedPopularity = (movie.rating || 5) / 10; // Simple scale 0 to 1

  // Randomized Exploration Factor (honors the 2% floor for discovery)
  const randomFactor = Math.random() * 0.05; // 5% entropy maximum

  // Formula: 75% Personalization + 15% Trendiness + 10% Exploration
  return (matchedGenreWeight * 0.75) + (normalizedPopularity * 0.15) + (randomFactor * 0.10);
}
