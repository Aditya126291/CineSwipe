# `hooks/` — Client state

## Purpose

React hooks encapsulating data fetching, room lifecycle, premium limits, theme, and solo deck state.

## Files

| File | Export | Responsibility |
| --- | --- | --- |
| [`useMovies.ts`](useMovies.ts) | `useMovies` | Catalog: Supabase → TVMaze; ranking |
| [`useRoom.ts`](useRoom.ts) | `useRoom` | Multiplayer join, sync, swipes, matches |
| [`usePremium.ts`](usePremium.ts) | `usePremium` | Premium flag, daily swipes, Razorpay |
| [`useSwipeDeck.ts`](useSwipeDeck.ts) | `useSwipeDeck` | Solo index, history, undo |
| [`useTheme.ts`](useTheme.ts) | `useTheme` | Dark/light on `<html>` |

## `useRoom` implementation contract

**Inputs:** `roomCode`, `username`, `avatarColor`, `isPremiumUser`, `onMatch`, `isHostMode`

**Outputs:** `room`, `members`, `activeSwipes`, `sendSwipe`, `undoSwipe`, `startSession`, `loading`, `error`, …

**Modes:**

```ts
const isLocalMock = !hasSupabase() || !supabase || forceMockFallback;
```

On Supabase network failure → `setForceMockFallback(true)` and user-facing error string.

**Match rule:** [`lib/room-match.ts`](../lib/room-match.ts) `isRoomMatch` — every member must have `like` or `superlike` on content.

**Undo:** clears `matchedTrackerRef` for content id.

## `useMovies` contract

Precedence: `movies_catalog` → TVMaze filling stream. Uses `shuffleSeed` to skip ranking shuffle in rooms.
