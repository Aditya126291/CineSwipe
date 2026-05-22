# `app/upgrade/` — CineSwipe+

## Purpose

Marketing and purchase flow for premium: unlimited swipes, larger rooms, superlike, extra genres.

## File

[`page.tsx`](page.tsx)

## Implementation contract

- Price: ₹99 → `9900` paise via `usePremium.triggerRazorpayCheckout`
- Success sets `cineswipe-plus` in localStorage + optional Supabase `users.is_premium`
- Without Razorpay public key: simulated checkout timeout (~1.2s)

## Dependencies

- [`hooks/usePremium.ts`](../../hooks/usePremium.ts)
- [`app/api/payment/`](../../api/payment/README.md)

## Known bugs

- Dev verify route requires sandbox signature if testing full API path (see payment README)

## Verification

- `/upgrade` renders feature list
- Checkout success sets premium (localStorage `cineswipe-plus=true`)

## After successful execution

Update premium/payment notes in `Architecture.md`.
