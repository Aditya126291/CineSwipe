# `app/api/` — Route Handlers

## Purpose

Server-side HTTP endpoints for mock multiplayer, payments, and TMDB image proxying.

## Subfolders

| Path | README |
| --- | --- |
| [`payment/`](payment/README.md) | Razorpay create + verify |
| [`proxy-image/`](proxy-image/README.md) | TMDB image CDN proxy |
| [`rooms/`](rooms/README.md) | Mock room CRUD |
| [`rooms/[code]/`](rooms/[code]/README.md) | Mock sync / swipes |

## Shared validation

Use [`lib/validation.ts`](../../lib/validation.ts):

- `isValidRoomCode(code)` → `^[A-Z0-9]{6}$`
- `validatePaymentVerifyBody(body)`
- `isSandboxPayment(body)` for dev-only mock verify

Match logic for clients lives in [`lib/room-match.ts`](../../lib/room-match.ts).

## Implementation contract

- All handlers return `NextResponse.json` with appropriate HTTP status.
- Mock room state: [`lib/mock-store.ts`](../../lib/mock-store.ts) (process memory, not durable).
- Never accept raw external URLs in image proxy — path must start with `/` and match allowlist regex.

## Dependencies

- `lib/mock-store`, `lib/validation`, `razorpay` (payment)
