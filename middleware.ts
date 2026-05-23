import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory sliding window IP store for rate limiting (Pillar 2)
// Using an in-memory Map structure for O(1) performance lookup and minimal resource overhead
const rateLimitStore = new Map<string, number[]>();

const LIMIT = 60; // Max requests allowed per window (60 requests)
const WINDOW_MS = 60 * 1000; // Window duration (1 minute)

export function middleware(request: NextRequest) {
  // Extract client IP address securely, prioritizing reverse-proxy headers (Pillar 2)
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  
  // Rate limit all backend API endpoints to protect resources against brute force / DoS
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Bypass rate limiting in local development / testing environments to support parallel E2E verification
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }

    const now = Date.now();
    const timestamps = rateLimitStore.get(ip) || [];
    
    // Filter timestamps to only retain requests within the active sliding window
    const activeTimestamps = timestamps.filter(t => now - t < WINDOW_MS);
    
    if (activeTimestamps.length >= LIMIT) {
      const oldestActive = activeTimestamps[0];
      const remainingWaitSeconds = Math.ceil((WINDOW_MS - (now - oldestActive)) / 1000);
      
      // Applied Optimized Request Throttling Rate Limiting Pattern (Pillar 2)
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please throttle your swipes and try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': remainingWaitSeconds.toString(),
            'X-RateLimit-Limit': LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((oldestActive + WINDOW_MS) / 1000).toString(),
          },
        }
      );
    }
    
    // Record current request timestamp
    activeTimestamps.push(now);
    rateLimitStore.set(ip, activeTimestamps);
    
    // Periodic garbage collection logic: clean up old IPs from the store to prevent memory leaks
    if (rateLimitStore.size > 5000) {
      for (const [key, val] of rateLimitStore.entries()) {
        const remaining = val.filter(t => now - t < WINDOW_MS);
        if (remaining.length === 0) {
          rateLimitStore.delete(key);
        } else {
          rateLimitStore.set(key, remaining);
        }
      }
    }
  }

  return NextResponse.next();
}

// Restrict middleware invocation to only trigger on API routes to avoid overhead on page views and assets
export const config = {
  matcher: '/api/:path*',
};
