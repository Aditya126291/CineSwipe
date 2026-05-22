# `lib/supabase/` — Database

## Purpose

Supabase browser client, TypeScript types, and SQL schema for production multiplayer.

## Files

| File | Role |
| --- | --- |
| [`client.ts`](client.ts) | `supabase` instance, `hasSupabase()` |
| [`types.ts`](types.ts) | `Room`, `RoomMember`, `Swipe`, etc. |
| [`schema.sql`](schema.sql) | Tables, RLS, triggers, **`movies_catalog`** |

## `movies_catalog` (added 2026-05-21)

Required by [`hooks/useMovies.ts`](../../hooks/useMovies.ts). Columns: `id`, `title`, `overview`, `rating`, `media_type`, `genres[]`, `poster_url`, `providers` JSONB, etc.

**Deploy:** run full `schema.sql` in Supabase SQL editor on a fresh or migrated project.

## Realtime

- Publication includes `swipes`, `room_members`, `rooms`
- Client channel events: `swipe-action`, `undo-swipe-action`, `match-trigger`, `session-start`
- Match function: `check_room_match(room_id, content_id)`

## RLS

Permissive policies for hackathon-style demo; tighten for production.

## Known bugs

| Issue | Status |
| --- | --- |
| Catalog table missing | **Fixed** in schema.sql — must apply remotely |
| FK errors without user row | `useRoom` upserts `users` before join |

## Verification

- With env set: create room in Supabase mode from host flow
- Without env: `hasSupabase()` false → mock APIs only

## After successful execution

Update schema alignment note in `Architecture.md` failure #10.
