'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Sparkles, Users, User, ArrowRight, ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { hasSupabase, supabase } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const [multiplayerOpen, setMultiplayerOpen] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string>('');

  // Generate 6-char alphanumeric room code
  const handleCreateRoom = () => {
    setLoading(true);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    router.push(`/room/${code}?host=true`);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    if (!roomCode.trim() || roomCode.trim().length !== 6) return;

    const normalizedCode = roomCode.trim().toUpperCase();
    setLoading(true);
    try {
      if (hasSupabase() && supabase) {
        const { data, error } = await supabase
          .from('rooms')
          .select('code')
          .eq('code', normalizedCode)
          .eq('status', 'active')
          .maybeSingle();

        if (error || !data) {
          setJoinError('This room does not exist yet. Please ask the host for the correct code!');
          return;
        }
      } else {
        const res = await fetch(`/api/rooms?code=${normalizedCode}`);
        if (!res.ok) {
          const data = await res.json();
          setJoinError(data.error || 'Room not found');
          return;
        }
      }
      router.push(`/room/${normalizedCode}`);
    } catch {
      setJoinError('Failed to verify room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-navy-950 text-zinc-900 dark:text-white flex flex-col justify-between select-none relative overflow-hidden transition-colors duration-500">
      
      {/* Background Decorative Glow Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-coral-500/10 dark:bg-coral-500/15 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/5 dark:bg-amber-500/8 blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <header className="w-full max-w-4xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5 group">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-coral-500 text-white font-extrabold flex items-center justify-center shadow-lg shadow-violet-500/30 hover:rotate-6 transition-transform duration-300">
            <Film className="w-5 h-5 animate-float" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">
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
        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mt-4 md:mt-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">
            Surf Movies <span className="gradient-text font-black">Solo</span> <br /> Or With{' '}
            <span className="gradient-text font-black">Friends</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mt-2 font-medium">
            Discover films and web series together. Swipe right to like, flip to watch trailers, and instantly match when everyone agrees!
          </p>
        </div>

        {/* CTA Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
          
          {/* Card 1: Solo Surf Mode */}
          <Link
            href="/swipe"
            className="group p-8 rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-navy-900/60 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-violet-500/5 hover:border-violet-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex flex-col justify-between min-h-[220px] text-left relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-violet-500/0 group-hover:from-violet-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
            <div className="flex justify-between items-start z-10">
              <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-500 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 shadow-md">
                <User className="w-6 h-6" />
              </div>
              <div className="p-2 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-400 group-hover:text-violet-500 group-hover:bg-violet-500/10 group-hover:translate-x-1.5 transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-6 z-10">
              <h3 className="text-xl font-black text-zinc-950 dark:text-white">Solo Surf Deck</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed font-medium">
                Browse popular releases, watch trailers, filter by genres, and bookmark personal favorites.
              </p>
            </div>
          </Link>

          {/* Card 2: Multiplayer Cooperative Party Mode */}
          <button
            onClick={() => setMultiplayerOpen(!multiplayerOpen)}
            className="group p-8 rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-navy-900/60 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-coral-500/5 hover:border-coral-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex flex-col justify-between min-h-[220px] text-left relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-coral-500/0 via-transparent to-coral-500/0 group-hover:from-coral-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
            <div className="flex justify-between items-start w-full z-10">
              <div className="p-4 rounded-2xl bg-coral-500/10 text-coral-500 group-hover:scale-110 group-hover:bg-coral-500 group-hover:text-white transition-all duration-300 shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <div className="p-2 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-400 group-hover:text-coral-500 group-hover:bg-coral-500/10 group-hover:translate-x-1.5 transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-6 w-full z-10">
              <h3 className="text-xl font-black text-zinc-950 dark:text-white">Popcorn Swipe Party</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed font-medium">
                Cooperate with roommates, partners, or friends. Synced in real-time, matching what everyone likes!
              </p>
            </div>
          </button>
        </div>

        {/* Inline Join Room code container */}
        <AnimatePresence>
          {multiplayerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 22, stiffness: 180 }}
              className="w-full max-w-2xl bg-white dark:bg-navy-900/90 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden glass-cinema relative"
            >
              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Create Party column */}
                <div className="flex flex-col justify-between gap-4 md:border-r border-zinc-200 dark:border-white/10 md:pr-8 text-left">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" /> Host Popcorn Room
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      Generate a unique 6-character room access code and invite friends.
                    </p>
                  </div>
                  <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-coral-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer"
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
                <form onSubmit={handleJoinRoom} className="flex flex-col justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">Join Existing Room</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      Enter the access code shared by your popcorn host.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="E.g. MZ94X7"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.substring(0, 6))}
                        className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-navy-950 font-black text-sm uppercase tracking-widest text-zinc-950 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-center"
                      />
                      <button
                        type="submit"
                        disabled={roomCode.trim().length !== 6 || loading}
                        className="px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-extrabold text-xs tracking-wider uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 shrink-0 flex items-center justify-center min-w-[80px] cursor-pointer"
                      >
                        {loading ? <span className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" /> : 'Join'}
                      </button>
                    </div>
                    {joinError && <span className="text-xs text-rose-500 font-bold mt-1 block">{joinError}</span>}
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CineSwipe+ premium pricing showcase CTA pill */}
        <Link
          href="/upgrade"
          className="px-5 py-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 hover:scale-[1.03] active:scale-95 text-xs text-amber-500 font-black tracking-wide uppercase transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 animate-pulse-glow"
        >
          <Sparkles className="w-4 h-4 fill-amber-500" /> Go CineSwipe+ Premium Lifetime Unlock
        </Link>
      </main>

      {/* Footer bar containing SEO and trust assurances */}
      <footer className="py-8 border-t border-zinc-200/50 dark:border-white/5 text-center flex flex-col gap-2.5 items-center z-10 font-sans">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          © {new Date().getFullYear()} CineSwipe App. Made for Popcorn Lovers.
        </span>
        <div className="flex items-center gap-4 text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> 256-BIT SSL SECURE
          </span>
        </div>
        <p className="max-w-md px-6 mt-1 text-[9px] text-zinc-400/60 dark:text-zinc-500/50 leading-normal text-center font-medium">
          Some movie catalog metadata historically compiled from TMDB. Images are self-hosted or sourced via public-domain archives. CineSwipe operates zero active connections to external TMDB APIs.
        </p>
      </footer>
    </div>
  );
}
