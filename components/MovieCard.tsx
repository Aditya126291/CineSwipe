'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Play, X, Film, Sparkles, AlertCircle } from 'lucide-react';
import type { ContentItem } from '@/lib/types/content';
import ProviderIcons from './ProviderIcons';

interface MovieCardProps {
  movie: ContentItem;
  isFlipped: boolean;
  onFlip: (flipped: boolean) => void;
  isPremium: boolean;
  onUpgradePrompt: () => void;
}

export default function MovieCard({ movie, isFlipped, onFlip, isPremium, onUpgradePrompt }: MovieCardProps) {
  const [prevIsFlipped, setPrevIsFlipped] = useState<boolean>(isFlipped);
  const [isStopped, setIsStopped] = useState<boolean>(false);

  // Synchronously adjust state when flip status changes during rendering
  if (isFlipped !== prevIsFlipped) {
    setPrevIsFlipped(isFlipped);
    setIsStopped(false);
  }

  const isPlaying = isFlipped && !isStopped;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [posterRetryCount, setPosterRetryCount] = useState<Record<number, number>>({});
  const [backdropRetryCount, setBackdropRetryCount] = useState<Record<number, number>>({});

  // Synchronously compute the poster source at render time
  const currentPosterRetry = posterRetryCount[movie.id] || 0;
  let posterSrc: string;
  if (!movie.posterUrl) {
    posterSrc = '/poster-placeholder.svg';
  } else if (currentPosterRetry >= 3) {
    posterSrc = '/poster-placeholder.svg';
  } else if (currentPosterRetry > 0) {
    const separator = movie.posterUrl.includes('?') ? '&' : '?';
    posterSrc = `${movie.posterUrl}${separator}retry=${currentPosterRetry}`;
  } else {
    posterSrc = movie.posterUrl;
  }

  // Synchronously compute the backdrop source at render time
  const currentBackdropRetry = backdropRetryCount[movie.id] || 0;
  const originalBackdropUrl = movie.backdropUrl || movie.posterUrl;
  let backdropSrc: string;
  if (!originalBackdropUrl) {
    backdropSrc = '/poster-placeholder.svg';
  } else if (currentBackdropRetry >= 3) {
    backdropSrc = '/poster-placeholder.svg';
  } else if (currentBackdropRetry > 0) {
    const separator = originalBackdropUrl.includes('?') ? '&' : '?';
    backdropSrc = `${originalBackdropUrl}${separator}retry=${currentBackdropRetry}`;
  } else {
    backdropSrc = originalBackdropUrl;
  }

  const handlePosterError = () => {
    if (movie.posterUrl && currentPosterRetry < 3) {
      setTimeout(() => {
        setPosterRetryCount((prev) => ({
          ...prev,
          [movie.id]: currentPosterRetry + 1,
        }));
      }, 600);
    } else {
      setPosterRetryCount((prev) => ({ ...prev, [movie.id]: 3 }));
    }
  };

  const handleBackdropError = () => {
    if (originalBackdropUrl && currentBackdropRetry < 3) {
      console.log(`Backdrop failed to load for "${movie.title}". Retrying (${currentBackdropRetry + 1}/3)`);
      setTimeout(() => {
        setBackdropRetryCount((prev) => ({
          ...prev,
          [movie.id]: currentBackdropRetry + 1,
        }));
      }, 600);
    } else {
      setBackdropRetryCount((prev) => ({
        ...prev,
        [movie.id]: 3,
      }));
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setPosterRetryCount({});
    }, 0);
  }, [movie.id]);



  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid flipping when clicking inside interactive items
    const target = e.target as HTMLElement;
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('iframe') ||
      target.closest('.no-flip')
    ) {
      return;
    }
    onFlip(!isFlipped);
  };

  const handleTrailerPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStopped(false);
  };

  const handleTrailerStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStopped(true);
  };

  const getYoutubeEmbedUrl = (key?: string) => {
    if (!key) return '';
    return `https://www.youtube.com/embed/${key}?autoplay=1&enablejsapi=1&rel=0`;
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-full max-w-sm aspect-[2/3] md:max-w-md rounded-[32px] cursor-pointer perspective-1000 select-none relative preserve-3d transition-transform duration-300 hover:scale-[1.01]"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 90 }}
        className="w-full h-full relative preserve-3d flex flex-col"
      >
        {/* ================= FRONT SIDE ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-[30px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-navy-950 flex flex-col overflow-hidden shadow-2xl transition-colors duration-300">
          
          {/* Movie Poster Background */}
          <div className="w-full flex-1 bg-zinc-950 relative overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={movie.id}
              src={posterSrc}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              draggable={false}
              onError={handlePosterError}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-black/35" />

            {/* Poster Info Pills */}
            <div className="absolute top-5 left-5 flex gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase bg-black/60 text-white rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-md">
                {movie.mediaType === 'tv' ? 'Series' : 'Movie'}
              </span>
              {movie.mediaType === 'tv' && movie.numberOfSeasons && (
                <span className="px-3 py-1 text-[10px] font-black bg-violet-600/80 text-white rounded-xl backdrop-blur-md border border-violet-500/20 shadow-md">
                  {movie.numberOfSeasons} Seasons
                </span>
              )}
            </div>

            {/* Tap to Flip Guide Indicator */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFlip(true);
              }}
              className="no-flip absolute bottom-5 right-5 animate-float flex items-center gap-1.5 text-[10px] font-black text-white bg-violet-600/90 hover:bg-violet-600 border border-violet-400/40 px-3.5 py-1.5 rounded-full backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg shadow-violet-500/30 z-20"
              aria-label="Show trailer details and flip card"
              data-testid="card-flip-button"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Watch Trailer
            </button>
          </div>

          {/* Details Footer */}
          <div className="p-6 bg-white dark:bg-navy-900 flex flex-col gap-2.5 border-t border-zinc-150 dark:border-white/5">
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-2xl font-black text-zinc-950 dark:text-white truncate tracking-tight">
                {movie.title}
              </h2>
              <div className="flex items-center gap-1 text-amber-500 font-extrabold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-xl text-xs shrink-0 shadow-sm backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                {movie.rating || 'N/A'}
              </div>
            </div>

            {/* Release year and metadata info */}
            <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">
              <span>{movie.releaseYear}</span>
              <span className="text-zinc-300 dark:text-zinc-800">•</span>
              <span className="capitalize text-violet-500 dark:text-violet-400">{movie.mediaType}</span>
              {movie.voteCount > 0 && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-800">•</span>
                  <span className="text-[10px]">({movie.voteCount.toLocaleString()} votes)</span>
                </>
              )}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed font-medium mt-1">
              {movie.overview || 'No description available.'}
            </p>
          </div>
        </div>

        {/* ================= BACK SIDE (Y-Axis 180 Rotated) ================= */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-[30px] border border-zinc-200 dark:border-white/10 bg-navy-950 flex flex-col overflow-hidden shadow-2xl"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Interactive Trailer Core */}
          <div className="w-full aspect-video bg-black relative flex items-center justify-center group no-flip">
            {isPlaying && movie.trailerKey ? (
              <div className="w-full h-full relative">
                <iframe
                  ref={iframeRef}
                  src={getYoutubeEmbedUrl(movie.trailerKey)}
                  title={`${movie.title} Official Trailer`}
                  className="w-full h-full border-b border-white/5"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={handleTrailerStop}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/70 border border-white/20 text-white hover:bg-black transition-all shadow-md cursor-pointer"
                  aria-label="Stop video"
                  data-testid="trailer-stop-button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center bg-zinc-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={movie.id}
                  src={backdropSrc}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-35 blur-[1px] transition-transform duration-500"
                  draggable={false}
                  onError={handleBackdropError}
                />
                <div className="absolute inset-0 bg-black/50" />

                {movie.trailerKey ? (
                  <button
                    onClick={handleTrailerPlay}
                    className="p-5 rounded-full bg-violet-600/90 text-white border border-violet-400 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-violet-500/40 flex items-center justify-center z-10 cursor-pointer"
                    aria-label="Play Trailer"
                    data-testid="trailer-play-button"
                  >
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2.5 text-zinc-400 z-10 text-center px-4">
                    <Film className="w-10 h-10 text-zinc-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Official trailer unavailable</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details & Interactive Provider Links */}
          <div className="p-6 flex-1 flex flex-col justify-between bg-navy-950 text-white relative">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-xl font-black truncate tracking-tight">{movie.title}</h3>
                <span className="text-[10px] font-black uppercase tracking-wide bg-white/10 border border-white/15 px-3 py-1 rounded-xl backdrop-blur-md text-zinc-300">
                  Trailer Details
                </span>
              </div>

              {/* Streaming Platforms availability grid */}
              <div className="no-flip bg-navy-900/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                <ProviderIcons providers={movie.providers} movieId={movie.id} movieTitle={movie.title} />
              </div>
            </div>

            {/* Upgrade prompts or premium details */}
            <div className="space-y-4">
              {!isPremium && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpgradePrompt();
                  }}
                  role="button"
                  aria-label="Unlock deep stream links with CineSwipe+"
                  data-testid="card-upgrade-button"
                  className="no-flip mt-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-400 hover:bg-amber-500/15 active:scale-98 transition-all duration-300 cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shadow-sm animate-pulse">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black flex items-center gap-1 uppercase tracking-wide text-amber-500">
                        Get Deep Streams <Sparkles className="w-3 h-3 fill-amber-500" />
                      </span>
                      <span className="text-[10px] text-zinc-400 leading-tight font-medium">
                        Unlock deep streaming links with CineSwipe+
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-white px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-xl shrink-0 transition-colors shadow-sm">
                    Unlock
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
