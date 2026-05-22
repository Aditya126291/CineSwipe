# `app/room/` — Multiplayer routes

## Purpose

Route group for real-time room experiences. All multiplayer UX lives under the dynamic `[code]` segment.

## Files

| Path | Role |
| --- | --- |
| [`[code]/page.tsx`]([code]/page.tsx) | Lobby, nickname gate, swipe session, match modal |

## Implementation contract

- URL: `/room/{CODE}` where CODE is 6 alphanumeric (generated on host at home page).
- `shuffleSeed` for `useMovies` = room code (deterministic deck order for all members).
- Host vs guest: `isHostMode` from query or creation flow in page logic.

## Dependencies

- [`hooks/useRoom.ts`](../../hooks/useRoom.ts)
- [`components/RoomLobby.tsx`](../../components/RoomLobby.tsx), [`SwipeDeck.tsx`](../../components/SwipeDeck.tsx)

## Runtime modes

| Mode | Behavior |
| --- | --- |
| Mock | Polls `/api/rooms/{code}/sync` |
| Supabase | Realtime channel `cineswipe:room:{id}` |
| Fallback | `forceMockFallback` when Supabase network fails |

## Known bugs

- Guest 4+ capacity: must show error from API 403 or join validation
- Stale members: mock heartbeat timeout 6s in `mock-store`

## Verification

- Host + 2 guests → start session → all see swipe controls
- `npm test` / `tests/qa_e2e.js`

## After successful execution

Update `Architecture.md` `/room/[code]` row.
