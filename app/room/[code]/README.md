# `app/room/[code]/` — Room session page

## Purpose

Single page orchestrating nickname confirmation, lobby, active swipe deck, match celebration, and movie night planner.

## File

[`page.tsx`](page.tsx) — client component

## Implementation contract

### State flow

1. Load `useRoom(roomCode, username, avatarColor, isPremium, onMatch, isHostMode)`
2. Load `useMovies(mediaType, genreId, roomCode)` for shared deck
3. Wire `useSwipeDeck` with `sendSwipe` / `undoSwipe` from room hook
4. `MatchModal` + `MovieNightPlanner` on match

### Storage keys

- `cineswipe-user-id` (session)
- `cineswipe-username` (local)

### Match callback

`onMatch` must be stable or listed in `useRoom` effect deps — match detection uses `isRoomMatch` from [`lib/room-match.ts`](../../../lib/room-match.ts).

## Dependencies

See [`hooks/README.md`](../../../hooks/README.md), [`components/README.md`](../../../components/README.md).

## Known bugs

| Bug | Fix applied |
| --- | --- |
| Premature match after undo + re-like | `matchedTrackerRef.delete` on undo; per-member `isRoomMatch` |
| Superlike toast missing on guest | SwipeDeck shows toast for any `contentId` in deck list |
| Supabase blank page | `forceMockFallback` in `useRoom` |

## Verification

- Host undo → re-like → no match until all members like (`tests/qa_e2e.js`)
- Superlike visible on guest (`tests/qa_e2e_features.js`)

## After successful execution

Document E2E results in `Architecture.md` section 3.
