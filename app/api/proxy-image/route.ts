import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const size = searchParams.get('size') || 'w500';

  if (!path) {
    return new NextResponse('Missing path parameter', { status: 400 });
  }

  // Sanitize path parameter to prevent open redirect/SSRF vulnerabilities or path traversal
  // TMDB paths are always starting with '/' followed by hash/extension e.g. /gEU2QniE6E77NI6lCU6MxlNBvIx.jpg
  if (!path.startsWith('/') || path.includes('..') || !/^\/[a-zA-Z0-9_.\-/]+$/.test(path)) {
    return new NextResponse('Invalid path parameter', { status: 400 });
  }

  // Limit sizes to a valid list of TMDB-supported sizes to prevent arbitrary requests
  const allowedSizes = ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'w1280', 'original'];
  if (!allowedSizes.includes(size)) {
    return new NextResponse('Invalid size parameter', { status: 400 });
  }

  const imageUrl = `https://image.tmdb.org/t/p/${size}${path}`;

  try {
    const response = await fetch(imageUrl, {
      next: { revalidate: 86400 }, // Cache on Next.js server for 24 hours
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
