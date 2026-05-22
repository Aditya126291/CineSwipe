'use client';

import { useState, useCallback } from 'react';
import type { ContentItem } from '@/lib/types/content';

export function useSwipeDeck(
  initialMovies: ContentItem[],
  onSwipeCallback?: (movieId: number, direction: 'like' | 'dislike' | 'superlike') => void,
  onLimitExceeded?: () => void
) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [history, setHistory] = useState<{ item: ContentItem; direction: 'like' | 'dislike' | 'superlike' }[]>([]);
  const [liked, setLiked] = useState<ContentItem[]>([]);
  const [disliked, setDisliked] = useState<ContentItem[]>([]);
  const [superLiked, setSuperLiked] = useState<ContentItem[]>([]);

  const swipe = useCallback(
    async (direction: 'like' | 'dislike' | 'superlike', canSwipeCheck?: () => Promise<boolean> | boolean) => {
      if (currentIndex >= initialMovies.length) return;

      const currentItem = initialMovies[currentIndex];

      // Enforce daily limits for free tier if requested
      if (canSwipeCheck) {
        const canSwipe = await canSwipeCheck();
        if (!canSwipe) {
          if (onLimitExceeded) onLimitExceeded();
          return;
        }
      }

      // Record to local lists
      if (direction === 'like') {
        setLiked((prev) => [currentItem, ...prev]);
      } else if (direction === 'dislike') {
        setDisliked((prev) => [currentItem, ...prev]);
      } else if (direction === 'superlike') {
        setSuperLiked((prev) => [currentItem, ...prev]);
      }

      setHistory((prev) => [{ item: currentItem, direction }, ...prev]);
      setCurrentIndex((prev) => prev + 1);

      if (onSwipeCallback) {
        onSwipeCallback(currentItem.id, direction);
      }
    },
    [currentIndex, initialMovies, onSwipeCallback, onLimitExceeded]
  );

  const undo = useCallback(() => {
    if (history.length === 0) return;

    const lastAction = history[0];
    const itemToRestore = lastAction.item;

    if (lastAction.direction === 'like') {
      setLiked((prev) => prev.filter((i) => i.id !== itemToRestore.id));
    } else if (lastAction.direction === 'dislike') {
      setDisliked((prev) => prev.filter((i) => i.id !== itemToRestore.id));
    } else if (lastAction.direction === 'superlike') {
      setSuperLiked((prev) => prev.filter((i) => i.id !== itemToRestore.id));
    }

    setHistory((prev) => prev.slice(1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, [history]);

  const activeCard = initialMovies[currentIndex] || null;
  const nextCard = initialMovies[currentIndex + 1] || null;
  const thirdCard = initialMovies[currentIndex + 2] || null;

  return {
    currentIndex,
    activeCard,
    nextCard,
    thirdCard,
    history,
    liked,
    disliked,
    superLiked,
    swipe,
    undo,
    hasMoreCards: currentIndex < initialMovies.length,
  };
}
