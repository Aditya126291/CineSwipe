# `app/swipe/` — Solo swipe

## Purpose

Single-player movie/web-series discovery with genre filters, daily limits, recommendation weights, and history.

## File

[`page.tsx`](page.tsx)

## Implementation contract

- Content types: `all` | `movie` | `tv`
- Free users: 30 swipes/day via `usePremium.incrementSwipeCount`
- Genre paywall: 4th+ genre requires premium (`GenreFilter` + upgrade prompt)
- Weights: `cineswipe-genre-weights`, updated on like/superlike, restored on undo

## Dependencies

| Hook / lib | Use |
| --- | --- |
| `useMovies` | Feed loading |
| `useSwipeDeck` | Index, history, undo |
| `usePremium` | Limits + checkout |
| `lib/recommendations` | Weight math |

## Known bugs

- Unused `loadMore` removed from destructuring (lint)
- Empty feed when all sources fail — should show error UI (optional improvement)

## Verification

- Visit `/swipe`, like/dislike/undo advances deck
- 31st swipe opens upgrade prompt for free user

## After successful execution

Update solo E2E rows in `Architecture.md`.
