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
    { icon: <Sparkles className="w-5 h-5 text-pink-500 fill-pink-500 animate-pulse" />, title: 'Super Likes ⚡', desc: 'Directly force a card on everyone else\'s active stack with special glowing visual indicators.' },
    { icon: <Film className="w-5 h-5 text-sky-500" />, title: 'Comprehensive Movie Night Planner', desc: 'Rank and display every single matched movie for your party. Free accounts only rank top 3.' },
  ];

  return (
    <div className="min-h-screen bg-[#05060d] dark:bg-[#05060d] text-zinc-950 dark:text-white flex flex-col justify-between select-none relative overflow-hidden font-sans">
      
      {/* Decorative background glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-coral-500/5 blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider hover:text-violet-400 transition-all text-zinc-500 dark:text-zinc-400"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" /> Back to Lobby
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main pricing lander container */}
      <main className="flex-1 flex items-center justify-center p-6 max-w-4xl mx-auto w-full relative z-10">
        {success ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-8 rounded-[32px] border border-white/10 bg-gradient-to-b from-navy-900/90 to-navy-950/95 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 text-black flex items-center justify-center mb-2 shadow-lg shadow-amber-500/25 glow-gold animate-float">
              <Sparkles className="w-7 h-7 fill-current animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase">CineSwipe+ Unlocked!</h2>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mt-1">
              Thank you for supporting CineSwipe! Your lifetime premium upgrade is active. Return to the lobby to start unlimited parties!
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-coral-500 hover:scale-105 active:scale-95 text-white font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-lg shadow-violet-600/20 cursor-pointer glow-violet"
            >
              Start Popcorn Party
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Visual Intro Column */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-amber-400 font-black text-[10px] tracking-wider uppercase animate-pulse-glow">
                <Sparkles className="w-3.5 h-3.5 fill-amber-500" /> Premium Member Unlock
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] Outfit text-white">
                Red Carpet discovery with{' '}
                <span className="bg-gradient-to-r from-violet-400 via-coral-400 to-amber-300 bg-clip-text text-transparent font-black">CineSwipe+</span>
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                One simple payment. No recurring monthly subscriptions. Enjoy our ultimate features forever for less than a single cinema ticket!
              </p>

              {/* Feature checklist */}
              <div className="space-y-4 pt-2">
                {features.map((f, idx) => (
                  <div key={idx} className="flex gap-4 p-3 rounded-2xl bg-white/5 dark:bg-navy-950/40 border border-white/5 hover:border-white/10 transition-all duration-300">
                    <div className="p-2.5 rounded-xl bg-white/5 dark:bg-navy-950 border border-white/5 shrink-0 flex items-center justify-center">
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
            </div>

            {/* Price Medal Card Column */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-gradient-to-b from-navy-900/90 to-navy-950/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col relative">
                {/* Visual strip highlight */}
                <div className="h-2 w-full bg-gradient-to-r from-violet-600 via-coral-500 to-amber-500" />

                <div className="p-8 flex flex-col items-center">
                  <span className="text-[10px] font-black bg-gradient-to-r from-violet-500/10 to-violet-600/10 border border-violet-500/30 text-violet-400 px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-violet-500/5 glow-violet">
                    Lifetime Premium
                  </span>
                  
                  <div className="flex items-baseline gap-1 mt-6">
                    <span className="text-5xl font-black tracking-tight text-white">
                      ₹99
                    </span>
                    <span className="text-xs font-black tracking-widest uppercase text-zinc-400">
                      / One-Time
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-1.5">
                    Equivalent to USD $2 • Pay once, use forever
                  </span>

                  {/* Payment Verification list */}
                  <div className="w-full space-y-3.5 mt-8 py-6 border-y border-white/5 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
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
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-coral-500 to-amber-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-600/20 active:scale-[0.98] disabled:opacity-50 text-white font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 mt-8 cursor-pointer glow-violet"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Unlock CineSwipe+ <ArrowRight className="w-4 h-4 stroke-[2.5]" />
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
      <footer className="py-8 text-center text-[9px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest relative z-10">
        🛡️ Secure payment powered by Razorpay. CineSwipe will never store card credentials.
      </footer>
    </div>
  );
}
v>
  );
}
