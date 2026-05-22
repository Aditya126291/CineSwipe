'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Check, Users, Film, ArrowRight } from 'lucide-react';
import { useState } from 'react';

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
    { icon: <Sparkles className="w-4 h-4 text-pink-500 fill-pink-500" />, title: 'Super Likes ⚡', desc: 'Directly pin a film to everyone else\'s swiping decks.' },
    { icon: <Film className="w-4 h-4 text-sky-500" />, title: 'Full Movie Night Planner', desc: 'Rank and display all matching movies, rather than just the top 3.' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur mask backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-md z-[100]"
          />

          {/* Modal dialogue popup */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900 shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* Top gradient highlight strip */}
              <div className="h-2 w-full bg-gradient-to-r from-violet-600 via-coral-500 to-gold-500" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 transition-all"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 flex flex-col items-center">
                {/* Gold glowing badge */}
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-500 glow-gold animate-float">
                  <Sparkles className="w-6 h-6 fill-current animate-pulse" />
                </div>

                <h3 className="text-2xl font-black text-zinc-950 dark:text-white text-center">
                  Unlock <span className="gradient-text-premium font-black">CineSwipe+</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-1">
                  Enjoy cinema discoveries without boundaries.
                </p>

                {/* Features Checklist */}
                <div className="w-full mt-6 space-y-4">
                  {features.map((f, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 shrink-0 flex items-center justify-center">
                        {f.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          {f.title} <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                          {f.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing / CTA Section */}
                <div className="w-full mt-8 p-4 rounded-2xl bg-zinc-50 dark:bg-navy-950 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-zinc-950 dark:text-white">Lifetime Access Unlock</span>
                      <span className="text-[10px] text-zinc-400">One-time payment, cancel anytime</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-black text-amber-500">₹99 <span className="text-xs font-normal text-zinc-400">/ $2</span></span>
                    </div>
                  </div>

                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-coral-500 to-amber-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Unlock CineSwipe+ <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
