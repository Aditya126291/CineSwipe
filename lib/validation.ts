const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_REGEX.test(normalizeRoomCode(code));
}

export function isValidPaymentAmount(amount: unknown): amount is number {
  return typeof amount === 'number' && amount > 0 && Number.isInteger(amount);
}

export interface PaymentVerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export function validatePaymentVerifyBody(body: PaymentVerifyBody): string | null {
  if (!body.razorpay_order_id || typeof body.razorpay_order_id !== 'string') {
    return 'razorpay_order_id is required';
  }
  if (!body.razorpay_payment_id || typeof body.razorpay_payment_id !== 'string') {
    return 'razorpay_payment_id is required';
  }
  if (!body.razorpay_signature || typeof body.razorpay_signature !== 'string') {
    return 'razorpay_signature is required';
  }
  return null;
}

export function isSandboxPayment(body: PaymentVerifyBody): boolean {
  return (
    body.razorpay_order_id!.startsWith('order_mock_') &&
    body.razorpay_payment_id!.startsWith('pay_mock_') &&
    body.razorpay_signature === 'mock_signature_dev'
  );
}
