import type { ContentItem } from '@/lib/types/content';
import { isPosterMissing } from '@/lib/catalog/images';

/** Browser-side poster warm-up for the next cards in the stack. */
export function preloadPosterImages(items: ContentItem[], startIndex: number, count = 4): void {
  if (typeof window === 'undefined') return;

  const slice = items.slice(startIndex, startIndex + count);
  slice.forEach((item) => {
    if (isPosterMissing(item.posterUrl)) return;
    const img = new window.Image();
    img.decoding = 'async';
    img.src = item.posterUrl!;
  });
}
