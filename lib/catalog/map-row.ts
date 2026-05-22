import type { ContentItem } from '@/lib/types/content';

export function mapCatalogRowToContentItem(item: Record<string, unknown>): ContentItem {
  const posterUrl = (item.poster_url as string) || '/poster-placeholder.svg';
  const backdropUrl = (item.backdrop_url as string) || posterUrl;

  return {
    id: Number(item.id),
    title: String(item.title),
    overview: String(item.overview || ''),
    rating: Number(item.rating || 0),
    voteCount: Number(item.vote_count || 0),
    mediaType: (item.media_type as 'movie' | 'tv') || 'movie',
    releaseYear: String(item.release_year || ''),
    posterUrl,
    backdropUrl,
    genreIds: (item.genres as number[]) || [],
    trailerKey: item.trailer_key ? String(item.trailer_key) : undefined,
    providers: ((item.providers as { name: string; logoUrl: string; link?: string }[]) || [])
      .filter((p) => p && p.name)
      .map((p) => ({
        name: p.name,
        logoUrl: p.logoUrl,
        link: p.link,
      })),
  };
}
