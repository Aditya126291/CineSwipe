import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

import { validateCreateOrderPayload } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    
    // Applied Declarative Input Schema Boundary Verification Pattern (Pillar 3)
    const validation = validateCreateOrderPayload(rawBody);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { amount, currency } = validation.parsed!;

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      // Mock mode fallback when keys are missing so that it does not crash in dev/sandbox
      return NextResponse.json({
        id: 'order_mock_' + Math.random().toString(36).substring(2, 11),
        entity: 'order',
        amount: amount,
        amount_paid: 0,
        amount_due: amount,
        currency: currency,
        receipt: 'rcpt_mock',
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000)
      });
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    const options = {
      amount: amount, // in paise
      currency: currency,
      receipt: 'receipt_order_' + Math.random().toString(36).substring(2, 11),
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (error: unknown) {
    console.error('Razorpay Create Order Failure:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
