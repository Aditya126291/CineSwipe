# `app/api/rooms/` — Mock room registry

## Purpose

In-memory room lookup and creation when Supabase is not configured.

## File

[`route.ts`](route.ts)

## Implementation contract

### `GET ?code=ABCDEF`

- 400 if missing/invalid format
- 404 if valid format but room missing
- 200 `{ exists: true, room }` if found

### `POST { code, userId, isPremium? }`

- Normalizes code to uppercase
- 400 invalid code
- 409 if room already exists
- Creates via `mockStore.createRoom` — `max_members` 10 if premium host else 3

## Dependencies

- [`lib/mock-store.ts`](../../../lib/mock-store.ts)
- [`lib/validation.ts`](../../../lib/validation.ts) — `isValidRoomCode`
