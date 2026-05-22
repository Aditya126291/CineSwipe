'use client';

import { useState, useEffect } from 'react';
import { preloadPosterImages } from '@/lib/catalog/preload';
import { updateFeedWeightsMultiple, penalizeFeedWeightsMultiple, initializeWeights } from '@/lib/recommendations';
import { ArrowLeft, History } from 'lucide-react';
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
export default function SoloSwipePage() {
  const [contentType, setContentType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [upgradeOpen, setUpgradeOpen] = useState<boolean>(false);

  // Core Hooks
  const { isPremium, swipesLeft, maxDailySwipes, incrementSwipeCount, triggerRazorpayCheckout } = usePremium();
  const { movies, genres, loading, loadMore, hasMore } = useMovies(contentType, selectedGenreId);

  const handleLimitExceeded = () => {
    setUpgradeOpen(true);
  };

  // Initialize weights in localStorage on mount and dynamically select the user's highest weighted starting genre (quota)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let weights = initializeWeights();
      const stored = localStorage.getItem('cineswipe-genre-weights');
      if (!stored) {
        localStorage.setItem('cineswipe-genre-weights', JSON.stringify(weights));
      } else {
        try {
          weights = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse weights', e);
        }
      }
      localStorage.removeItem('cineswipe-genre-weights-history');

      // Find the genre with the highest weight (quota)
      let highestGenreId: number | undefined = undefined;
      let highestWeight = -1;

      for (const [gidStr, weight] of Object.entries(weights)) {
        const gid = Number(gidStr);
        const w = Number(weight);
        if (w > highestWeight) {
          highestWeight = w;
          highestGenreId = gid;
        }
      }

      // Genre preferences are loaded into weights in localStorage, which will be naturally
      // bubbled to the top by the recommendation ranker (rankMovies) under 'All Feeds'
      // without programmatically locking the UI filter pill and exhausting the pool.
    }
  }, []);

  const handleSwipeRecord = async (movieId: number, direction: 'like' | 'dislike' | 'superlike') => {
    // Record Swipe Count
    const allowed = await incrementSwipeCount();
    if (!allowed && !isPremium) {
      handleLimitExceeded();
      return;
    }

    // Capture the weights before modification to push onto history stack
    if (typeof window !== 'undefined') {
      let currentWeights = initializeWeights();
      let lastLikedGenre: number | null = null;

      const storedWeights = localStorage.getItem('cineswipe-genre-weights');
      const storedLastLiked = localStorage.getItem('cineswipe-last-liked-genre');

      if (storedWeights) {
        try {
          currentWeights = JSON.parse(storedWeights);
        } catch {
          console.error('Failed to parse stored genre weights');
        }
      }
      if (storedLastLiked) {
        const parsed = parseInt(storedLastLiked, 10);
        if (!isNaN(parsed)) {
          lastLikedGenre = parsed;
        }
      }

      // Save to history stack
      const storedHistory = localStorage.getItem('cineswipe-genre-weights-history') || '[]';
      let historyStack = [];
      try {
        historyStack = JSON.parse(storedHistory);
        if (!Array.isArray(historyStack)) historyStack = [];
      } catch {
        historyStack = [];
      }
      historyStack.push({ weights: currentWeights, lastLikedGenre });
      localStorage.setItem('cineswipe-genre-weights-history', JSON.stringify(historyStack));

      const swipedMovie = movies.find((m) => m.id === movieId);

      if (direction === 'like' || direction === 'superlike') {
        const genres = swipedMovie?.genreIds || [];
        if (genres.length > 0) {
          const newState = updateFeedWeightsMultiple({ weights: currentWeights, lastLikedGenre }, genres);
          localStorage.setItem('cineswipe-genre-weights', JSON.stringify(newState.weights));
          if (newState.lastLikedGenre !== null) {
            localStorage.setItem('cineswipe-last-liked-genre', newState.lastLikedGenre.toString());
          }
        }
      } else if (direction === 'dislike') {
        const genres = swipedMovie?.genreIds || [];
        if (genres.length > 0) {
          const newState = penalizeFeedWeightsMultiple({ weights: currentWeights, lastLikedGenre }, genres);
          localStorage.setItem('cineswipe-genre-weights', JSON.stringify(newState.weights));
        }
      }
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

  useEffect(() => {
    if (movies.length === 0) return;
    preloadPosterImages(movies, currentIndex + 1, 4);
    if (hasMore && currentIndex >= movies.length - 5 && !loading) {
      loadMore();
    }
  }, [currentIndex, movies, hasMore, loading, loadMore]);

  const handleUndo = () => {
    // Restore previous weights from history if applicable
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('cineswipe-genre-weights-history');
      if (storedHistory) {
        try {
          const historyStack = JSON.parse(storedHistory);
          if (Array.isArray(historyStack) && historyStack.length > 0) {
            const previousState = historyStack.pop();
            if (previousState && previousState.weights) {
              localStorage.setItem('cineswipe-genre-weights', JSON.stringify(previousState.weights));
              if (previousState.lastLikedGenre !== undefined) {
                if (previousState.lastLikedGenre === null) {
                  localStorage.removeItem('cineswipe-last-liked-genre');
                } else {
                  localStorage.setItem('cineswipe-last-liked-genre', previousState.lastLikedGenre.toString());
                }
              }
              localStorage.setItem('cineswipe-genre-weights-history', JSON.stringify(historyStack));
            }
          }
        } catch {
          console.error('Failed to restore weights on undo');
        }
      }
    }
    // Call the original undo hook function
    undo();
  };

  const handleGenreSelect = (genreId?: number) => {
    setSelectedGenreId(genreId);
  };

  const handleSwipeAction = (direction: 'like' | 'dislike' | 'superlike') => {
    const canSwipe = isPremium || swipesLeft > 0;
    swipe(direction, () => canSwipe);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-navy-950 text-zinc-900 dark:text-white flex flex-col justify-between select-none relative overflow-hidden transition-colors duration-500">
      
      {/* Background Decorative Glow Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-coral-500/10 dark:bg-coral-500/15 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/5 dark:bg-amber-500/8 blur-[100px] pointer-events-none" />

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
          <div className="flex items-center gap-2">
            <SwipeCounter swipesLeft={swipesLeft} maxSwipes={maxDailySwipes} isPremium={isPremium} />
          </div>
          
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
              undo={handleUndo}
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
        undo={handleUndo}
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
