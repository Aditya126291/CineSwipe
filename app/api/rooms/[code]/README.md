# `app/api/rooms/[code]/` — Mock room sync

## Purpose

Heartbeat, member presence, session start, swipe recording, and undo for cooperative mock multiplayer.

## File

[`sync/route.ts`](sync/route.ts) — `POST /api/rooms/{code}/sync`

## Implementation contract

### Body (always)

- `userId` (required)
- `username`, `avatarColor`, `isPremium` (presence)

### Actions (`action` optional)

| action | Extra fields | Effect |
| --- | --- | --- |
| *(none)* | — | Join + heartbeat only |
| `start-session` | — | `isSwipingStarted = true` |
| `swipe` | `swipe: { contentId, mediaType, direction }`, `movie?` | Upsert swipe + store movie metadata |
| `undo-swipe` | `contentId` | Remove user's swipe for that content |

Invalid `action` → 400.

### Response

```json
{
  "room": {},
  "members": [],
  "activeSwipes": { "123": { "userId": { "direction": "like", "timestamp": 123 } } },
  "movies": {},
  "isSwipingStarted": false
}
```

### Capacity

- 403 if new member and `members.length >= max_members`
- Existing members may always heartbeat

## Dependencies

- [`lib/mock-store.ts`](../../../../lib/mock-store.ts) — `addSwipe` upserts per user+content
- Clients poll every 1.5s via [`hooks/useRoom.ts`](../../../../hooks/useRoom.ts)
