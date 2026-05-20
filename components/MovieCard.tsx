'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, X, Eye, Film, Sparkles, AlertCircle } from 'lucide-react';
import type { ContentItem } from '@/lib/tmdb/types';
import ProviderIcons from './ProviderIcons';

interface MovieCardProps {
  movie: ContentItem;
  isFlipped: boolean;
  onFlip: (flipped: boolean) => void;
  isPremium: boolean;
  onUpgradePrompt: () => void;
}

export default function MovieCard({ movie, isFlipped, onFlip, isPremium, onUpgradePrompt }: MovieCardProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Stop video when card flips back or unmounts
  useEffect(() => {
    if (!isFlipped) {
      setIsPlaying(false);
    }
  }, [isFlipped]);

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
    setIsPlaying(true);
  };

  const handleTrailerStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
  };

  const getYoutubeEmbedUrl = (key?: string) => {
    if (!key) return '';
    return `https://www.youtube.com/embed/${key}?autoplay=1&enablejsapi=1&rel=0`;
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-full max-w-sm aspect-[2/3] md:max-w-md rounded-3xl cursor-pointer perspective-1000 select-none relative preserve-3d transition-transform duration-300"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 80 }}
        className="w-full h-full relative preserve-3d flex flex-col"
      >
        {/* ================= FRONT SIDE ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-navy-950 flex flex-col overflow-hidden shadow-2xl">
          {/* Movie Poster Background */}
          <div className="w-full flex-1 bg-zinc-900 relative overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              draggable={false}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-black/30" />

            {/* Poster Info Pills */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-black/60 text-white rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1">
                {movie.mediaType === 'tv' ? 'Series' : 'Movie'}
              </span>
              {movie.mediaType === 'tv' && movie.numberOfSeasons && (
                <span className="px-2.5 py-1 text-[10px] font-extrabold bg-violet-600/70 text-white rounded-full backdrop-blur-md border border-violet-500/20">
                  {movie.numberOfSeasons} Seasons
                </span>
              )}
            </div>

            {/* Tap to Flip Guide Indicator */}
            <div className="absolute bottom-4 right-4 animate-float flex items-center gap-1 text-[10px] font-bold text-white bg-black/60 border border-white/15 px-2.5 py-1 rounded-full backdrop-blur-md">
              <Play className="w-3 h-3 fill-white" /> Tap to Watch Trailer
            </div>
          </div>

          {/* Details Footer */}
          <div className="p-6 bg-white dark:bg-navy-950 flex flex-col gap-2">
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white truncate">
                {movie.title}
              </h2>
              <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-sm">
                <Star className="w-4 h-4 fill-amber-500" />
                {movie.rating || 'N/A'}
              </div>
            </div>

            {/* Release year and metadata info */}
            <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span>{movie.releaseYear}</span>
              <span>•</span>
              <span className="capitalize">{movie.mediaType}</span>
              {movie.voteCount > 0 && (
                <>
                  <span>•</span>
                  <span>({movie.voteCount.toLocaleString()} votes)</span>
                </>
              )}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed mt-1">
              {movie.overview || 'No description available.'}
            </p>
          </div>
        </div>

        {/* ================= BACK SIDE (Y-Axis 180 Rotated) ================= */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-navy-950 flex flex-col overflow-hidden shadow-2xl"
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
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={handleTrailerStop}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black transition-all"
                  aria-label="Stop video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.backdropUrl || movie.posterUrl}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px]"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/40" />

                {movie.trailerKey ? (
                  <button
                    onClick={handleTrailerPlay}
                    className="p-4 rounded-full bg-violet-600/90 text-white border border-violet-400 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center z-10"
                    aria-label="Play Trailer"
                  >
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-400 z-10 text-center px-4">
                    <Film className="w-10 h-10 text-zinc-500" />
                    <span className="text-xs font-bold">Official trailer unavailable</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details & Interactive Provider Links */}
          <div className="p-6 flex-1 flex flex-col justify-between bg-navy-950 text-white">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-lg font-extrabold truncate">{movie.title}</h3>
                <span className="text-xs bg-white/10 border border-white/15 px-2.5 py-1 rounded-full backdrop-blur-md">
                  Trailer Details
                </span>
              </div>

              {/* Streaming Platforms availability grid */}
              <div className="no-flip">
                <ProviderIcons providers={movie.providers} />
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
                  className="no-flip mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-amber-400 hover:bg-amber-500/15 active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold flex items-center gap-1 uppercase">
                        Get Deep Streams link <Sparkles className="w-2.5 h-2.5 fill-amber-400" />
                      </span>
                      <span className="text-[9px] text-zinc-400 leading-tight">
                        Unlock deep streaming links with CineSwipe+
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-amber-500 px-2 py-1 bg-amber-500/15 rounded-md shrink-0">
                    Unlock
                  </span>
                </div>
              )}

              {/* Close Button to flip back */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFlip(false);
                }}
                className="w-full py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:scale-98 text-xs font-bold transition-all text-center flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Resume Swiping
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
