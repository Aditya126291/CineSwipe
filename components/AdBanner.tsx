'use client';

import { Film, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AdBannerProps {
  isPremium: boolean;
}

export default function AdBanner({ isPremium }: AdBannerProps) {
  if (isPremium) return null;

  return (
    <div className="w-full max-w-sm mt-4 p-3 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 to-navy-900/60 backdrop-blur-md flex items-center justify-between gap-4 animate-slide-up">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
          <Film className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white flex items-center gap-1">
            Remove Ads & Swipe Together <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
          </span>
          <span className="text-[10px] text-zinc-400">
            One-time unlock for only ₹99 / $2
          </span>
        </div>
      </div>
      <Link
        href="/upgrade"
        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-coral-500 text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-violet-500/25"
      >
        Upgrade
      </Link>
    </div>
  );
}
