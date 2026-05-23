import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

import { validateCreateOrderPayload } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const { amount, currency } = await request.json();

    if (amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json({ error: 'Amount must be a positive integer representing paise' }, { status: 400 });
    }

    if (currency !== 'INR' && currency !== 'USD') {
      return NextResponse.json({ error: 'Currency must be INR or USD' }, { status: 400 });
    }

    // Strict pricing security locks to prevent backdoor price tempering
    if (currency === 'INR' && amount !== 9900) {
      return NextResponse.json({ error: 'Security alert: Invalid premium order amount' }, { status: 400 });
    }

    if (currency === 'USD' && amount !== 300) {
      return NextResponse.json({ error: 'Security alert: Invalid premium order amount' }, { status: 400 });
    }

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
