# CineSwipe Self-Hosted Movie Catalog & Assets

This directory contains the core logic for managing the movie and TV show catalog. All catalog data and assets are **100% self-hosted** in the Supabase PostgreSQL database and Supabase Storage. The application has **zero runtime dependencies on external TMDB APIs or CDNs**, resolving geo-restrictions, stale TMDB hash rotation bugs, and license compliance requirements.

---

## Architecture Overview

CineSwipe operates a simple, highly robust, single-source-of-truth data pipeline:

```
┌────────────────────────────────────────────────────────┐
│                     DATABASE                           │
│  Supabase PostgreSQL ('movies_catalog' table)          │
│  - Full metadata (titles, ratings, genres, overviews)  │
│  - Direct links to self-hosted assets in Storage       │
└───────────────────────────┬────────────────────────────┘
                            │
                            │  [useMovies.ts Hook]
                            ▼
┌────────────────────────────────────────────────────────┐
│                     FRONTEND                           │
│  - Swiping Deck, Movie Cards, & History                │
│  - Self-hosted posters served directly from Storage    │
└────────────────────────────────────────────────────────┘
```

### 1. The Single Source of Truth (`movies_catalog`)
All movie and TV series metadata reside in the `movies_catalog` PostgreSQL table:
- **`id`** (PK): The unique numeric content ID (retained from catalog standards).
- **`title`**: The display title of the movie or show.
- **`overview`**: A summary of the plot.
- **`media_type`**: `'movie'` or `'tv'`.
- **`release_year`**: The release year as a string.
- **`rating`**: Vote average.
- **`vote_count`**: Count of ratings.
- **`genres`**: Array of genre IDs.
- **`trailer_key`**: YouTube trailer video key.
- **`providers`**: JSON array of watch provider details, including self-hosted logo URLs and streaming deep links.
- **`poster_url`**: Direct public URL to the self-hosted poster in Supabase Storage.
- **`backdrop_url`**: Direct public URL to the self-hosted backdrop in Supabase Storage.

### 2. Self-Hosted Assets (`posters` Storage Bucket)
All poster images, backdrops, and provider logos are stored in the public `posters` storage bucket under your own Supabase domain:
```
https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/
```
Allowed MIME types are configured to support optimal, lightweight assets:
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/svg+xml` (for vector logos)

---

## Active Directory Map

- [`map-row.ts`](file:///c:/Users/Aditya%20Kumar/OneDrive/Desktop/CineSwipe/lib/catalog/map-row.ts) — maps database rows directly to frontend normalized `ContentItem` type definitions.
- [`preload.ts`](file:///c:/Users/Aditya%20Kumar/OneDrive/Desktop/CineSwipe/lib/catalog/preload.ts) — handles prefetching/warming the browser cache for upcoming card assets.
- [`images.ts`](file:///c:/Users/Aditya%20Kumar/OneDrive/Desktop/CineSwipe/lib/catalog/images.ts) — simple utility checking if a poster URL is missing.

---

## One-Time Migration and Patching

For reproducibility, two automated migration scripts are maintained in the [`scripts/`](file:///c:/Users/Aditya%20Kumar/OneDrive/Desktop/CineSwipe/scripts/) folder:

1. **[`migrate-posters.ts`](file:///c:/Users/Aditya%20Kumar/OneDrive/Desktop/CineSwipe/scripts/migrate-posters.ts)**
   Seeds the `movies_catalog` database table and attempts to download active assets, saving them directly into your Supabase Storage bucket.
2. **[`patch-failed-posters.ts`](file:///c:/Users/Aditya%20Kumar/OneDrive/Desktop/CineSwipe/scripts/patch-failed-posters.ts)**
   A patch migration that handles cases where external TMDB assets were broken/404. It downloads high-quality, verified Wikipedia public domain movie posters, backdrops, and SVG logos, uploads them to your Supabase `posters` bucket, and updates the database row references automatically.

---

## Key Benefits of the New Pipeline

1. **Zero Broken Placeholders:** Stale TMDB hash rotation 404s are completely eliminated since all images are stored statically under your own control.
2. **Offline-friendly and Resilient:** When Supabase is unreachable, the application shows a clean connection error page with a **Retry** CTA, preventing the display of generic/corrupted broken images.
3. **Tailored Local Compliance:** Bypasses geo-blocks in regions where TMDB domain endpoints are blocked.
4. **Improved Speed and Performance:** Reduces external DNS lookups and TLS handshakes by hosting images directly under your primary Supabase domain endpoint.
