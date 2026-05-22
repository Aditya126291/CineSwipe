'use client';

import { useRef } from 'react';
import type { Genre } from '@/lib/types/content';
import { Lock, Sparkles } from 'lucide-react';

interface GenreFilterProps {
  genres: Genre[];
  selectedGenreId?: number;
  onGenreSelect: (genreId?: number) => void;
  isPremium: boolean;
  onUpgradePrompt: () => void;
}

export default function GenreFilter({
  genres,
  selectedGenreId,
  onGenreSelect,
  isPremium,
  onUpgradePrompt,
}: GenreFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenreClick = (genreId?: number, idx?: number) => {
    if (!isPremium && idx && idx >= 3) {
      onUpgradePrompt();
      return;
    }
    onGenreSelect(genreId);
  };

  return (
    <div className="w-full max-w-sm md:max-w-md relative overflow-hidden py-2 select-none">
      {/* Horizontally scrolling pill filter list */}
      <div
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto hide-scrollbar scroll-smooth px-1 py-1"
      >
        <button
          onClick={() => handleGenreClick(undefined)}
          className={`px-4 py-2 rounded-full text-xs font-black tracking-wide uppercase transition-all duration-300 border whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95 ${
            selectedGenreId === undefined
              ? 'bg-gradient-to-r from-violet-600 to-coral-500 border-violet-500/30 text-white shadow-lg shadow-violet-500/20 glow-violet'
              : 'bg-white/5 dark:bg-navy-950/40 border-zinc-200/50 dark:border-white/5 text-zinc-700 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/15 backdrop-blur-md'
          }`}
        >
          🍿 All
        </button>

        {genres.map((g, idx) => {
          const isSelected = selectedGenreId === g.id;
          const isLocked = !isPremium && idx >= 3;

          return (
            <button
              key={g.id}
              onClick={() => handleGenreClick(g.id, idx)}
              className={`px-4 py-2 rounded-full text-xs font-black tracking-wide uppercase transition-all duration-300 border flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-violet-600 to-coral-500 border-violet-500/30 text-white shadow-lg shadow-violet-500/20 glow-violet'
                  : 'bg-white/5 dark:bg-navy-950/40 border-zinc-200/50 dark:border-white/5 text-zinc-700 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/15 backdrop-blur-md'
              }`}
            >
              {g.name}
              {isLocked && (
                <span className="p-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/20">
                  <Lock className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}

        {!isPremium && (
          <button
            onClick={onUpgradePrompt}
            className="px-4 py-2 rounded-full text-xs font-black tracking-wide uppercase bg-gradient-to-r from-amber-500/20 to-amber-600/35 border border-amber-500/40 text-amber-400 flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-amber-500/10 cursor-pointer animate-pulse-glow"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-500/30 text-amber-400" /> Unlock More
          </button>
        )}
      </div>
    </div>
  );
}

