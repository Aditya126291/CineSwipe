// --- STRUCTURAL BOUNDARY INPUT VALIDATION CONTRACTS (Pillar 3) ---
// Custom, highly optimized TypeScript schema validators to enforce strict type checking and input sanitization

const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;
const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const VALID_SYNC_ACTIONS = ['start-session', 'swipe', 'undo-swipe'];

export function normalizeRoomCode(code: string): string {
  if (typeof code !== 'string') return '';
  return code.trim().toUpperCase();
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_REGEX.test(normalizeRoomCode(code));
}

export function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && UUID_V4_REGEX.test(id);
}

export function isValidPaymentAmount(amount: unknown): amount is number {
  return typeof amount === 'number' && amount > 0 && Number.isInteger(amount) && amount <= 10000000; // Limit max amount to 1 Lakh INR to prevent buffer/overflow attacks
}

export interface PaymentVerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

// Enforce declarative input schema matching on verify payment body
export function validatePaymentVerifyBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Invalid request payload';
  }
  const payload = body as Record<string, unknown>;
  
  if (!payload.razorpay_order_id || typeof payload.razorpay_order_id !== 'string' || payload.razorpay_order_id.length > 100) {
    return 'razorpay_order_id is required and must be a safe string';
  }
  if (!payload.razorpay_payment_id || typeof payload.razorpay_payment_id !== 'string' || payload.razorpay_payment_id.length > 100) {
    return 'razorpay_payment_id is required and must be a safe string';
  }
  if (!payload.razorpay_signature || typeof payload.razorpay_signature !== 'string' || payload.razorpay_signature.length > 256) {
    return 'razorpay_signature is required and must be a safe string';
  }
  return null;
}

export function isSandboxPayment(body: PaymentVerifyBody): boolean {
  return (
    !!body.razorpay_order_id?.startsWith('order_mock_') &&
    !!body.razorpay_payment_id?.startsWith('pay_mock_') &&
    body.razorpay_signature === 'mock_signature_dev'
  );
}

// 1. Validator for /api/catalog/feed API Route (Pillar 3)
export function validateCatalogFeedQuery(searchParams: URLSearchParams) {
  const mediaType = searchParams.get('mediaType') || 'all';
  const genreIdStr = searchParams.get('genreId');
  const pageStr = searchParams.get('page') || '1';
  const seed = searchParams.get('seed');

  if (mediaType !== 'movie' && mediaType !== 'tv' && mediaType !== 'all') {
    return { valid: false, error: 'Invalid mediaType parameter' };
  }

  let genreId: number | undefined;
  if (genreIdStr) {
    genreId = Number(genreIdStr);
    if (!Number.isInteger(genreId) || genreId <= 0) {
      return { valid: false, error: 'genreId must be a positive integer' };
    }
  }

  const page = Number(pageStr);
  if (!Number.isInteger(page) || page <= 0 || page > 1000) {
    return { valid: false, error: 'page must be a positive integer between 1 and 1000' };
  }

  if (seed && (typeof seed !== 'string' || seed.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(seed))) {
    return { valid: false, error: 'Invalid seed parameter format' };
  }

  return {
    valid: true,
    parsed: {
      mediaType: mediaType as 'movie' | 'tv' | 'all',
      genreId,
      page,
      seed: seed || undefined,
    }
  };
}

export interface RecentItem {
  id: number;
  title: string;
  genreIds: number[];
  mediaType: 'movie' | 'tv';
}

// 2. Validator for /api/catalog/next-card API Route (Pillar 3)
export function validateNextCardPayload(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload' };
  }
  const payload = body as Record<string, unknown>;

  const mediaType = payload.mediaType || 'all';
  if (mediaType !== 'movie' && mediaType !== 'tv' && mediaType !== 'all') {
    return { valid: false, error: 'Invalid mediaType parameter' };
  }

  let selectedGenreId: number | undefined;
  if (payload.selectedGenreId !== undefined && payload.selectedGenreId !== null) {
    selectedGenreId = Number(payload.selectedGenreId);
    if (isNaN(selectedGenreId) || !Number.isInteger(selectedGenreId) || selectedGenreId <= 0) {
      return { valid: false, error: 'selectedGenreId must be a positive integer' };
    }
  }

  // Validate weights dictionary mapping
  const weights: Record<number, number> = {};
  if (payload.weights) {
    if (typeof payload.weights !== 'object') {
      return { valid: false, error: 'weights must be a dictionary object' };
    }
    const weightsObj = payload.weights as Record<string, unknown>;
    for (const [key, val] of Object.entries(weightsObj)) {
      const genreId = Number(key);
      const weightVal = Number(val);
      if (isNaN(genreId) || isNaN(weightVal) || weightVal < 0 || weightVal > 1) {
        return { valid: false, error: 'weights object must map numeric genre keys to values between 0 and 1' };
      }
      weights[genreId] = weightVal;
    }
  }

  // Validate seen IDs array
  const seen: number[] = [];
  if (payload.seen) {
    if (!Array.isArray(payload.seen)) {
      return { valid: false, error: 'seen must be an array of numbers' };
    }
    if (payload.seen.length > 5000) {
      return { valid: false, error: 'seen list exceeds safe limit size' };
    }
    for (const item of payload.seen) {
      const numericId = Number(item);
      if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
        return { valid: false, error: 'seen array must contain positive integers' };
      }
      seen.push(numericId);
    }
  }

  // Validate recent items array for diversity checks (Pillar 3)
  const recent: RecentItem[] = [];
  if (payload.recent) {
    if (!Array.isArray(payload.recent)) {
      return { valid: false, error: 'recent must be an array of objects' };
    }
    if (payload.recent.length > 50) {
      return { valid: false, error: 'recent list exceeds safe limit size' };
    }
    for (const item of payload.recent) {
      if (!item || typeof item !== 'object') {
        return { valid: false, error: 'recent list items must be object structures' };
      }
      const itemObj = item as Record<string, unknown>;
      const id = Number(itemObj.id);
      const title = String(itemObj.title || '');
      const mType = itemObj.mediaType;

      if (isNaN(id) || id <= 0) {
        return { valid: false, error: 'recent item id must be a positive integer' };
      }
      if (mType !== 'movie' && mType !== 'tv') {
        return { valid: false, error: 'recent item mediaType must be movie or tv' };
      }

      recent.push({
        id,
        title,
        genreIds: Array.isArray(itemObj.genreIds) ? itemObj.genreIds.map(Number) : [],
        mediaType: mType as 'movie' | 'tv',
      });
    }
  }

  return {
    valid: true,
    parsed: {
      mediaType: mediaType as 'movie' | 'tv' | 'all',
      selectedGenreId,
      weights,
      seen,
      recent,
    }
  };
}

// 3. Validator for /api/payment/create-order API Route (Pillar 3)
export function validateCreateOrderPayload(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload' };
  }
  const payload = body as Record<string, unknown>;

  if (payload.amount === undefined || payload.amount === null) {
    return { valid: false, error: 'Amount is required' };
  }

  const amount = Number(payload.amount);
  if (!isValidPaymentAmount(amount)) {
    return { valid: false, error: 'Amount must be a safe positive integer representing paise' };
  }

  const currency = payload.currency;
  if (currency !== 'INR' && currency !== 'USD') {
    return { valid: false, error: 'Currency must be INR or USD' };
  }

  // Strict pricing security locks to prevent backdoor price tempering
  if (currency === 'INR' && amount !== 9900) {
    return { valid: false, error: 'Security alert: Invalid premium order amount' };
  }

  if (currency === 'USD' && amount !== 300) {
    return { valid: false, error: 'Security alert: Invalid premium order amount' };
  }

  return {
    valid: true,
    parsed: {
      amount,
      currency: currency as 'INR' | 'USD',
    }
  };
}

// 4. Validator for /api/rooms POST API Route (Pillar 3)
export function validateCreateRoomPayload(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload' };
  }
  const payload = body as Record<string, unknown>;

  const code = payload.code;
  if (typeof code !== 'string' || !ROOM_CODE_REGEX.test(code.toUpperCase())) {
    return { valid: false, error: 'Invalid room code format. Code must be 6 alphanumeric characters.' };
  }

  const userId = payload.userId;
  if (!isValidUUID(userId)) {
    return { valid: false, error: 'userId is required and must be a valid UUID v4' };
  }

  return {
    valid: true,
    parsed: {
      code: code.toUpperCase(),
      userId,
      isPremium: !!payload.isPremium,
    }
  };
}

// 5. Validator for /api/rooms/[code]/sync POST API Route (Pillar 3)
export function validateSyncRoomPayload(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload' };
  }
  const payload = body as Record<string, unknown>;

  const userId = payload.userId;
  if (!isValidUUID(userId)) {
    return { valid: false, error: 'userId is required and must be a valid UUID v4' };
  }

  const username = payload.username;
  if (username !== undefined && (typeof username !== 'string' || username.length > 50)) {
    return { valid: false, error: 'username must be a string up to 50 characters long' };
  }

  const avatarColor = payload.avatarColor;
  if (avatarColor !== undefined && (typeof avatarColor !== 'string' || !HEX_COLOR_REGEX.test(avatarColor))) {
    return { valid: false, error: 'avatarColor must be a valid hex color string (e.g. #7c3aed)' };
  }

  const action = payload.action;
  if (action !== undefined && (typeof action !== 'string' || !VALID_SYNC_ACTIONS.includes(action))) {
    return { valid: false, error: 'Invalid action parameter value' };
  }

  // Clean and sanitize swipe payload if present
  let swipe: { contentId: number; mediaType: 'movie' | 'tv'; direction: 'like' | 'dislike' | 'superlike' } | undefined;
  if (payload.swipe) {
    if (typeof payload.swipe !== 'object') {
      return { valid: false, error: 'swipe must be an object' };
    }
    const swipeObj = payload.swipe as Record<string, unknown>;
    const contentId = Number(swipeObj.contentId);
    const mediaType = swipeObj.mediaType;
    const direction = swipeObj.direction;

    if (isNaN(contentId) || !Number.isInteger(contentId) || contentId <= 0) {
      return { valid: false, error: 'swipe.contentId must be a positive integer' };
    }
    if (mediaType !== 'movie' && mediaType !== 'tv') {
      return { valid: false, error: 'swipe.mediaType must be movie or tv' };
    }
    if (direction !== 'like' && direction !== 'dislike' && direction !== 'superlike') {
      return { valid: false, error: 'swipe.direction must be like, dislike, or superlike' };
    }

    swipe = {
      contentId,
      mediaType: mediaType as 'movie' | 'tv',
      direction: direction as 'like' | 'dislike' | 'superlike',
    };
  }

  return {
    valid: true,
    parsed: {
      userId,
      username: username ? username.replace(/<[^>]*>/g, '').trim() : undefined, // Sanitize XSS tags from raw username input
      avatarColor,
      isPremium: !!payload.isPremium,
      action: action as 'start-session' | 'swipe' | 'undo-swipe' | undefined,
      swipe,
      movie: payload.movie,
    }
  };
}
