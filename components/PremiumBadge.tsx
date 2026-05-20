'use client';

import { Sparkles } from 'lucide-react';

export default function PremiumBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-full animate-pulse-glow"
      title="CineSwipe+ Premium Member"
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      CineSwipe+
    </span>
  );
}
