# `public/` — Static assets

## Purpose

Files served at site root (`/file.svg`, `/manifest.json`, etc.).

## Files

| File | Role |
| --- | --- |
| `manifest.json` | PWA metadata (referenced in root layout) |
| `poster-placeholder.svg` | Fallback poster |
| `favicon.ico` | App icon (if present) |
| `*.svg` | Marketing / template assets |

## Implementation contract

- Paths in code use leading slash: `/manifest.json`
- Razorpay checkout uses `/favicon.ico` as checkout image

## Verification

- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/manifest.json` → 200

## After successful execution

No Architecture change unless PWA config changes.
