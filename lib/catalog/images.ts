export function isPosterMissing(posterUrl: string | undefined | null): boolean {
  if (!posterUrl) return true;
  return posterUrl.includes('poster-placeholder');
}
