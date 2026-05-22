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
        className="flex items-center gap-2 overflow-x-auto hide-scrollbar scroll-smooth px-1"
      >
        <button
          onClick={() => handleGenreClick(undefined)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border whitespace-nowrap ${
            selectedGenreId === undefined
              ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/25 glow-violet'
              : 'bg-white dark:bg-navy-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          🍿 All Genres
        </button>

        {genres.map((g, idx) => {
          const isSelected = selectedGenreId === g.id;
          const isLocked = !isPremium && idx >= 3;

          return (
            <button
              key={g.id}
              onClick={() => handleGenreClick(g.id, idx)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/25 glow-violet'
                  : 'bg-white dark:bg-navy-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {g.name}
              {isLocked && (
                <span className="p-0.5 rounded-full bg-amber-500/10 text-amber-500">
                  <Lock className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}

        {!isPremium && (
          <button
            onClick={onUpgradePrompt}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/10 to-amber-600/15 border border-amber-500/30 text-amber-500 flex items-center gap-1 whitespace-nowrap animate-pulse-glow"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" /> Unlock More
          </button>
        )}
      </div>
    </div>
  );
}
