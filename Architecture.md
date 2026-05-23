# CineSwipe — System Architecture & Technical Specifications

**Document Version:** 1.1.0  
**Last System Verification:** May 2026  
**Status:** Production-Ready  

---

## 1. System Overview & Core Goals

CineSwipe is a modern, premium web application designed to solve "decision fatigue" when choosing movies or TV shows. Users can discover content in two core modes:
1. **Solo Mode:** A highly personalized swipe deck that learns user interests in real-time through an adaptive, feedback-driven recommendation engine.
2. **Multiplayer Mode (Popcorn Swipe Party):** A real-time synchronized environment where multiple users join a shared room, swipe on the same deck, and instantly discover mutual matches.

The system is designed with a **privacy-first, self-hosted asset pipeline** that stores all movie metadata, watch providers, trailer links, and image assets locally or within your own cloud boundary. This bypasses external geo-blocking, eliminates third-party CDN dependencies, avoids TMDB image hash rotation bugs, and guarantees 100% compliance with open-source licensing.

---

## 2. Comprehensive Technology Stack

CineSwipe is engineered using a premium, decoupled architecture built upon the following technologies:

### 2.1 Core Framework & Frontend
* **Next.js 16.2.6 (App Router & Turbopack):** Selected for its high-performance compilation, nested route layouts, server components (RSC), server-side rendering, and low-latency Route Handlers.
* **React 19:** Utilizes advanced functional state hooks, effect synchronization, concurrent rendering features, and high-fidelity reference refs.
* **TypeScript:** Ensures complete system-wide type safety from database models down to React props.
* **Tailwind CSS v4:** Serves as the core styling framework. Leverages modern utility-first classes, custom color design tokens (Harmonious HSL dark mode), glassmorphism layers, and responsive mobile-first grid layouts.
* **Framer Motion:** Powers the card swipe deck with physics-based drag gestures, multi-directional card dismissals, subtle micro-animations, and 3D card-flipping transitions.
* **Canvas Confetti:** Delivers rich, premium visual feedback upon successfully matching titles in multiplayer sessions.

### 2.2 Backend, Real-Time Sync & Storage
* **Supabase PostgreSQL:** Represents the primary database. Stores the movie catalog, active rooms, room members, and individual swipes. Uses database constraints, Foreign Keys, and custom procedural functions to guarantee data integrity.
* **Supabase Realtime (Presence & Broadcast):** Utilized for multiplayer synchronization. Tracks member online states (Presence) and broadcasts instant events like swipe swipe states, superlike toast indicators, and match celebrations.
* **Supabase Storage (`posters` bucket):** Serves as a public bucket hosting self-hosted images. All movie poster backdrops and provider logos are stored directly in WebP, PNG, or SVG format to optimize network performance.
* **Durable In-Memory Mock Store (`lib/mock-store.ts`):** A custom-designed fallback store that hosts multiplayer room operations directly in Node.js process memory when Supabase is unconfigured, ensuring the app remains 100% functional offline or during local testing.

### 2.3 Payment Gateway
* **Razorpay Node.js SDK:** Handles premium integrations (`CineSwipe+`). Implements secure order pre-authorization, server-side cryptographic signature validation (SHA-256 HMAC), and automated sandbox mode fallback in non-production environments.

### 2.4 External Data Pipelines
* **TVMaze API:** Open-access television metadata integration (licensed under CC BY-SA) used to dynamically seed the database and fill feed requests to maintain an infinite scroll catalog.
* **TMDB API:** Serves as an API database standard for fallback metadata lookup and `/api/proxy-image` server-side validation.
* **Wikipedia Media API:** Leveraged as a public domain fallback database to resolve, download, and store high-quality posters for titles that are otherwise missing.
* **YouTube oEmbed API:** Scrapes and tests active YouTube trailer video IDs to guarantee that every trailer loaded in a flipped card is active, embeddable, and has valid thumbnails.

---

## 3. Application Routing & Directories

CineSwipe strictly implements the Next.js App Router convention:

```
c:\Users\Aditya Kumar\OneDrive\Desktop\CineSwipe\
├── .github/                     # GitHub Security Policies & Actions
│   ├── workflows/codeql.yml     # Static Analysis Code Scanning
│   ├── SECURITY.md              # Private Vulnerability Disclosures
│   └── dependabot.yml           # Automated Weekly Dependency Auditing
├── app/                         # App Router Directories
│   ├── api/                     # Backend Route Handlers
│   │   ├── catalog/             # Catalog Feed & Solo Card Selection Engine
│   │   ├── payment/             # Razorpay Order Creation & HMAC Verification
│   │   ├── proxy-image/         # Sanitized Image CDN Proxy
│   │   └── rooms/               # Heartbeat Sync & Mock Swipe Processing
│   ├── room/                    # Multiplayer Lobby & Synced Swipe Deck
│   ├── swipe/                   # Solo Personalized Swipe Deck
│   ├── upgrade/                 # Upgrade Checkout Panel (CineSwipe+)
│   ├── layout.tsx               # Root HTML and Custom Styling Wrapper
│   └── page.tsx                 # Home Hub page (Lobby, Nickname Selector)
├── components/                  # Presentational & Interactive UI Elements
├── hooks/                       # State Hooks (useRoom, useMovies, usePremium)
├── lib/                         # Core Recommendation logic, Database Schema, & Validation
└── tests/                       # Automated Playwright E2E and Weight Test Scripts
```

### Route Endpoint Specifications

| Endpoint | Method | Input Parameters | Processing & Output |
| --- | --- | --- | --- |
| `/api/catalog/feed` | `GET` | `mediaType`, `genreId`, `page`, `seed` | Fetches catalog list. Applies TVMaze filling streams if local database runs low. Shuffles results unless deterministic multiplayer `seed` is provided. |
| `/api/catalog/next-card` | `POST` | `mediaType`, `selectedGenreId`, `weights`, `seen[]`, `recent[]` | Core Solo Mode selection algorithm. Employs Roulette Wheel Selection on weights and filters seen IDs, applying clustering penalties before returning the optimal next card. |
| `/api/rooms` | `POST` | `code`, `userId`, `isPremium` | Creates in-memory room for local mock mode. Sets member limits based on premium status. |
| `/api/rooms/[code]/sync` | `POST` | `userId`, `username`, `avatarColor`, `action`, `swipe` | Multiplayer sync fallback. Registers heartbeats, starts active swipe sessions, processes user swipes, and executes undos. |
| `/api/proxy-image` | `GET` | `path`, `size` | Proxies external images securely. Restricts path traversals and limits sizes to standard allowed ranges. |
| `/api/payment/create-order` | `POST` | `amount`, `currency` | Pre-authorizes Razorpay order or returns mock orders in development. |
| `/api/payment/verify` | `POST` | `razorpay_signature`, `razorpay_order_id`, `razorpay_payment_id` | Verifies payments using SHA-256 HMAC or runs mock sandbox validation. |

---

## 4. The Database & Persistence Layer

CineSwipe maintains a decoupled data model to switch transparently between Supabase and local mock storage.

### 4.1 SQL Database Schema (`lib/supabase/schema.sql`)
1. **`users`:** Tracks member profiles, usernames, and synchronization flags.
2. **`rooms`:** Represents active sessions, mapping codes to creation times and host constraints.
3. **`room_members`:** Handles room presence, nickname associations, host flags, and active heartbeat intervals.
4. **`swipes`:** Statically records individual likes, dislikes, and superlikes, optimized with indices on composite keys: `(user_id, room_id, content_id)`.
5. **`movies_catalog`:** Houses the self-hosted movie and TV catalog, storing local poster URLs, Watch Provider JSON data, and embeddable YouTube trailer keys.

### 4.2 Local In-Memory Mock Store (`lib/mock-store.ts`)
* Implements a global `Map` nested under `global.mockRooms` that survives Hot Module Reload (HMR) during local development.
* Operates an automated member pruning service that monitors client heartbeat times. If a member (non-host) fails to sync within **6 seconds**, they are cleaned from the room members list to ensure match calculations do not block.

---

## 5. Dynamic Recommendation & Personalization Engine

The personalized swiping deck utilizes a hybrid recommendation pipeline built on a **probability simplex** to maintain a highly responsive, diverse, and engaging deck.

```
                  [ USER ACTION ]
                  /            \
           (Right Swipe)     (Left Swipe)
                /                \
        [LIKE_BOOST]      [DISLIKE_PENALTY]
           (+0.01)            (-0.015)
                \                /
             [rebalanceToSimplex]
             - Normalize sum to 1.0
             - Clamp weights [0.03, 0.28]
                        │
             [Roulette Wheel Pick]
                        │
           - Apply Sequel Penalties (-0.8)
           - Apply Clustering Penalties (-0.4)
                        ▼
                [ NEXT CARD ]
```

### 5.1 Real-Time Weight Modifiers
* **FLOOR (`0.03`):** No genre weight can drop below $3\%$. This ensures long-tail discovery and prevents a user from permanently burying a genre.
* **CAP (`0.28`):** No single genre can exceed $28\%$. This prevents a dominant genre from completely monopolizing the feed.
* **LIKE_BOOST (`+0.01`):** Liking a card gives the primary genre a gradual $1\%$ boost. Secondary genres receive a subtle $30\%$ boost ($+0.003$).
* **DISLIKE_PENALTY (`-0.015`):** Skip actions apply a gradual $-1.5\%$ downrank to prevent volatile feed shifts while responding to negative preferences.
* **CONTEXT_SWITCH_PENALTY (`-0.005`):** If a user shifts interest from their previously liked genre, the old genre is penalized by $-0.5\%$ to immediately redirect recommendations.

### 5.2 The Roulette Wheel & Anti-Sameyness Filters
1. **Roulette Wheel Selection:** The targeted genre is selected probabilistically based on active weights. If Action is $24\%$ and Romance is $6\%$, Action is $4\times$ more likely to be selected, but Romance still has a dynamic $6\%$ chance of appearing.
2. **Sequel / Season Repeat Penalty (Heavy: `-0.8`):** Compares titles with the last 3 swiped cards. If a candidate shares the same first word (e.g., *Iron Man 2* after *Iron Man*) or has significant overlap, it is penalized by `-0.8` to block consecutive sequels.
3. **Genre Clustering Penalty (Moderate: `-0.4`):** If the candidate's primary genre matches any genre from the last 2 swiped cards, it receives a `-0.4` penalty to prevent visual sameyness.

---

## 6. Real-Time Multiplayer Sync & Match Engine

Multiplayer rooms achieve high-efficiency cooperative matching:

### 6.1 State Sync Flow
* **Supabase Mode:** Utilizes Supabase Realtime broadcast channels to stream events (`swipe-action`, `undo-swipe-action`, `session-start`) with sub-100ms latency.
* **Mock Mode:** Employs a highly optimized client-side polling cycle (every 1.5 seconds) through `/api/rooms/[code]/sync` to track state changes.

### 6.2 Match Verification Algorithm
A match is verified instantly when a card receives positive feedback from all active members:
1. The system checks the `activeSwipes` list for the given `content_id`.
2. A match is declared if and only if **every active room member** has registered a `like` or `superlike` on that ID.
3. Once triggered, a matching event broadcasts to all participants, opening the Match Celebration modal with confetti while documenting the title in the room's **Movie Night Planner**.

---

## 7. Premium Subscriptions & Gateways (`CineSwipe+`)

Billing is integrated into the core experience to govern feature access cleanly.

### 7.1 Paywall Structures
* **Daily Swipe Cap:** Free-tier users are limited to **30 swipes per day**. Upon reaching the limit, the swipe deck freezes and opens the `UpgradePrompt` checkout.
* **Locked Genre Filters:** Free users can filter by the top 3 most popular genres. Selecting a 4th+ genre opens the premium payment dialog.
* **Superlikes:** Free users are restricted from performing superlikes.

### 7.2 Razorpay HMAC Signature Verification
To prevent spoofing or unauthorized premium bypasses:
1. The server pre-authorizes payment orders securely.
2. Upon checkout, the client returns payment metadata.
3. The server computes a cryptographic signature using **SHA-256 HMAC**:
   $$\text{Generated Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
4. The transaction is marked successful and local storage/database status is updated if and only if the generated signature matches the `razorpay_signature` received.

---

## 8. Integrated Quality Assurance & Scanning

To ensure enterprise-grade stability and reliability:
* **CodeQL Analysis:** Automates static analysis code scanning on every push to detect common security vulnerabilities, data leaks, and quality issues.
* **Dependabot Alerts:** Audits and alerts weekly on all NPM dependencies to prevent package-ecosystem supply chain vulnerabilities.
* **Playwright E2E:** Runs integrated headless tests verifying payment gateways, mock sync lobbies, member heartbeats, match declarations, and viewport constraints.
