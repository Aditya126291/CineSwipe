# `components/` — UI

## Purpose

Presentational and interactive React components for swipe UX, lobby, premium prompts, and match flows.

## Files

| Component | Role |
| --- | --- |
| `SwipeDeck.tsx` | Framer drag deck, controls, live like counter, superlike toast |
| `MovieCard.tsx` | Poster, flip/trailer, provider icons |
| `RoomLobby.tsx` | Party code, member list, start session |
| `MatchModal.tsx` | Match celebration + confetti |
| `MovieNightPlanner.tsx` | Ranked matched titles |
| `GenreFilter.tsx` | Genre chips + premium lock |
| `SwipeHistory.tsx` | Past swipes drawer |
| `SwipeCounter.tsx` | Daily swipes remaining |
| `UpgradePrompt.tsx` | Paywall modal |
| `PremiumBadge.tsx` | Plus indicator |
| `ThemeToggle.tsx` | Light/dark |
| `ProviderIcons.tsx` | Streaming service logos |
| `AdBanner.tsx` | Free-tier ad slot |
| `SkeletonCard.tsx` | Loading placeholder |

## Accessibility / test IDs (`SwipeDeck`)

| Control | `data-testid` | `aria-label` |
| --- | --- | --- |
| Like | `swipe-like-button` | Like movie |
| Dislike | `swipe-dislike-button` | Dislike movie |
| Superlike | `swipe-superlike-button` | Superlike movie |
| Undo | `swipe-undo-button` | Undo last swipe |

E2E scripts still use `title="Like"` selectors — both work.

## Superlike toast

Listens for `window` event `cineswipe-superlike` with `{ username, contentId }`. Toast shows for any matching item in `movies` prop (not only active card).

## Known bugs

| Issue | Status |
| --- | --- |
| Superlike toast only on active card | **Fixed** |
| Icon-only buttons elsewhere | Add `aria-label` to `MovieCard` flip/trailer as needed |

## Verification

- Keyboard focus visible on control bar
- `tests/qa_e2e_features.js` superlike text `superliked this`

## After successful execution

Update a11y notes in `Architecture.md` failure #7.
