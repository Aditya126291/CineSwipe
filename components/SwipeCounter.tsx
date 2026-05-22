'use client';

import { Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SwipeCounterProps {
  swipesLeft: number;
  maxSwipes: number;
  isPremium: boolean;
}

export default function SwipeCounter({ swipesLeft, maxSwipes, isPremium }: SwipeCounterProps) {
  if (isPremium) {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-600/15 border border-amber-500/40 text-amber-400 font-black text-[10px] tracking-wider uppercase shadow-lg shadow-amber-500/10 glow-gold animate-pulse-glow select-none">
        <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
        Unlimited Surfing
      </div>
    );
  }

  const percentage = (swipesLeft / maxSwipes) * 100;
  const isLow = swipesLeft <= 5;

  return (
    <div className="flex flex-col gap-1.5 items-end select-none">
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-black tracking-wider uppercase ${isLow ? 'text-coral-500 animate-pulse' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {swipesLeft} / {maxSwipes} Daily Swipes Left
        </span>
        <div className="w-20 h-2.5 bg-white/5 dark:bg-navy-950/50 border border-zinc-200/50 dark:border-white/5 rounded-full overflow-hidden p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isLow 
                ? 'bg-gradient-to-r from-rose-600 to-coral-500 shadow-md shadow-coral-500/30' 
                : 'bg-gradient-to-r from-violet-600 to-coral-500 shadow-md shadow-violet-500/30'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {isLow && (
        <Link
          href="/upgrade"
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 hover:scale-105 active:scale-95 transition-all duration-300 hover:underline"
        >
          <Sparkles className="w-2.5 h-2.5 fill-amber-400" /> Unlock Unlimited ⭐
        </Link>
      )}
    </div>
  );
}

