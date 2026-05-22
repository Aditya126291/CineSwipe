'use client';

import { useState, useEffect, use } from 'react';
import { safeStorage } from '@/lib/storage';
import { ArrowLeft, Film, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRoom } from '@/hooks/useRoom';
import { useMovies } from '@/hooks/useMovies';
import { usePremium } from '@/hooks/usePremium';
import ThemeToggle from '@/components/ThemeToggle';
import RoomLobby from '@/components/RoomLobby';
import SwipeDeck from '@/components/SwipeDeck';
import MovieNightPlanner from '@/components/MovieNightPlanner';
import MatchModal from '@/components/MatchModal';
import UpgradePrompt from '@/components/UpgradePrompt';
import SkeletonCard from '@/components/SkeletonCard';
import type { ContentItem } from '@/lib/types/content';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: PageProps) {
  const { code: roomCode } = use(params);

  // User details state
  const [username, setUsername] = useState<string>('');
  const [avatarColor, setAvatarColor] = useState<string>('#7c3aed');
  const [nameSaved, setNameSaved] = useState<boolean>(false);

  // Modal triggers
  const [upgradeOpen, setUpgradeOpen] = useState<boolean>(false);
  const [matchOpen, setMatchOpen] = useState<boolean>(false);
  const [matchedMovie, setMatchedMovie] = useState<ContentItem | null>(null);
  const [matchReason, setMatchReason] = useState<string>('Party Match!');

  // Match list tracker for Planner
  const [matchedList, setMatchedList] = useState<ContentItem[]>([]);

  // Core Hooks
  const { isPremium, triggerRazorpayCheckout } = usePremium();
  const { movies, loading, loadMore, hasMore } = useMovies('all', undefined, roomCode); // Pass roomCode as shuffleSeed for identical deck ordering

  const handleMatchTrigger = (movie: ContentItem, reason?: string) => {
    setMatchedMovie(movie);
    setMatchReason(reason || 'Everyone Liked!');
    setMatchOpen(true);
    setMatchedList((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [movie, ...prev];
    });
  };

  const searchParams = useSearchParams();
  const isHostMode = searchParams.get('host') === 'true';

  const {
    room,
    members,
    loading: roomLoading,
    error: roomError,
    activeSwipes,
    userId,
    sendSwipe,
    undoSwipe,
    isSwipingStarted,
    startSession,
  } = useRoom(roomCode, username, avatarColor, isPremium, handleMatchTrigger, isHostMode);

  // Assign random username & color initially
  useEffect(() => {
    const savedName = safeStorage.getItem('cineswipe-username');
    const colors = ['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const timer = setTimeout(() => {
      if (savedName) {
        setUsername(savedName);
        setNameSaved(true);
      } else {
        const names = ['PopcornGuru', 'CinePhile', 'FlickFinder', 'ShowSurfer', 'ReelLover', 'FilmStar'];
        const randomName = names[Math.floor(Math.random() * names.length)] + '_' + Math.floor(100 + Math.random() * 900);
        setUsername(randomName);
      }
      setAvatarColor(randomColor);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleSaveName = () => {
    if (!username.trim()) return;
    safeStorage.setItem('cineswipe-username', username.trim());
    setNameSaved(true);
  };

  const handleSwipeAction = (direction: 'like' | 'dislike' | 'superlike') => {
    const currentMovie = movies[moviesMatchedCount];
    if (currentMovie) {
      sendSwipe(currentMovie, direction);
      setMoviesMatchedCount((prev) => prev + 1);
    }
  };

  const [moviesMatchedCount, setMoviesMatchedCount] = useState<number>(0);

  // Automatically trigger loadMore when approaching the end of the loaded movies list (deck)
  useEffect(() => {
    if (movies.length === 0) return;
    if (hasMore && moviesMatchedCount >= movies.length - 5 && !loading) {
      loadMore();
    }
  }, [moviesMatchedCount, movies.length, hasMore, loading, loadMore]);

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-navy-950 flex flex-col justify-center items-center">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-navy-950 text-zinc-900 dark:text-white flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900 shadow-2xl flex flex-col gap-6 text-center animate-scale-in">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto mb-2">
            <span className="text-2xl">🚨</span>
          </div>
          <h2 className="text-xl font-black text-rose-500">Room Not Found</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{roomError}</p>
          <Link href="/" className="w-full py-3 mt-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!nameSaved) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-navy-950 text-zinc-900 dark:text-white flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900 shadow-2xl flex flex-col gap-6 animate-scale-in">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500 mb-3">
              <Film className="w-6 h-6 animate-float" />
            </div>
            <h2 className="text-xl font-black">Join Party</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Enter your nickname below to participate in this swipe room.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-zinc-400">Nickname</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-navy-950 font-bold text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-900 dark:text-white"
              maxLength={20}
              placeholder="E.g. PopcornLover"
            />
          </div>

          <button
            onClick={handleSaveName}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md"
          >
            Confirm Nickname
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-navy-950 text-zinc-900 dark:text-white flex flex-col justify-between select-none">
      
      {/* Top Navbar Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/30">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-extrabold hover:text-violet-500 transition-all text-zinc-500 dark:text-zinc-400"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Party
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Party Room Screen Grid */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {/* Handling logic already lifted out */}
        {!isSwipingStarted ? (
          /* LOBBY STAGE */
          <RoomLobby
            room={room!}
            members={members}
            userId={userId}
            isHost={room!.created_by === userId}
            onStart={startSession}
            isPremium={isPremium}
            onUpgradePrompt={() => setUpgradeOpen(true)}
          />
        ) : (
          /* ACTIVE SWIPING STAGE */
          <div className="w-full flex flex-col items-center gap-6">
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                👥 Party Swipers ({members.length})
              </span>
              <span className="text-xs font-bold text-violet-500">
                Matches: {matchedList.length}
              </span>
            </div>

            {/* Deck aspect container */}
            <div className="w-full flex items-center justify-center py-2">
              {loading ? (
                <SkeletonCard />
              ) : (
                <SwipeDeck
                  movies={movies}
                  currentIndex={moviesMatchedCount}
                  onSwipe={handleSwipeAction}
                  isPremium={isPremium}
                  onUpgradePrompt={() => setUpgradeOpen(true)}
                  activeSwipes={activeSwipes}
                  totalMembers={members.length}
                  undo={() => {
                    setMoviesMatchedCount((prev) => {
                      const newCount = Math.max(0, prev - 1);
                      if (movies[newCount]) {
                        undoSwipe(movies[newCount].id);
                      }
                      return newCount;
                    });
                  }}
                  historyLength={moviesMatchedCount}
                />
              )}
            </div>

            {/* Matched Movie Night list Planner below deck */}
            {matchedList.length > 0 && (
              <div className="w-full mt-4">
                <MovieNightPlanner
                  matchedMovies={matchedList}
                  isPremium={isPremium}
                  onUpgradePrompt={() => setUpgradeOpen(true)}
                  activeSwipes={activeSwipes}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Match Confirmation Confetti Modal */}
      <MatchModal
        isOpen={matchOpen}
        onClose={() => setMatchOpen(false)}
        movie={matchedMovie}
        matchReason={matchReason}
      />

      {/* Upgrade pricing dialog */}
      <UpgradePrompt
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onSuccess={() => alert('CineSwipe+ Premium Active! Access unlocked.')}
        triggerRazorpay={triggerRazorpayCheckout}
      />
    </div>
  );
}
