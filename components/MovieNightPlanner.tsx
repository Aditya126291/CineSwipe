'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Film, Play, Sparkles, Lock, ArrowRight, Star, RefreshCw, AlertCircle } from 'lucide-react';
import type { ContentItem } from '@/lib/tmdb/types';
import ProviderIcons from './ProviderIcons';

interface MovieNightPlannerProps {
  matchedMovies: ContentItem[];
  isPremium: boolean;
  onUpgradePrompt: () => void;
  activeSwipes?: Record<number, Record<string, { direction: string; timestamp: number }>>;
}

export default function MovieNightPlanner({
  matchedMovies,
  isPremium,
  onUpgradePrompt,
  activeSwipes = {},
}: MovieNightPlannerProps) {
  const [contentType, setContentType] = useState<'all' | 'movie' | 'tv'>('all');

  // Filter matched items based on select mediaType
  const filteredMatches = matchedMovies.filter((m) => {
    if (contentType === 'all') return true;
    return m.mediaType === contentType;
  });

  // Rank matches by speed score (faster = lower score)
  const rankedMatches = [...filteredMatches].sort((a, b) => {
    const getScore = (movie: ContentItem) => {
      const swipes = activeSwipes[movie.id] || {};
      const swipeValues = Object.values(swipes);
      if (swipeValues.length === 0) return Number.MAX_SAFE_INTEGER;
      
      const timestamps = swipeValues.map(s => s.timestamp).filter(Boolean);
      if (timestamps.length < 2) return Number.MAX_SAFE_INTEGER; // Not enough data
      
      const maxTime = Math.max(...timestamps);
      const minTime = Math.min(...timestamps);
      const rawSpeed = maxTime - minTime;
      
      const superlikes = swipeValues.filter(s => s.direction === 'superlike').length;
      return rawSpeed - (superlikes * 2500); // 2.5s bonus per superlike
    };
    return getScore(a) - getScore(b);
  });

  // Free tier displays only the top 3 matched movies. Premium ranks them all.
  const freeTierLimit = 3;
  const displayList = isPremium ? rankedMatches : rankedMatches.slice(0, freeTierLimit);
  const hiddenCount = rankedMatches.length - displayList.length;

  return (
    <div className="w-full max-w-md p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900 shadow-2xl flex flex-col gap-6 select-none animate-scale-in">
      
      {/* Explanation Heading & Meta info */}
      <div className="flex flex-col gap-1 text-center items-center">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 mb-2 animate-float">
          <Award className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-zinc-950 dark:text-white">Your Movie Night Planner</h2>
        
        {/* Important user-requested UX adjustment explaining ranking */}
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mt-1 bg-zinc-50 dark:bg-navy-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-800/40">
          ✨ <strong>Excitement Rank:</strong> Ranks are based on how fast your party liked the card — not on critical ratings. Every matched title is a winner!
        </p>
      </div>

      {/* Selector Filters: All / Movies / Series */}
      <div className="flex bg-zinc-100 dark:bg-navy-950 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60 text-xs">
        <button
          onClick={() => setContentType('all')}
          className={`flex-1 py-2 font-extrabold text-center rounded-lg transition-all ${
            contentType === 'all'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          🍿 All Items
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

      {/* Ranks list representation */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400 gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-navy-950/20">
            <Film className="w-8 h-8 opacity-30" />
            <span className="text-xs font-bold">No matches found for this filter yet.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 dark:bg-navy-950 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-navy-950/90 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Ranking Medallion Badge */}
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-black text-xs shrink-0 flex items-center justify-center border border-violet-500/20">
                  #{idx + 1}
                </div>

                {/* Thumbnail Poster */}
                <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-zinc-800 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.posterUrl || '/poster-placeholder.svg'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/poster-placeholder.svg';
                    }}
                  />
                </div>

                {/* Movie Title & Providers Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-zinc-900 dark:text-white truncate block">
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                    <span>{item.releaseYear}</span>
                    <span>•</span>
                    <span className="text-amber-500 flex items-center gap-0.5 font-bold">
                      ★ {item.rating}
                    </span>
                  </div>
                  {/* Dynamic Region Streamers availability */}
                  <div className="mt-1.5 flex items-center gap-1">
                    <ProviderIcons providers={item.providers} />
                  </div>
                </div>
              </div>
            ))}

            {/* Blurred paywall elements mask for limited free tier */}
            {!isPremium && hiddenCount > 0 && (
              <div
                onClick={onUpgradePrompt}
                className="p-5 rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-amber-500/10 active:scale-[0.98] transition-all duration-300"
              >
                <Lock className="w-6 h-6 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-amber-500 flex items-center gap-1 justify-center">
                    Ranks Locked (+{hiddenCount} Matched Titles) <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Unlock to rank and view all matches on your stream feeds
                  </span>
                </div>
                <span className="mt-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  Go CineSwipe+ <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
