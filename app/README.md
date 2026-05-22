# `app/` — Next.js App Router

## Purpose

Hosts all user-facing routes, root layout, global styles, and Route Handlers under `app/api/`.

## Files and responsibilities

| File / folder | Type | Role |
| --- | --- | --- |
| [`layout.tsx`](layout.tsx) | Server layout | HTML shell, metadata, `globals.css`, dark theme default |
| [`globals.css`](globals.css) | Styles | Tailwind v4 tokens, animations |
| [`page.tsx`](page.tsx) | Client page | Landing: solo, host/join room, upgrade CTA |
| [`swipe/page.tsx`](swipe/page.tsx) | Client page | Solo swipe session |
| [`room/[code]/page.tsx`](room/[code]/page.tsx) | Client page | Multiplayer lobby + deck |
| [`upgrade/page.tsx`](upgrade/page.tsx) | Client page | CineSwipe+ marketing and checkout |
| [`api/`](api/README.md) | Route handlers | Rooms, payment, image proxy |

## Implementation contract

- Pages that use hooks/browser APIs must include `'use client'`.
- Dynamic segment `[code]` is normalized to uppercase in API and hooks.
- Root layout does **not** load Google Fonts (offline-friendly builds).

## Dependencies

- Upstream: `components/`, `hooks/`, `lib/`
- Downstream: none (entry layer)

## Runtime modes

Pages do not choose mock vs Supabase directly; [`hooks/useRoom.ts`](../hooks/useRoom.ts) and [`hooks/useMovies.ts`](../hooks/useMovies.ts) branch on env and `forceMockFallback`.

## Known bugs and errors

| Issue | Status / notes |
| --- | --- |
| Home join without server validation | Client should call `GET /api/rooms?code=` before navigate in mock mode |
| Blank room when Supabase unreachable | Mitigated: `useRoom` sets `forceMockFallback` on network errors |

## Optimal fix plan

1. Surface degraded-mode banner on room and swipe pages when `useRoom` / `useMovies` report fallback.
2. Add `data-testid` on home CTAs for stable E2E.
3. Keep layout free of network-only font loaders.

## Verification checklist

- [ ] `npm run build` includes all routes in output table
- [ ] `/`, `/swipe`, `/room/ABC123`, `/upgrade` render without console errors
- [ ] `npm run lint` clean for `app/**/*.tsx`

## After successful execution

Update `Architecture.md` route table and **Last verified** date.
