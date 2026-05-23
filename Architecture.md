# CineSwipe Architecture

Last verified: 2026-05-23

## 1. System Summary

CineSwipe is a production-ready Next.js 16.2.6 App Router application built with React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase, Razorpay, and Playwright. The product supports solo movie/web-series swiping, multiplayer room-based swiping, premium paywalls, streaming provider display, and a match planner.

The app supports two runtime modes:
- **Local/mock backend mode:** used when Supabase environment variables are absent. Multiplayer rooms use in-memory process state through `lib/mock-store.ts` and `/api/rooms/*`.
- **Supabase mode:** used whenever `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured. Client hooks then use Supabase tables plus Realtime presence and broadcast events.

The system features **100% self-hosted images and assets** stored directly in Supabase Storage, removing external runtime dependencies on the TMDB image CDN. This eliminates TMDB 404 image rotation bugs and bypasses geo-blocking, with a robust Wikipedia fallback data pipeline for legal compliance.

---

## 2. Application Architecture

### Routes and Pages

| Route | Type | Purpose |
| --- | --- | --- |
| `/` | Client page | Landing/lobby. Lets users choose solo mode, create a room, join a room, or upgrade. |
| `/swipe` | Client page | Solo swipe deck with content type filters, genre filters, history drawer, daily swipe limit, and premium prompts. |
| `/room/[code]` | Client page | Multiplayer room lobby and active swipe session. Uses room code as deterministic shuffle seed. |
| `/upgrade` | Client page | CineSwipe+ payment page and feature pitch. |
| `/api/catalog/feed` | Route handler | Fetches a batch feed of movies and TV shows for deterministic sorting (e.g., in room mode). |
| `/api/catalog/next-card` | Route handler | Probabilistic single-card recommendation selector for the Solo swipe queue. |
| `/api/rooms` | Route handler | Mock room lookup and creation. Used by local/mock room flow. |
| `/api/rooms/[code]/sync` | Route handler | Mock presence heartbeat, lobby/session state, swipe sync, undo, and active swipe map. |
| `/api/proxy-image` | Route handler | Proxies TMDB image paths with path and size validation. |
| `/api/payment/create-order` | Route handler | Creates Razorpay order, or returns a mock order when keys are missing. |
| `/api/payment/verify` | Route handler | Verifies Razorpay signature, or simulates success in non-production when secret is missing. |

### Client State and Hooks

* **`useMovies`:** Loads content. In Solo Mode, it calls `/api/catalog/next-card` to fetch the next highly personalized card dynamically. In Room Mode, it fetches batches from `/api/catalog/feed` and performs deterministic local sorting to keep all room members fully synchronized.
* **`useSwipeDeck`:** Owns solo deck active index, liked/disliked/superliked lists, and undo history.
* **`useRoom`:** Owns room lifecycle, user identity, members, active swipes, start-session state, match detection, Supabase Realtime, or mock polling.
* **`usePremium`:** Owns local premium state, daily swipe count, Razorpay checkout, and optional Supabase user profile sync.
* **`useTheme`:** Stores visual theme in local storage and toggles the root `dark` class.

### Data and Persistence

| Data | Storage |
| --- | --- |
| User id | Session storage key `cineswipe-user-id` |
| Username | Local storage key `cineswipe-username` |
| Premium flag | Local storage key `cineswipe-plus`, optionally mirrored to Supabase `users` |
| Daily swipe count | Local storage keys `cineswipe-swipe-date` and `cineswipe-swipe-count`, optionally mirrored to Supabase `users` |
| Recommendation weights | Local storage keys `cineswipe-genre-weights`, `cineswipe-last-liked-genre` |
| Mock rooms | Process memory via `global.mockRooms` |
| Supabase rooms | `users`, `rooms`, `room_members`, `swipes` tables in database schema |
| Movie catalog | Supabase table `movies_catalog` (storing full self-hosted metadata, posters, backdrops, and providers) |

### Recommendation and Personalization Engine

CineSwipe implements a highly responsive **Instagram-style feedback simplex** for real-time personalization:
* **Simplex weights:** Bounded by a long-tail floor (`0.03`) and a dominance cap (`0.28`), keeping the sum of all genre weights at exactly `1.0`.
* **Likes:** Right swipes increase the matched genre's weight by `+0.01` (primary genre) and `+0.003` (secondary genres).
* **Dislikes:** Left swipes act as a highly responsive negative signal, reducing the matched genre's weight by `-0.015` (primary genre).
* **Context switches:** If a user shifts interest from their previously liked genre, a subtle penalty of `-0.005` is applied to redirect recommendations immediately.
* **Solo deck queue:** The `/api/catalog/next-card` endpoint selects target genres probabilistically using **Roulette Wheel Selection** combined with media-type alternating, sequel repeat penalties (`-0.8`), and genre clustering penalties (`-0.4`) to maintain high feed diversity.

### External Integrations

* **TVMaze API:** Serves as a dynamic content filling stream under CC BY-SA license for never-ending scrolling catalog.
* **TMDB API:** Serves as the developer database standard for image proxy rendering.
* **Supabase:** Public client-side connection through `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for database and Realtime syncing.
* **Razorpay:** Client checkout through `NEXT_PUBLIC_RAZORPAY_KEY_ID` and server-side verification using `RAZORPAY_KEY_SECRET`.
