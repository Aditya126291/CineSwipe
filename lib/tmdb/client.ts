const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getTMDBApiKey(): string | null {
  return process.env.NEXT_PUBLIC_TMDB_API_KEY || null;
}

export function hasTMDBKey(): boolean {
  return !!getTMDBApiKey();
}

export async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getTMDBApiKey();
  if (!apiKey) throw new Error('TMDB API key not configured');

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export function proxyImageUrl(url: string | null, defaultSize = 'w500'): string {
  if (!url) return '/poster-placeholder.svg';
  
  if (url.includes('image.tmdb.org')) {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname; // e.g. /t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg
      const match = pathname.match(/\/t\/p\/([^/]+)(\/.*)/);
      if (match) {
        const size = match[1];
        const path = match[2];
        return `/api/proxy-image?path=${path}&size=${size}`;
      }
    } catch (e) {
      console.error('Failed to parse TMDB URL for proxying:', e);
    }
  }
  
  if (url.startsWith('/')) {
    return `/api/proxy-image?path=${url}&size=${defaultSize}`;
  }
  
  return url;
}

export function getPosterUrl(path: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '/poster-placeholder.svg';
  return proxyImageUrl(path.startsWith('/') ? path : `/t/p/${size}${path}`, size);
}

export function getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return '';
  return proxyImageUrl(path.startsWith('/') ? path : `/t/p/${size}${path}`, size);
}

export function getProviderLogoUrl(path: string): string {
  return proxyImageUrl(path.startsWith('/') ? path : `/t/p/w92${path}`, 'w92');
}

