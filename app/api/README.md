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

## Known bugs and errors

| Endpoint | Issue | Fix |
| --- | --- | --- |
| `POST /api/payment/verify` | Was accepting `{}` in dev | **Fixed:** requires fields + sandbox signature for mock success |
| `POST /api/rooms` | Was overwriting duplicates | **Fixed:** 409 Conflict |
| Sync | Unknown actions | **Fixed:** 400 for invalid `action` |

## Verification checklist

```bash
# Room validation (dev server running)
curl -s "http://localhost:3000/api/rooms?code=ABC"   # expect 400
curl -s -X POST http://localhost:3000/api/payment/verify -H "Content-Type: application/json" -d "{}"  # expect 400
```

## After successful execution

Update `Architecture.md` API route table and QA API test results.
