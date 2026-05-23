import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Sliding-window IP store for local fallback rate limiting (Pillar 2)
// Javascript Maps preserve insertion order, allowing O(1) oldest-entry eviction
const rateLimitStore = new Map<string, number[]>();

const LIMIT = 60; // Max requests allowed per window (60 requests)
const WINDOW_MS = 60 * 1000; // Window duration (1 minute)
const MAX_MEM_KEYS = 1000; // Maximum number of unique IPs to keep in memory to prevent memory exhaustion

// Secure client IP extraction using Next.js trusted engine values
function getClientIp(request: NextRequest): string {
  // Access Next.js platform IP securely if populated (e.g., Vercel Edge layer)
  const nextRequestIp = (request as any).ip;
  if (nextRequestIp) {
    return nextRequestIp;
  }

  // Fallback to parsing proxy headers, retrieving the oldest proxy client IP (first element)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const parts = xForwardedFor.split(',');
    if (parts.length > 0) {
      return parts[0].trim();
    }
  }

  return request.headers.get('x-real-ip') || '127.0.0.1';
}

async function handleRedisRateLimit(ip: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null; // Fallback to optimized in-memory rate limiting
  }

  try {
    const windowId = Math.floor(Date.now() / WINDOW_MS);
    const key = `cineswipe:ratelimit:${ip}:${windowId}`;

    // Execute atomic pipelined command to increment count and set short TTL (automatic GC!)
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, 65], // TTL of 65 seconds allows clean overlap of window
      ]),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('[Rate Limit] Upstash pipeline failed, falling back to local store');
      return null;
    }

    const data = await response.json();
    // Upstash pipeline returns array of results: [[null, count], [null, 1]]
    const count = data[0]?.[1] || 1;
    
    const remaining = Math.max(0, LIMIT - count);
    const resetTime = Math.ceil((Date.now() + WINDOW_MS) / 1000);

    return {
      success: count <= LIMIT,
      limit: LIMIT,
      remaining,
      reset: resetTime,
    };
  } catch (error) {
    console.error('[Rate Limit] Redis error:', error);
    return null;
  }
}

function handleLocalRateLimit(ip: string): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) || [];

  // Filter timestamps to only retain requests within the active sliding window
  const activeTimestamps = timestamps.filter(t => now - t < WINDOW_MS);

  if (activeTimestamps.length >= LIMIT) {
    const oldestActive = activeTimestamps[0];
    const resetTime = Math.ceil((oldestActive + WINDOW_MS) / 1000);

    return {
      success: false,
      limit: LIMIT,
      remaining: 0,
      reset: resetTime,
    };
  }

  // Record current request timestamp
  activeTimestamps.push(now);
  rateLimitStore.set(ip, activeTimestamps);

  // O(1) Memory Management: Evict the oldest tracked IP if size limit is exceeded.
  // JavaScript Map preserves insertion order, so keys().next().value yields the oldest entry in O(1) time
  // with zero synchronous full-store loops or blocked event loops.
  if (rateLimitStore.size > MAX_MEM_KEYS) {
    const oldestKey = rateLimitStore.keys().next().value;
    if (oldestKey !== undefined) {
      rateLimitStore.delete(oldestKey);
    }
  }

  const remaining = LIMIT - activeTimestamps.length;
  const resetTime = Math.ceil((now + WINDOW_MS) / 1000);

  return {
    success: true,
    limit: LIMIT,
    remaining,
    reset: resetTime,
  };
}

export async function middleware(request: NextRequest) {
  // Rate limit all backend API endpoints to protect resources against brute force / DoS
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Bypass rate limiting in local development / testing environments to support parallel E2E verification
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }

    const ip = getClientIp(request);

    // 1. Try distributed rate limiting via Upstash Redis
    let rateLimitResult = await handleRedisRateLimit(ip);

    // 2. Fall back to secure, memory-optimized in-memory sliding window if Upstash is unconfigured/failed
    if (!rateLimitResult) {
      rateLimitResult = handleLocalRateLimit(ip);
    }

    if (!rateLimitResult.success) {
      const now = Date.now();
      const remainingWaitSeconds = Math.max(1, rateLimitResult.reset - Math.ceil(now / 1000));

      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please throttle your swipes and try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': remainingWaitSeconds.toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }
    
    // Inject headers to notify client of remaining limits
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());
    return response;
  }

  return NextResponse.next();
}

// Restrict middleware invocation to only trigger on API routes to avoid overhead on page views and assets
export const config = {
  matcher: '/api/:path*',
};
