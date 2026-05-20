import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, currency } = await request.json();

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      // Mock mode fallback when keys are missing so that it does not crash in dev/sandbox
      return NextResponse.json({
        id: 'order_mock_' + Math.random().toString(36).substr(2, 9),
        entity: 'order',
        amount: amount || 9900,
        amount_paid: 0,
        amount_due: amount || 9900,
        currency: currency || 'INR',
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
      amount: amount || 9900, // in paise
      currency: currency || 'INR',
      receipt: 'receipt_order_' + Math.random().toString(36).substr(2, 9),
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay Create Order Failure:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
