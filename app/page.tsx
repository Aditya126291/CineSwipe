'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Play, Sparkles, Users, User, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [multiplayerOpen, setMultiplayerOpen] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Generate 6-char alphanumeric room code
  const handleCreateRoom = () => {
    setLoading(true);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    router.push(`/room/${code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || roomCode.trim().length !== 6) return;
    router.push(`/room/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-navy-950 text-zinc-900 dark:text-white flex flex-col justify-between select-none relative overflow-hidden">
      
      {/* Background Decorative Film strip */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full bg-coral-500/10 blur-[80px] pointer-events-none" />

      {/* Header bar */}
      <header className="w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-coral-500 text-white font-extrabold flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Film className="w-5 h-5 animate-float" />
          </div>
          <span className="text-lg font-black tracking-tighter">
            CINE<span className="gradient-text font-black">SWIPE</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main CTA Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full z-10 gap-10">
        
        {/* Title Hero */}
        <div className="flex flex-col items-center text-center gap-2.5 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
            Surf Movies <span className="gradient-text font-black">Solo</span> Or With{' '}
            <span className="gradient-text font-black">Friends</span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mt-1">
            Discover films and web series together. Swipe right to like, flip to watch trailers, and instantly match when everyone agrees!
          </p>
        </div>

        {/* CTA Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
          
          {/* Card 1: Solo Surf Mode */}
          <Link
            href="/swipe"
            className="group p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900/80 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[180px] text-left"
          >
            <div className="flex justify-between items-start">
              <div className="p-3.5 rounded-2xl bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform duration-300">
                <User className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-violet-500 group-hover:translate-x-1.5 transition-all" />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white">Solo Surf Deck</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 leading-normal">
                Browse popular releases, watch trailers, filter by genres, and bookmark personal favorites.
              </p>
            </div>
          </Link>

          {/* Card 2: Multiplayer Cooperative Party Mode */}
          <button
            onClick={() => setMultiplayerOpen(!multiplayerOpen)}
            className="group p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900/80 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[180px] text-left"
          >
            <div className="flex justify-between items-start w-full">
              <div className="p-3.5 rounded-2xl bg-coral-500/10 text-coral-500 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-coral-500 group-hover:translate-x-1.5 transition-all" />
            </div>
            <div className="mt-4 w-full">
              <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white">Popcorn Swipe Party</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 leading-normal">
                Cooperate with roommates, partners, or friends. Synced in real-time, matching what everyone likes!
              </p>
            </div>
          </button>
        </div>

        {/* Inline Join Room code container */}
        <AnimatePresence>
          {multiplayerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-navy-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Create Party column */}
                <div className="flex flex-col gap-3 md:border-r border-zinc-200 dark:border-zinc-800 md:pr-6 text-left">
                  <h4 className="text-sm font-extrabold">Host Popcorn Room</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Generate a unique 6-character room access code and invite friends.
                  </p>
                  <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-coral-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Host Room Party <Sparkles className="w-3.5 h-3.5 fill-white" />
                      </>
                    )}
                  </button>
                </div>

                {/* Join Party column */}
                <form onSubmit={handleJoinRoom} className="flex flex-col gap-3 text-left">
                  <h4 className="text-sm font-extrabold">Join Existing Room</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Enter the access code shared by your popcorn host.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="E.g. MZ94X7"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.substring(0, 6))}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-navy-950 font-black text-sm uppercase tracking-widest text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      disabled={roomCode.trim().length !== 6}
                      className="px-5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black font-extrabold text-xs tracking-wider uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 shrink-0"
                    >
                      Join
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CineSwipe+ premium pricing showcase CTA pill */}
        <Link
          href="/upgrade"
          className="px-4 py-2 rounded-full border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 hover:scale-105 active:scale-95 text-xs text-amber-500 font-extrabold tracking-wide uppercase transition-all flex items-center gap-1.5 animate-pulse-glow"
        >
          <Sparkles className="w-4 h-4 fill-amber-500" /> Go CineSwipe+ Premium Lifetime Unlock
        </Link>
      </main>

      {/* Footer bar containing SEO and trust assurances */}
      <footer className="py-8 border-t border-zinc-200/50 dark:border-zinc-800/20 text-center flex flex-col gap-2 items-center z-10">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
          © {new Date().getFullYear()} CineSwipe App. Made for Popcorn Lovers.
        </span>
        <div className="flex items-center gap-4 text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SSL SECURE BY RAZORPAY
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> POWERED BY TMDB
          </span>
        </div>
      </footer>
    </div>
  );
}
