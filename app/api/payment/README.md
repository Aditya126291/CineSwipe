# `app/api/payment/` — Razorpay

## Purpose

Create orders and verify payments for CineSwipe+ upgrades.

## Files

| File | Method | Role |
| --- | --- | --- |
| [`create-order/route.ts`](create-order/route.ts) | POST | Create Razorpay order or return mock order |
| [`verify/route.ts`](verify/route.ts) | POST | HMAC verify or sandbox mock |

## Implementation contract

### Create order body

```json
{ "amount": 9900, "currency": "INR" }
```

- `amount`: positive integer (paise)
- `currency`: must be `INR`
- Missing keys → mock order with `order_mock_*` id when Razorpay secrets absent

### Verify body (always required)

```json
{
  "razorpay_order_id": "order_mock_abc",
  "razorpay_payment_id": "pay_mock_xyz",
  "razorpay_signature": "mock_signature_dev"
}
```

Production: real ids + HMAC via `RAZORPAY_KEY_SECRET`.

Development without secret: only `isSandboxPayment()` shape returns success.

## Dependencies

- [`lib/validation.ts`](../../../lib/validation.ts)
- Client: [`hooks/usePremium.ts`](../../../hooks/usePremium.ts) (may bypass checkout when key missing)

## Known bugs

| Issue | Status |
| --- | --- |
| Empty `{}` verify success in dev | **Fixed** (400 unless sandbox shape) |
| Negative amount mock order | **Fixed** in create-order |

## Optimal fix plan

1. Align `usePremium` mock checkout to send sandbox verify payload when testing verify route.
2. Add Vitest tests for validators (see `Architecture.md` test matrix).

## Verification

```bash
curl -s -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" -d '{"amount":9900,"currency":"INR"}'

curl -s -X POST http://localhost:3000/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{"razorpay_order_id":"order_mock_x","razorpay_payment_id":"pay_mock_y","razorpay_signature":"mock_signature_dev"}'
```

## After successful execution

Update `Architecture.md` payment rows and failure #2 status.
