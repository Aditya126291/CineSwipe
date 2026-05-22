export type SwipeDirection = 'like' | 'dislike' | 'superlike';

export type ActiveSwipesMap = Record<
  number,
  Record<string, { direction: SwipeDirection | string; timestamp: number }>
>;

/** True when every member has liked or superliked the same content. */
export function isRoomMatch(
  activeSwipes: ActiveSwipesMap,
  contentId: number,
  memberIds: string[]
): boolean {
  if (memberIds.length < 2) return false;

  const movieSwipes = activeSwipes[contentId];
  if (!movieSwipes) return false;

  return memberIds.every((memberId) => {
    const swipe = movieSwipes[memberId];
    return swipe && (swipe.direction === 'like' || swipe.direction === 'superlike');
  });
}
