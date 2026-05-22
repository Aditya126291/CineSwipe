'use client';

import { useState } from 'react';
import { Award, Film, Sparkles, Lock, ArrowRight } from 'lucide-react';
import type { ContentItem } from '@/lib/types/content';
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
    <div className="w-full max-w-md p-7 md:p-8 rounded-[32px] border border-white/10 bg-gradient-to-b from-navy-900/90 to-navy-950/95 backdrop-blur-2xl shadow-2xl flex flex-col gap-6 select-none animate-scale-in relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />

      {/* Explanation Heading & Meta info */}
      <div className="flex flex-col gap-1 text-center items-center relative z-10">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 text-black mb-3 shadow-lg shadow-amber-500/20 glow-gold animate-float">
          <Award className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Red Carpet Selections</h2>
        
        {/* UX explanation ranking card */}
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-sm leading-normal mt-1 bg-black/20 dark:bg-navy-950/60 p-3 rounded-2xl border border-white/5">
          ✨ <strong>Engagement Rank:</strong> Matches are ordered based on how quickly your party made a decision, giving superlikes maximum weight.
        </p>
      </div>

      {/* Media filter tabs */}
      <div className="flex bg-black/20 dark:bg-navy-950/60 p-1.5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-wider relative z-10">
        <button
          onClick={() => setContentType('all')}
          className={`flex-1 py-2 text-center rounded-xl transition-all duration-300 cursor-pointer ${
            contentType === 'all'
              ? 'bg-gradient-to-r from-violet-600 to-coral-500 text-white shadow-md shadow-violet-500/20 glow-violet'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
          }`}
        >
          🍿 All Matches
        </button>
        <button
          onClick={() => setContentType('movie')}
          className={`flex-1 py-2 text-center rounded-xl transition-all duration-300 cursor-pointer ${
            contentType === 'movie'
              ? 'bg-gradient-to-r from-violet-600 to-coral-500 text-white shadow-md shadow-violet-500/20 glow-violet'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
          }`}
        >
          🎬 Movies
        </button>
        <button
          onClick={() => setContentType('tv')}
          className={`flex-1 py-2 text-center rounded-xl transition-all duration-300 cursor-pointer ${
            contentType === 'tv'
              ? 'bg-gradient-to-r from-violet-600 to-coral-500 text-white shadow-md shadow-violet-500/20 glow-violet'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
          }`}
        >
          电视 Shows
        </button>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-4 relative z-10">
        {filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400 gap-2.5 border border-dashed border-white/10 rounded-2xl bg-black/10 dark:bg-navy-950/20">
            <Film className="w-8 h-8 opacity-25" />
            <span className="text-[11px] font-black uppercase tracking-wider">No matches recorded yet.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map((item, idx) => {
              // Custom rank medallion classes based on position
              let medallionClass = 'bg-white/5 text-white border-white/15';
              if (idx === 0) {
                medallionClass = 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black border-amber-300 shadow-md shadow-amber-500/20';
              } else if (idx === 1) {
                medallionClass = 'bg-gradient-to-br from-zinc-300 to-zinc-500 text-black border-zinc-200 shadow-md shadow-zinc-500/10';
              } else if (idx === 2) {
                medallionClass = 'bg-gradient-to-br from-orange-400 to-orange-700 text-white border-orange-300 shadow-md shadow-orange-500/10';
              }

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 dark:bg-navy-950/40 border border-white/5 hover:bg-white/10 dark:hover:bg-navy-950/80 hover:border-white/10 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Ranking Medallion Badge */}
                  <div className={`w-9 h-9 rounded-full font-black text-xs shrink-0 flex items-center justify-center border transition-all duration-300 ${medallionClass}`}>
                    #{idx + 1}
                  </div>

                  {/* Thumbnail Poster */}
                  <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-zinc-800 relative shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.posterUrl || '/poster-placeholder.svg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
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
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-1 font-bold">
                      <span>{item.releaseYear}</span>
                      <span>•</span>
                      <span className="text-amber-500 flex items-center gap-0.5">
                        ★ {item.rating}
                      </span>
                    </div>
                    {/* Streamers availability */}
                    <div className="mt-2 flex items-center gap-1">
                      <ProviderIcons providers={item.providers} movieId={item.id} movieTitle={item.title} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Blurred paywall elements mask for limited free tier */}
            {!isPremium && hiddenCount > 0 && (
              <div
                onClick={onUpgradePrompt}
                className="p-6 rounded-2xl border border-dashed border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-amber-600/10 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/15 active:scale-[0.98] transition-all duration-300"
              >
                <Lock className="w-6 h-6 text-amber-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-amber-500 flex items-center gap-1 justify-center uppercase tracking-wide">
                    Leaderboard Locked (+{hiddenCount} Titles) <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5">
                    Unlock CineSwipe+ to rank all matches and sync them to your stream feeds.
                  </span>
                </div>
                <span className="mt-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 glow-gold transition-all hover:scale-105 active:scale-95 shadow-md shadow-amber-500/25">
                  Unlock Leaderboard <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

