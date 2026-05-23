'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Check, Users, Film, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { getClientRegion } from '@/lib/catalog/providers-geo';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  triggerRazorpay: (onSuccess: () => void, onError: (err: unknown) => void) => void;
}

export default function UpgradePrompt({ isOpen, onClose, onSuccess, triggerRazorpay }: UpgradePromptProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpgrade = () => {
    setLoading(true);
    triggerRazorpay(
      () => {
        setLoading(false);
        onSuccess();
        onClose();
      },
      (err) => {
        setLoading(false);
        console.error('Payment failure:', err);
      }
    );
  };

  const features = [
    { icon: <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />, title: 'Unlimited Swipes', desc: 'No daily limit on scrolling through movie options.' },
    { icon: <Users className="w-4 h-4 text-violet-500" />, title: '10-Person Multiplayer Rooms', desc: 'Host groups up to 10 friends. Free rooms max out at 3.' },
    { icon: <Sparkles className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />, title: 'Super Likes ⚡', desc: 'Directly pin a film to everyone else\'s swiping decks.' },
    { icon: <Film className="w-4 h-4 text-sky-500" />, title: 'Full Movie Night Planner', desc: 'Rank and display all matching movies, rather than just the top 3.' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur mask backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-950/95 backdrop-blur-md z-[100]"
          />

          {/* Modal dialogue popup */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] overflow-y-auto select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 24, stiffness: 210 }}
              className="w-full max-w-md rounded-[32px] border border-white/10 bg-gradient-to-b from-navy-900/95 to-navy-950/98 shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* Decorative radial glows */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />

              {/* Top gradient highlight strip */}
              <div className="h-2 w-full bg-gradient-to-r from-violet-600 via-coral-500 to-amber-500" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="p-7 md:p-8 flex flex-col items-center relative z-10">
                {/* Gold glowing badge */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 text-black flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25 glow-gold animate-float">
                  <Sparkles className="w-5 h-5 fill-current animate-pulse" />
                </div>

                <h3 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white text-center">
                  Unlock <span className="gradient-text-premium font-black">CineSwipe+</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
                  Enjoy cinema discoveries without boundaries.
                </p>

                {/* Features Checklist */}
                <div className="w-full mt-6 space-y-4">
                  {features.map((f, idx) => (
                    <div key={idx} className="flex gap-3.5 p-3 rounded-2xl bg-white/5 dark:bg-navy-950/40 border border-white/5 hover:border-white/10 transition-all duration-300">
                      <div className="p-2.5 rounded-xl bg-white/5 dark:bg-navy-950/50 border border-white/5 shrink-0 flex items-center justify-center">
                        {f.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-1.5">
                          {f.title} <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        </span>
                        <span className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                          {f.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing / CTA Section */}
                <div className="w-full mt-8 p-5 rounded-2xl bg-black/20 dark:bg-navy-950/60 border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950 dark:text-white">Lifetime Access Pass</span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">One-time payment • Forever yours</span>
                    </div>
                    <div className="flex flex-col items-end">
                      {getClientRegion() === 'IN' ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-zinc-500 line-through text-sm font-bold">$3</span>
                          <span className="text-2xl font-black text-amber-400">₹99</span>
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-amber-400">$3</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-coral-500 to-amber-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-600/20 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-white font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 cursor-pointer glow-violet"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Unlock CineSwipe+ <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>

                  {/* Test Mode / Sandbox Notice */}
                  <div className="w-full mt-1 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center flex flex-col gap-1 pointer-events-none">
                    <span className="text-[9px] text-amber-400 font-black tracking-widest uppercase flex items-center justify-center gap-1">
                      ⚠️ Sandbox Test Mode
                    </span>
                    <p className="text-[9px] text-zinc-400 normal-case font-bold leading-normal">
                      This is a demo checkout. Use mock credentials (e.g., Card: <code className="bg-white/5 px-1 py-0.5 rounded text-amber-300 font-mono">4111 1111 1111 1111</code>, CVV: <code className="bg-white/5 px-1 py-0.5 rounded text-amber-300 font-mono">123</code>) or mock UPI to test.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

