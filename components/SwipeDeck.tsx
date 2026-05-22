'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { Heart, X, Zap, Sparkles } from 'lucide-react';
import type { ContentItem } from '@/lib/types/content';
import MovieCard from './MovieCard';

interface SwipeDeckProps {
  movies: ContentItem[];
  currentIndex: number;
  onSwipe: (direction: 'like' | 'dislike' | 'superlike') => void;
  isPremium: boolean;
  onUpgradePrompt: () => void;
  undo: () => void;
  historyLength: number;
  activeSwipes?: Record<number, Record<string, { direction: string; timestamp: number }>>;
  totalMembers?: number;
}

export default function SwipeDeck({
  movies,
  currentIndex,
  onSwipe,
  isPremium,
  onUpgradePrompt,
  undo,
  historyLength,
  activeSwipes = {},
  totalMembers = 1,
}: SwipeDeckProps) {
  const [flippedCardId, setFlippedCardId] = useState<number | null>(null);
  const activeCard = movies[currentIndex] || null;
  const nextCard = movies[currentIndex + 1] || null;
  const thirdCard = movies[currentIndex + 2] || null;

  const [superlikeToast, setSuperlikeToast] = useState<{ username: string; contentId: number } | null>(null);
  const currentLikes = activeCard
    ? Object.values(activeSwipes[activeCard.id] || {}).filter(
        (s) => s.direction === 'like' || s.direction === 'superlike'
      ).length
    : 0;

  useEffect(() => {
    const handleSuperlike = (e: Event) => {
      const customEvent = e as CustomEvent<{ username: string; contentId: number }>;
      const { username, contentId } = customEvent.detail;
      setSuperlikeToast({ username, contentId });
      setTimeout(() => {
        setSuperlikeToast((prev) => (prev?.contentId === contentId ? null : prev));
      }, 3500);
    };
    window.addEventListener('cineswipe-superlike', handleSuperlike);
    return () => window.removeEventListener('cineswipe-superlike', handleSuperlike);
  }, []);

  // Drag physics setup for Framer Motion
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);

  // Swiping overlay stamp indicators
  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, 0], [1, 0]);

  const isFlipped = flippedCardId === activeCard?.id;

  const handleDragEnd = async (_event: unknown, info: import('framer-motion').PanInfo) => {
    // If the card is flipped, drag mechanics are locked
    if (isFlipped) return;

    const threshold = 120;
    const swipeX = info.offset.x;
    const swipeY = info.offset.y;

    if (swipeX > threshold) {
      // Swipe Right (Like)
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('like');
      resetCard();
    } else if (swipeX < -threshold) {
      // Swipe Left (Nope)
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('dislike');
      resetCard();
    } else if (swipeY < -threshold - 40) {
      // Swipe Up (Super Like)
      if (!isPremium) {
        onUpgradePrompt();
        resetCard();
        return;
      }
      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('superlike');
      resetCard();
    } else {
      // Spring back to center
      controls.start({ x: 0, y: 0, opacity: 1, transition: { type: 'spring', damping: 15 } });
    }
  };

  const triggerButtonSwipe = async (direction: 'like' | 'dislike' | 'superlike') => {
    if (direction === 'like') {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
    } else if (direction === 'dislike') {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
    } else if (direction === 'superlike') {
      if (!isPremium) {
        onUpgradePrompt();
        return;
      }
      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } });
    }
    onSwipe(direction);
    resetCard();
  };

  const resetCard = () => {
    x.set(0);
    y.set(0);
    controls.set({ x: 0, y: 0, opacity: 1 });
    setFlippedCardId(null);
  };

  const handleFlip = (flipped: boolean) => {
    if (activeCard) {
      setFlippedCardId(flipped ? activeCard.id : null);
    }
  };

  if (!activeCard) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-navy-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm aspect-[2/3] md:max-w-md shadow-2xl relative">
        <Sparkles className="w-12 h-12 text-violet-500 mb-4 animate-float" />
        <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white mb-2">End of the Movie Reel!</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          You have swiped through all available movies. Try changing your genre filters to find more gems.
        </p>
        {historyLength > 0 && (
          <button
            onClick={undo}
            className="px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all shadow-md active:scale-95"
            aria-label="Undo last swipe"
            data-testid="swipe-reel-undo-button"
          >
            Undo Last Swipe
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm md:max-w-md relative select-none">
      {/* Cards Deck Stack layer */}
      <div className="w-full aspect-[2/3] relative flex items-center justify-center">
        {/* Third Card Underneath */}
        {thirdCard && (
          <div
            className="absolute inset-0 w-full h-full scale-[0.92] translate-y-6 opacity-40 pointer-events-none rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-navy-950"
            style={{ zIndex: 1 }}
          />
        )}

        {/* Second Card Underneath */}
        {nextCard && (
          <div
            className="absolute inset-0 w-full h-full scale-[0.96] translate-y-3 opacity-80 pointer-events-none rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-navy-950"
            style={{ zIndex: 2 }}
          />
        )}

        {/* Top Active Interactive Card */}
        <motion.div
          drag={!isFlipped}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x, y, rotate, opacity, zIndex: 10 }}
          className={`absolute inset-0 w-full h-full ${isFlipped ? 'touch-auto' : 'touch-none'}`}
        >
          {/* Stamps overlays */}
          {!isFlipped && (
            <>
              <motion.div style={{ opacity: likeOpacity }} className="stamp stamp-like">
                LIKE
              </motion.div>
              <motion.div style={{ opacity: nopeOpacity }} className="stamp stamp-nope">
                NOPE
              </motion.div>
            </>
          )}

          <MovieCard
            movie={activeCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            isPremium={isPremium}
            onUpgradePrompt={onUpgradePrompt}
          />
        </motion.div>
        
        {/* Live Like Counter Badge */}
        {currentLikes > 0 && !isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-4 right-0 z-50 bg-violet-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg border border-violet-400 flex items-center gap-1.5"
          >
            🔥 {currentLikes} / {totalMembers} liked this
          </motion.div>
        )}

        {/* Superlike Animation Toast (any card in deck — guests may be on same index in mock sync) */}
        <AnimatePresence>
          {superlikeToast && (() => {
            const superlikedItem = movies.find((m) => m.id === superlikeToast.contentId);
            const label = superlikedItem
              ? (superlikedItem.mediaType === 'tv' ? 'show' : 'movie')
              : 'title';
            return (
              <motion.div
                key={superlikeToast.contentId}
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-10 inset-x-4 z-50 bg-amber-500/90 backdrop-blur-md text-white p-3 rounded-2xl font-black text-sm text-center shadow-xl border border-amber-400 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 fill-current" />
                {superlikeToast.username} superliked this {label}!
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Controller Buttons Bar */}
      <div className="flex items-center justify-center gap-4 mt-2">
        {/* Undo button */}
        {historyLength > 0 && (
          <button
            onClick={undo}
            className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900/90 text-violet-600 dark:text-violet-400 hover:scale-110 active:scale-95 transition-all shadow-md flex items-center justify-center"
            title="Undo"
            aria-label="Undo last swipe"
            data-testid="swipe-undo-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
        )}

        {/* Dislike / Nope button */}
        <button
          onClick={() => triggerButtonSwipe('dislike')}
          className="w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900/90 text-rose-500 hover:text-rose-400 hover:scale-110 active:scale-95 transition-all shadow-md flex items-center justify-center"
          title="Dislike"
          aria-label="Dislike movie"
          data-testid="swipe-dislike-button"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Premium Super Like Button */}
        <button
          onClick={() => triggerButtonSwipe('superlike')}
          className={`w-12 h-12 rounded-full border ${isPremium ? 'border-amber-500/30 text-amber-500 bg-amber-500/10 hover:text-amber-400' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900/90 text-amber-500'} hover:scale-110 active:scale-95 transition-all shadow-md flex items-center justify-center`}
          title="Super Like"
          aria-label="Superlike movie"
          data-testid="swipe-superlike-button"
        >
          <Zap className="w-5 h-5 fill-current stroke-current" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => triggerButtonSwipe('like')}
          className="w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900/90 text-emerald-500 hover:text-emerald-400 hover:scale-110 active:scale-95 transition-all shadow-md flex items-center justify-center"
          title="Like"
          aria-label="Like movie"
          data-testid="swipe-like-button"
        >
          <Heart className="w-6 h-6 stroke-[3] fill-current" />
        </button>
      </div>
    </div>
  );
}
