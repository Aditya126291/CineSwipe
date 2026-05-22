'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Zap, Users, Film, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePremium } from '@/hooks/usePremium';
import ThemeToggle from '@/components/ThemeToggle';

export default function UpgradePage() {
  const router = useRouter();
  const { triggerRazorpayCheckout } = usePremium();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleUpgrade = () => {
    setLoading(true);
    triggerRazorpayCheckout(
      () => {
        setLoading(false);
        setSuccess(true);
      },
      (err) => {
        setLoading(false);
        console.error('Payment failure:', err);
      }
    );
  };

  const features = [
    { icon: <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />, title: 'Unlimited Daily Swipes', desc: 'No limits on your scrolling feed. Keep swiping solo or with parties as long as you want.' },
    { icon: <Users className="w-5 h-5 text-violet-500" />, title: '10-Person Multiplayer Rooms', desc: 'Invite up to 10 friends to a room code. Free accounts are limited to 3 members.' },
    { icon: <Sparkles className="w-5 h-5 text-pink-500 fill-pink-500" />, title: 'Super Likes ⚡', desc: 'Directly force a card on everyone else\'s active stack with special glowing visual indicators.' },
    { icon: <Film className="w-5 h-5 text-sky-500" />, title: 'Comprehensive Movie Night Planner', desc: 'Rank and display every single matched movie for your party. Free accounts only rank top 3.' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-navy-950 text-zinc-900 dark:text-white flex flex-col justify-between select-none">
      
      {/* Top Navbar */}
      <header className="w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-extrabold hover:text-violet-500 transition-all text-zinc-500 dark:text-zinc-400"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lobby
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main pricing lander container */}
      <main className="flex-1 flex items-center justify-center p-6 max-w-4xl mx-auto w-full">
        {success ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-8 rounded-3xl border border-violet-500/20 bg-white dark:bg-navy-900 shadow-2xl flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 glow-gold animate-float">
              <Sparkles className="w-7 h-7 fill-current animate-pulse" />
            </div>
            <h2 className="text-2xl font-black gradient-text-premium uppercase">CineSwipe+ Unlocked!</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              Thank you for supporting CineSwipe! Your lifetime premium upgrade is active. Go back to lobby to start unlimited parties!
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-violet-600/20"
            >
              Start Popcorn Party
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 items-center w-full">
            {/* Visual Intro Column */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-extrabold text-[10px] tracking-wider uppercase animate-pulse-glow">
                <Sparkles className="w-3.5 h-3.5 fill-amber-500" /> Premium Member Unlock
              </div>
              <h1 className="text-4xl font-black tracking-tight leading-tight">
                Unlock cinema discoveries without boundaries with{' '}
                <span className="gradient-text-premium font-black">CineSwipe+</span>
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
                One simple payment. No recurring monthly subscriptions. Enjoy our ultimate features for less than a samosa plate!
              </p>

              {/* Dynamic Feature checklist */}
              <div className="space-y-4">
                {features.map((f, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-navy-900 border border-zinc-200 dark:border-zinc-800/80 shrink-0 flex items-center justify-center">
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
            </div>

            {/* Price Medal card Column */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900/90 shadow-2xl overflow-hidden flex flex-col relative">
                {/* Visual strip highlight */}
                <div className="h-2 w-full bg-gradient-to-r from-violet-600 via-coral-500 to-amber-500" />

                <div className="p-8 flex flex-col items-center">
                  <span className="text-xs font-extrabold bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 px-3 py-1 rounded-full uppercase tracking-wider">
                    Lifetime Premium
                  </span>
                  
                  <div className="flex items-baseline gap-1 mt-6">
                    <span className="text-5xl font-black tracking-tight text-zinc-950 dark:text-white">
                      ₹99
                    </span>
                    <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      / one-time
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1">
                    Equivalent to $2 USD. Pay once, use forever.
                  </span>

                  {/* Payment Verification list */}
                  <div className="w-full space-y-3 mt-8 py-6 border-y border-zinc-150 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      Secure payment verified by Razorpay
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      UPI, Netbanking, Cards & Wallets supported
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      100% Ad-Free interface
                    </div>
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-coral-500 to-amber-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 mt-8"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Unlock CineSwipe+ <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer metadata info */}
      <footer className="py-8 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
        🛡️ Secure payment powered by Razorpay. CineSwipe will never store card credentials.
      </footer>
    </div>
  );
}
