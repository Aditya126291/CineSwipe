# CineSwipe Architecture and QA Stress Plan

Last verified: 2026-05-21

## 1. Current System Summary

CineSwipe is a Next.js 16.2.6 App Router application built with React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase, Razorpay, and Playwright. The product supports solo movie/web-series swiping, multiplayer room-based swiping, premium paywalls, streaming provider display, and a match planner.

The app currently has two runtime personalities:

- **Local/mock backend mode:** used when Supabase public environment variables are absent. Multiplayer rooms use in-memory process state through `lib/mock-store.ts` and `/api/rooms/*`.
- **Supabase mode:** used whenever `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist. Client hooks then use Supabase tables plus Realtime presence and broadcast events.

Important verified behavior: the project runs in development at `http://localhost:3000`. Production build passes without Google Fonts (layout uses system/Tailwind fonts). Lint passes with **0 errors** (warnings only). Each major folder has an agent-oriented `README.md`.

## 2. Application Architecture

### Routes and Pages

| Route | Type | Purpose |
| --- | --- | --- |
| `/` | Client page | Landing/lobby. Lets users choose solo mode, create a room, join a room, or upgrade. |
| `/swipe` | Client page | Solo swipe deck with content type filters, genre filters, history drawer, daily swipe limit, and premium prompts. |
| `/room/[code]` | Client page | Multiplayer room lobby and active swipe session. Uses room code as deterministic shuffle seed. |
| `/upgrade` | Client page | CineSwipe+ payment page and feature pitch. |
| `/api/rooms` | Route handler | Mock room lookup and creation. Used by local/mock room flow. |
| `/api/rooms/[code]/sync` | Route handler | Mock presence heartbeat, lobby/session state, swipe sync, undo, and active swipe map. |
| `/api/proxy-image` | Route handler | Proxies TMDB image paths with path and size validation. |
| `/api/payment/create-order` | Route handler | Creates Razorpay order, or returns a mock order when keys are missing. |
| `/api/payment/verify` | Route handler | Verifies Razorpay signature, or simulates success in non-production when secret is missing. |

### Client State and Hooks

- `useMovies` loads content from Supabase `movies_catalog`, then TMDB, then local mock content. It ranks solo feeds using local recommendation weights unless a multiplayer shuffle seed is provided.
- `useSwipeDeck` owns solo deck index, liked/disliked/superliked lists, and undo history.
- `useRoom` owns room lifecycle, user identity, members, active swipes, start-session state, match detection, Supabase Realtime, or mock polling.
- `usePremium` owns local premium state, daily swipe count, Razorpay checkout, and optional Supabase user profile sync.
- `useTheme` stores visual theme in local storage and toggles the root `dark` class.

### Data and Persistence

| Data | Current storage |
| --- | --- |
| User id | Session storage key `cineswipe-user-id`. |
| Username | Local storage key `cineswipe-username`. |
| Premium flag | Local storage key `cineswipe-plus`, optionally mirrored to Supabase `users`. |
| Daily swipe count | Local storage keys `cineswipe-swipe-date` and `cineswipe-swipe-count`, optionally mirrored to Supabase `users`. |
| Recommendation weights | Local storage keys `cineswipe-genre-weights`, `cineswipe-last-liked-genre`, and undo stack. |
| Mock rooms | Process memory via `global.mockRooms`; lost on server restart. |
| Supabase rooms | `users`, `rooms`, `room_members`, `swipes` from `lib/supabase/schema.sql`. |
| Movie catalog | Supabase table `movies_catalog` defined in `lib/supabase/schema.sql` (apply in Supabase SQL editor). |

### External Integrations

- **TMDB:** content discovery and image metadata through `NEXT_PUBLIC_TMDB_API_KEY`; images route through `/api/proxy-image`.
- **Supabase:** public client-side connection through `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Razorpay:** client checkout through `NEXT_PUBLIC_RAZORPAY_KEY_ID`; server verification through `RAZORPAY_KEY_SECRET`.
- **Google Fonts:** `next/font/google` fetches Geist and Geist Mono at build time.

## 3. Verified QA Observations

### Commands Run

| Check | Result |
| --- | --- |
| `npm run dev` | Pass. App starts at `http://localhost:3000`. |
| Browser homepage load | Pass. Landing page renders expected CTA surface. |
| API smoke/stress tests | Mixed. Several validation failures listed below. |
| `npm run lint` | Pass. 0 errors, ~22 warnings (unused vars / hook deps). |
| `npm run build` | Pass. All routes compile (no Google Fonts dependency). |
| `npm test` (Playwright scripts) | Partial. Requires `npm run dev` + `npx playwright install chromium`. E2E guest-join timeout observed 2026-05-21 — see `tests/README.md`. |

### High-Risk Failures Found

1. **Supabase environment keys disable mock fallback even when Supabase is unreachable.**
   - Observed: `.env.local` activates Supabase mode. In the restricted test environment, Supabase fetches fail with `TypeError: Failed to fetch`.
   - Impact: room pages can become blank or stuck; solo content may not fall back to mock data soon enough when catalog/TMDB fetches are blocked.
   - Solution: add a health-aware data provider layer. If Supabase requests fail with network errors, fall back to mock/local mode for the current session and surface a friendly degraded-mode state.

2. **Payment verification accepts empty payloads in development.** — **Resolved 2026-05-21** (`lib/validation.ts`, required fields + sandbox signature).
3. **Mock room API accepts invalid room codes.** — **Resolved** (`^[A-Z0-9]{6}$` in rooms + sync routes).
4. **Duplicate mock room creation overwrites rooms.** — **Resolved** (HTTP 409).
5. **Mock sync accepts unknown actions.** — **Resolved** (`VALID_ACTIONS` → 400).
6. **Mock payment order accepts invalid amount/currency.** — **Resolved** (create-order validation).

7. **Automated UI selectors are weak for swipe controls.**
   - Observed: icon-only buttons rely on `title`, not `aria-label` or test ids.
   - Impact: accessibility and stable automation both suffer.
   - Solution: add explicit `aria-label` and `data-testid` to controls such as like, dislike, superlike, undo, flip, and history.

8. **Lint is not release-clean.**
   - Observed: strict TypeScript and React hook rules fail across API routes, hooks, components, and CommonJS test scripts.
   - Impact: CI cannot safely use lint as a quality gate.
   - Solution: type API payloads and Realtime payloads, remove unused imports, fix hook dependency/state rules, and either convert test scripts to ESM or exclude legacy ad-hoc scripts from app lint.

9. **Offline builds depend on Google Fonts network availability.**
   - Observed: `next build` fails without network access due `next/font/google`.
   - Impact: CI, restricted environments, and reproducible builds are fragile.
   - Solution: self-host fonts with `next/font/local` or commit approved font assets.

10. **Schema and app expectations are misaligned.**
    - Observed: app queries `movies_catalog`, but `lib/supabase/schema.sql` does not define it.
    - Impact: Supabase-backed content can silently fail and fall back unpredictably.
    - Solution: add `movies_catalog` schema, seed strategy, indexes, and provider/trailer fields; or remove the Supabase catalog branch.

## 4. Comprehensive Test Suite

The following test suite should be implemented as automated tests after the architecture fixes. Each test must assert behavior, not only rendering.

### Unit Tests

| Test | Setup | Input | Expected behavior | Failure condition |
| --- | --- | --- | --- | --- |
| Recommendation weights initialize to 1.0 total | Import recommendation helpers | No input | All supported genres exist; total weight is exactly 1.0 within tolerance | Missing genre, NaN, or total drifts from 1.0 |
| Like updates genre weights within floor/cap | Start from `initializeWeights()` | Like Action, then Drama | New genre increases, previous liked genre is penalized, all weights stay between floor/cap | Any weight below floor, above cap, or total not near 1.0 |
| Ranking prioritizes weighted genres | Fixed movie list and deterministic Math.random mock | Weights favor Sci-Fi | Sci-Fi titles sort ahead of unrelated titles with comparable rating | Ranking ignores genre weights |
| `safeStorage` falls back on thrown localStorage | Mock localStorage methods to throw | set/get/remove | Memory fallback stores and retrieves values without crashing | Any storage exception escapes |
| `useSwipeDeck` records and undoes | Hook test with 3 content items | like, dislike, undo | Index, history, liked/disliked lists transition correctly | Undo restores wrong item or index |
| `usePremium` enforces free swipe limit | Hook test with local storage reset | 31 increments | First 30 allowed; 31st rejected; premium bypasses limit | Free user can exceed limit or premium is blocked |
| Room code validator rejects malformed codes | Pure validation helper | empty, `ABC`, `<BAD>`, `ABC123` | Only six uppercase alphanumeric codes pass | Backend accepts non-contract room code |
| Payment payload validator rejects invalid inputs | Pure validation helper | missing ids, negative amount, bad currency | Invalid payloads return validation errors before provider calls | Mock or real payment accepts impossible payload |

### Integration/API Tests

| Test | Setup | Input | Expected behavior | Failure condition |
| --- | --- | --- | --- | --- |
| Create mock room with valid code | Empty mock store | `POST /api/rooms` with `ABC123` | 201 or 200 with active room, max 3 for free host | Missing room, wrong max, or non-normalized code |
| Reject invalid room create | Empty mock store | code `A`, `<BAD>`, `ABC-12` | 400 with validation message | Any invalid code creates room |
| Reject duplicate active room | Existing `ABC123` | Create `ABC123` again | 409 Conflict; original room unchanged | Host/capacity overwritten |
| Room lookup validates code | Mock store seeded | lookup invalid and unknown code | invalid returns 400, unknown valid returns 404 | Invalid and unknown collapse into same state |
| Sync joins existing room | Existing room | no action, valid member payload | Member list includes user and heartbeat updates | User not added or room mutates unexpectedly |
| Sync rejects unknown action | Existing room | `action: "explode"` | 400; room state unchanged | Returns 200 or changes state |
| Capacity enforcement | Free room with 3 members | Fourth unique user joins | 403 Room full | Fourth user appears in members |
| Existing member can re-heartbeat full room | Full room | Existing member syncs | 200 and heartbeat updates | Existing member blocked |
| Swipe duplicate prevention | Existing room | Same user swipes same content twice | One swipe stored or second updates same record intentionally | Duplicate like counts inflate match |
| Undo removes only current user's swipe | Two users swiped same content | User A undo | User B swipe remains | Undo removes all users or wrong content |
| Match detection requires all active members | Three members | Two likes, one missing | No match | Premature match modal/event |
| Superlike counts as positive like | Three members | Two likes and one superlike | Match triggers once | No match or duplicate match |
| Image proxy rejects unsafe path | No external network required | `../`, full URL, invalid size | 400 | SSRF/path traversal request attempted |
| Image proxy caches valid TMDB path | Network mocked | valid path and size | content type preserved; cache headers set | Bad cache header or content type |
| Payment create validates amount | Missing Razorpay keys | negative amount or bad currency | 400 | Mock order created |
| Payment verify validates required fields | Missing Razorpay secret | `{}` | 400 | Sandbox success |
| Supabase unreachable fallback | Supabase env set, network fails | load movies or room | local/mock fallback with user-facing degraded message | blank screen, stuck loader, or unhandled console error |

### End-to-End Tests

| Test | Setup | Input | Expected behavior | Failure condition |
| --- | --- | --- | --- | --- |
| Home navigation smoke | Dev server running | Visit `/` | Home title, solo CTA, multiplayer CTA, upgrade CTA render | Missing primary CTA or console crash |
| Solo deck happy path | Mock content forced or network mocked | Visit `/swipe`, click like/dislike/undo | Card advances and undo restores; counter updates | Empty deck, wrong counter, undo broken |
| Free user limit | Local storage reset | Swipe 30 times, then 31st | 31st opens upgrade prompt and does not advance card | Free user gets unlimited swipes |
| Premium bypass | Local storage premium true | Swipe beyond free limit | No upgrade prompt; deck advances | Premium user blocked |
| Locked genre paywall | Free user | Click fourth+ genre | Upgrade prompt opens; selected genre unchanged | Locked filter applies without premium |
| Flip card behavior | Card with trailer key | Flip card, interact with trailer, try drag | Drag disabled while flipped; flip back restores drag | Video interaction throws card or drag remains disabled |
| Room host creates lobby | Mock mode or healthy Supabase | Host room | Six-character code shown; host appears as member | Invalid code, missing host, or stuck loader |
| Guest joins valid room | Existing room | Guest enters code | Guest reaches nickname/lobby and appears to host | Guest rejected or host list stale |
| Guest rejects invalid room | No room | Guest enters valid unknown code | Clear room-not-found error | Navigates to broken room |
| Free room capacity | Free host + 2 guests | Fourth guest joins | Fourth user is rejected with clear full-room message | Fourth joins or blank error |
| Host starts session | Host + guests in lobby | Host clicks start | All clients enter swipe deck | Guests remain waiting |
| Match flow | Three members | All like same card | One match modal appears on all clients; planner records title | Duplicate modal, missing modal, or planner missing item |
| Premature match guard | Three members | Host like, undo, host like again | No match until other members like | Duplicate host actions trigger match |
| Superlike broadcast | Premium host and guests | Host superlikes | Guests see superlike toast; match logic counts it | Toast missing or match double-counts |
| Room polling cleanup | Guest closes tab | Wait heartbeat timeout | Guest removed from mock member list; host remains | Stale guest blocks matching |
| Supabase mode smoke | Real test Supabase project | Create, join, start, swipe | Presence/broadcast works without mock APIs | Realtime messages or DB persistence fail |
| Mobile viewport layout | 390x844 viewport | Home, swipe, room, upgrade | No clipped controls; card fits; buttons reachable | Text overlap, offscreen controls, blocked CTA |
| Desktop viewport layout | 1440x900 viewport | Same routes | Content centered; cards do not stretch poster images | Poster distortion or unusable spacing |
| Offline asset resilience | Block fonts/TMDB/images | Build/run app | Local fonts and placeholder images keep app usable | Build failure or broken image layout |

## 5. Implementation Plan and Product Improvements

### P0: Make Runtime Reliable

- Add shared validation for room codes, sync actions, swipe payloads, and payment payloads.
- Fix Supabase/mock selection so network failures trigger graceful fallback instead of blank pages.
- Add `movies_catalog` schema or remove the Supabase catalog branch; make data source precedence explicit.
- Make payment mock mode safe: validate fields first and require recognizable sandbox values.
- Add error states for empty movie feeds, failed room connection, and degraded offline mode.

### P1: Make Quality Gates Trustworthy

- Fix all lint errors: typed errors, typed Realtime payloads, no explicit `any`, hook dependency hygiene, and unused imports.
- Add a real test setup: Vitest for unit tests, Playwright API/UI tests, and a stable `npm test` script.
- Add `data-testid` and `aria-label` on all icon-only controls and critical UI states.
- Self-host fonts to make builds reproducible without Google Fonts network access.

### P2: Improve Product Behavior

- Move room creation from client-only random generation to server/API generation with collision retries.
- Preserve room state across server restarts by using Supabase or a durable local adapter instead of memory-only mock state.
- Enrich content details lazily: fetch trailer/provider details when a card becomes active rather than for every feed item.
- Add user-visible provider status: "live catalog", "TMDB fallback", or "offline sample catalog" so degraded mode feels intentional.
- Improve premium enforcement by making server-side checks authoritative for room capacity and premium-only actions.
- Add analytics-friendly events for room create, join, start, swipe, match, paywall open, and payment result.

### Acceptance Criteria

- `npm run lint` passes with zero errors.
- `npm run build` passes without external font network access.
- API tests reject malformed rooms, malformed payments, duplicate room creation, invalid sync actions, and unsafe image paths.
- E2E tests pass in mock mode and in a configured Supabase test environment.
- If Supabase or TMDB is unavailable, users see a working fallback or clear error state, never a blank page.
- The documentation remains aligned with code: routes, storage, environment variables, fallback behavior, schema requirements, and QA commands are all current.
