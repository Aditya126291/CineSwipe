'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, History, Sparkles, AlertTriangle, Eye, Video } from 'lucide-react';
import Link from 'next/link';
import { useMovies } from '@/hooks/useMovies';
import { usePremium } from '@/hooks/usePremium';
import { useSwipeDeck } from '@/hooks/useSwipeDeck';
import ThemeToggle from '@/components/ThemeToggle';
import SwipeCounter from '@/components/SwipeCounter';
import GenreFilter from '@/components/GenreFilter';
import SwipeHistory from '@/components/SwipeHistory';
import SwipeDeck from '@/components/SwipeDeck';
import UpgradePrompt from '@/components/UpgradePrompt';
import SkeletonCard from '@/components/SkeletonCard';
import AdBanner from '@/components/AdBanner';
import type { ContentItem } from '@/lib/tmdb/types';

export default function SoloSwipePage() {
  const [contentType, setContentType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [upgradeOpen, setUpgradeOpen] = useState<boolean>(false);

  // Core Hooks
  const { isPremium, swipesLeft, maxDailySwipes, incrementSwipeCount, triggerRazorpayCheckout } = usePremium();
  const { movies, genres, loading, loadMore } = useMovies(contentType, selectedGenreId);

  const handleLimitExceeded = () => {
    setUpgradeOpen(true);
  };

  const handleSwipeRecord = async (movieId: number, direction: 'like' | 'dislike' | 'superlike') => {
    // Record Swipe Count
    const allowed = await incrementSwipeCount();
    if (!allowed && !isPremium) {
      handleLimitExceeded();
      return;
    }
  };

  const {
    currentIndex,
    liked,
    disliked,
    superLiked,
    history,
    swipe,
    undo,
  } = useSwipeDeck(movies, handleSwipeRecord, handleLimitExceeded);

  const handleGenreSelect = (genreId?: number) => {
    setSelectedGenreId(genreId);
  };

  const handleSwipeAction = (direction: 'like' | 'dislike' | 'superlike') => {
    const canSwipe = isPremium || swipesLeft > 0;
    swipe(direction, () => canSwipe);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-navy-950 text-zinc-900 dark:text-white flex flex-col justify-between select-none">
      
      {/* Top Navbar Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/30">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-extrabold hover:text-violet-500 transition-all text-zinc-500 dark:text-zinc-400"
        >
          <ArrowLeft className="w-4 h-4" /> Lobby
        </Link>

        {/* Dynamic limits & history drawer toggles */}
        <div className="flex items-center gap-4">
          <SwipeCounter swipesLeft={swipesLeft} maxSwipes={maxDailySwipes} isPremium={isPremium} />
          
          <button
            onClick={() => setHistoryOpen(true)}
            className="p-2.5 rounded-full glass border hover:bg-white/10 dark:hover:bg-black/20 text-zinc-600 dark:text-zinc-300 transition-all relative"
            title="View History Logs"
          >
            <History className="w-5 h-5" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white font-black text-[9px] flex items-center justify-center animate-bounce">
                {history.length}
              </span>
            )}
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Swipe Deck Layout */}
      <main className="flex-1 flex flex-col items-center py-6 px-4 max-w-md mx-auto w-full gap-5">
        
        {/* Toggle Movies / Series selector as requested */}
        <div className="flex bg-zinc-100 dark:bg-navy-950 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60 text-xs w-full">
          <button
            onClick={() => setContentType('all')}
            className={`flex-1 py-2 font-extrabold text-center rounded-lg transition-all ${
              contentType === 'all'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            🍿 All Feeds
          </button>
          <button
            onClick={() => setContentType('movie')}
            className={`flex-1 py-2 font-extrabold text-center rounded-lg transition-all ${
              contentType === 'movie'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            🎬 Movies
          </button>
          <button
            onClick={() => setContentType('tv')}
            className={`flex-1 py-2 font-extrabold text-center rounded-lg transition-all ${
              contentType === 'tv'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            📺 Web Series
          </button>
        </div>

        {/* Horizontal Genre Selector bar */}
        <GenreFilter
          genres={genres}
          selectedGenreId={selectedGenreId}
          onGenreSelect={handleGenreSelect}
          isPremium={isPremium}
          onUpgradePrompt={() => setUpgradeOpen(true)}
        />

        {/* Dynamic Cards representation stack */}
        <div className="flex-1 w-full flex items-center justify-center py-4">
          {loading ? (
            <SkeletonCard />
          ) : (
            <SwipeDeck
              movies={movies}
              currentIndex={currentIndex}
              onSwipe={handleSwipeAction}
              isPremium={isPremium}
              onUpgradePrompt={() => setUpgradeOpen(true)}
              undo={undo}
              historyLength={history.length}
            />
          )}
        </div>

        {/* Popout Promo banners for free users */}
        <AdBanner isPremium={isPremium} />
      </main>

      {/* Swipe History sidebar slideout */}
      <SwipeHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        liked={liked}
        disliked={disliked}
        superLiked={superLiked}
        undo={undo}
        isPremium={isPremium}
        onUpgradePrompt={() => setUpgradeOpen(true)}
      />

      {/* Dynamic pricing conversion modal */}
      <UpgradePrompt
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onSuccess={() => alert('CineSwipe+ Activated! Enjoy unlimited surfing.')}
        triggerRazorpay={triggerRazorpayCheckout}
      />
    </div>
  );
}
