import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ success: false, error: 'Razorpay secret missing in production' }, { status: 500 });
      }
      // Direct sandbox validation
      return NextResponse.json({ success: true, message: 'Simulated Sandbox Payment Success!' });
    }

    // Verify cryptographic signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return NextResponse.json({ success: true, message: 'Payment successfully verified!' });
    } else {
      return NextResponse.json({ success: false, error: 'Cryptographic signature mismatch' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Razorpay Verification Failure:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
