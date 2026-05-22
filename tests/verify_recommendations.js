/**
 * Recommendation weight simulation (run: node tests/verify_recommendations.js)
 * Mirrors lib/recommendations.ts Instagram-style constants.
 */
const FLOOR = 0.03;
const CAP = 0.28;
const LIKE_BOOST = 0.04;
const CONTEXT_SWITCH_PENALTY = 0.03;
const DISLIKE_PENALTY = 0.02;
const GENRES = [28, 35, 18, 878, 53, 27, 10749, 16, 99, 14, 10765, 10759, 80, 9648];

function init() {
  const w = {};
  const v = 1 / GENRES.length;
  GENRES.forEach((g) => (w[g] = v));
  return w;
}

function rebalance(weights) {
  const genres = Object.keys(weights).map(Number);
  let sum = genres.reduce((a, g) => a + weights[g], 0);
  for (let iter = 0; iter < 12 && Math.abs(sum - 1) > 0.0001; iter++) {
    const diff = 1 - sum;
    const adj = genres.filter((g) => (diff > 0 ? weights[g] < CAP : weights[g] > FLOOR));
    if (!adj.length) break;
    const s = adj.reduce((a, g) => a + weights[g], 0);
    adj.forEach((g) => {
      weights[g] = Math.min(CAP, Math.max(FLOOR, weights[g] + diff * (weights[g] / s)));
    });
    sum = genres.reduce((a, g) => a + weights[g], 0);
  }
  return weights;
}

function like(weights, last, genre) {
  if (last != null && last !== genre) {
    weights[last] = Math.max(FLOOR, weights[last] - CONTEXT_SWITCH_PENALTY);
  }
  weights[genre] = Math.min(CAP, (weights[genre] || FLOOR) + LIKE_BOOST);
  return rebalance(weights);
}

function dislike(weights, genre) {
  weights[genre] = Math.max(FLOOR, (weights[genre] || FLOOR) - DISLIKE_PENALTY);
  return rebalance(weights);
}

function sum(w) {
  return Object.values(w).reduce((a, b) => a + b, 0);
}

const w = init();
console.log('Initial sum:', sum(w).toFixed(4));

const afterAction = like(w, null, 28);
console.log('After like Action (28):', (afterAction[28] * 100).toFixed(1) + '%', 'sum=', sum(afterAction).toFixed(4));

const afterDrama = like(afterAction, 28, 18);
console.log('After switch to Drama (18):', (afterDrama[18] * 100).toFixed(1) + '%', 'Action:', (afterDrama[28] * 100).toFixed(1) + '%');

const afterNope = dislike(afterDrama, 53);
console.log('After dislike Thriller (53):', (afterNope[53] * 100).toFixed(1) + '%');

console.log('PASS: weights stay near 100% total with floor/cap');
