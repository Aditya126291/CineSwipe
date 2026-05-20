'use client';

import { Zap } from 'lucide-react';
import Link from 'next/link';

interface SwipeCounterProps {
  swipesLeft: number;
  maxSwipes: number;
  isPremium: boolean;
}

export default function SwipeCounter({ swipesLeft, maxSwipes, isPremium }: SwipeCounterProps) {
  if (isPremium) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-semibold text-xs animate-pulse-glow">
        <Zap className="w-3.5 h-3.5 fill-amber-500" />
        Unlimited Surfing
      </div>
    );
  }

  const percentage = (swipesLeft / maxSwipes) * 100;
  const isLow = swipesLeft <= 5;

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold ${isLow ? 'text-rose-500 animate-pulse' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {swipesLeft} / {maxSwipes} Daily Swipes Left
        </span>
        <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${isLow ? 'bg-rose-500' : 'bg-violet-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {isLow && (
        <Link
          href="/upgrade"
          className="text-[10px] font-bold text-amber-500 hover:text-amber-400 hover:underline transition-all"
        >
          Unlock Unlimited ⭐
        </Link>
      )}
    </div>
  );
}
