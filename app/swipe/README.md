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

- Upstream: `hooks/`, `lib/`
- Downstream: none (entry layer)
