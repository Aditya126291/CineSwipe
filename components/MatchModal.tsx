'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Share2 } from 'lucide-react';
import type { ContentItem } from '@/lib/types/content';
import ProviderIcons from './ProviderIcons';
import confetti from 'canvas-confetti';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: ContentItem | null;
  matchReason?: string;
}

export default function MatchModal({
  isOpen,
  onClose,
  movie,
  matchReason,
}: MatchModalProps) {
  
  // Fire Canvas Confetti on Mount
  useEffect(() => {
    if (isOpen && movie) {
      // Confetti splash explosion!
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 110 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, movie]);

  if (!movie) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Matched on ${movie.title}!`,
        text: `We matched on ${movie.title}! Let's watch it on CineSwipe.`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(`We matched on ${movie.title}! ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glass backdrop filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-950/95 backdrop-blur-md z-[100]"
          />

          {/* Celebration modal container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] overflow-y-auto select-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 2 }}
              transition={{ type: 'spring', damping: 22, stiffness: 190 }}
              className="w-full max-w-sm rounded-[32px] border border-violet-500/40 bg-gradient-to-b from-navy-900/90 to-navy-950/95 p-7 md:p-8 text-white shadow-2xl relative flex flex-col items-center overflow-hidden"
            >
              {/* Decorative radial glows */}
              <div className="absolute -top-24 w-72 h-72 rounded-full bg-violet-600/15 blur-[60px] pointer-events-none" />
              <div className="absolute -bottom-24 w-72 h-72 rounded-full bg-coral-500/10 blur-[60px] pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Celebrating Match Reason Badge */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600/30 to-coral-500/30 text-white px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase border border-violet-400/30 animate-pulse-glow mb-4 shadow-lg shadow-violet-500/10 glow-violet">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                {matchReason || "It's a Match!"}
              </div>

              <h2 className="text-3xl font-black text-center leading-none mb-1 tracking-tight bg-gradient-to-r from-violet-400 via-coral-400 to-amber-300 bg-clip-text text-transparent">
                IT&apos;S A MATCH!
              </h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-center mb-6">
                Everyone swiped right on this title. Ready to watch?
              </p>

              {/* Matched Poster with glow */}
              <div className="w-44 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-violet-500/40 shadow-2xl relative mb-6 glow-violet animate-float">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.posterUrl || '/poster-placeholder.svg'}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/poster-placeholder.svg';
                  }}
                />
              </div>

              {/* Movie Title & Info */}
              <h3 className="text-xl font-black tracking-tight text-center mb-1">{movie.title}</h3>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-black uppercase tracking-wider mb-4">
                <span>{movie.releaseYear}</span>
                <span>•</span>
                <span>{movie.mediaType}</span>
                <span>•</span>
                <span className="text-amber-500 flex items-center gap-0.5">
                  ★ {movie.rating}
                </span>
              </div>

              {/* Direct streaming provider options */}
              <div className="w-full py-4 border-y border-white/10 mb-6 flex flex-col items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Available to Stream On</span>
                <div className="flex justify-center text-center">
                  <ProviderIcons providers={movie.providers} movieId={movie.id} movieTitle={movie.title} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-coral-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-600/20 active:scale-[0.98] text-white font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-md shadow-violet-600/20 cursor-pointer"
                >
                  🍿 Keep Surfing
                </button>
                <button
                  onClick={handleShare}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/15 active:scale-[0.98] font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Match
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

