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

## Known bugs

| Issue | Status |
| --- | --- |
| Single-char codes accepted | **Fixed** |
| Duplicate host overwrite | **Fixed** (409) |

## Verification

```bash
curl -s -X POST http://localhost:3000/api/rooms -H "Content-Type: application/json" \
  -d '{"code":"TEST01","userId":"00000000-0000-4000-8000-000000000001"}'
```

## After successful execution

Update `Architecture.md` mock room API notes.
