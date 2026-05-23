# `lib/` — Shared logic

## Purpose

Framework-agnostic utilities, validation, mock multiplayer store, recommendations, and integration clients.

## Modules

| Path | Role |
| --- | --- |
| [`validation.ts`](validation.ts) | Room codes, payment body validation, sandbox detection |
| [`room-match.ts`](room-match.ts) | `isRoomMatch(activeSwipes, contentId, memberIds)` |
| [`mock-store.ts`](mock-store.ts) | In-memory rooms for dev/mock API |
| [`recommendations.ts`](recommendations.ts) | Genre weight init/update/rank |
| [`storage.ts`](storage.ts) | `safeStorage` / `safeSessionStorage` fallbacks |
| [`supabase/`](supabase/README.md) | DB client, types, schema |
| [`tmdb/`](tmdb/README.md) | TMDB API + image proxying |

## `mock-store` contract

- Global `Map` on `global.mockRooms` — survives hot reload in dev, lost on process exit
- `cleanInactiveMembers`: 6s heartbeat timeout (non-host)
- `addSwipe`: upsert by `(user_id, content_id)`

## Dependencies

Imported by `app/api/*`, `hooks/*`, and some `components/*`.
