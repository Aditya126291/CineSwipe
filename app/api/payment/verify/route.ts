import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isSandboxPayment, validatePaymentVerifyBody } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationError = validatePaymentVerifyBody(body);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      if (process.env.NODE_ENV === 'development' && isSandboxPayment(body)) {
        return NextResponse.json({ success: true, message: 'Simulated Sandbox Payment Success!' });
      }
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          {
            success: false,
            error:
              'Development mock payments require order_mock_* ids, pay_mock_* payment id, and mock_signature_dev signature',
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: false, error: 'Razorpay secret missing' }, { status: 500 });
    }

    // Verify cryptographic signature using constant-time comparison to prevent timing attacks (Pillar 4)
    const signaturePayload = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(signaturePayload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(razorpay_signature, 'hex');

    // Applied Secure Constant-Time Cryptographic Verification Pattern (Pillar 4)
    const isAuthentic = expectedBuffer.length === providedBuffer.length && 
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (isAuthentic) {
      return NextResponse.json({ success: true, message: 'Payment successfully verified!' });
    } else {
      return NextResponse.json({ success: false, error: 'Cryptographic signature mismatch' }, { status: 400 });
    }
  } catch (error) {
    console.error('Razorpay Verification Failure:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
