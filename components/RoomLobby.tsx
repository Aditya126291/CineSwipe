'use client';

import { useState } from 'react';
import { Users, Copy, Check, Sparkles, Shield, Play } from 'lucide-react';
import type { Room, RoomMember } from '@/lib/supabase/types';
import PremiumBadge from './PremiumBadge';

interface RoomLobbyProps {
  room: Room;
  members: RoomMember[];
  userId: string;
  isHost: boolean;
  onStart: () => void;
  isPremium: boolean;
  onUpgradePrompt: () => void;
}

export default function RoomLobby({
  room,
  members,
  userId,
  isHost,
  onStart,
  isPremium,
  onUpgradePrompt,
}: RoomLobbyProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxMembersLimit = room.max_members || 3;

  return (
    <div className="w-full max-w-md p-7 md:p-8 rounded-[32px] border border-white/10 bg-gradient-to-b from-navy-900/90 to-navy-950/95 backdrop-blur-2xl shadow-2xl flex flex-col gap-6 select-none animate-scale-in relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-coral-500/10 blur-[80px] pointer-events-none" />

      {/* Header Room Info */}
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-600 to-coral-500 text-white mb-3 shadow-lg shadow-violet-500/20 glow-violet animate-float">
          <Users className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Red Carpet Lobby</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[280px]">
          Share the invite code below to coordinate your swipe selections together.
        </p>
      </div>

      {/* Copy Room Code Voucher Ticket */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 dark:bg-navy-950/60 border border-white/5 relative z-10 shadow-inner">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider">Party Ticket Code</span>
          <span className="text-2xl font-black tracking-widest text-zinc-950 dark:text-white mt-0.5">
            {room.code}
          </span>
        </div>
        <button
          onClick={copyRoomCode}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-coral-500 hover:scale-105 active:scale-95 text-white font-black text-[10px] tracking-wider uppercase transition-all duration-300 shadow-md shadow-violet-500/20 shrink-0 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy Code
            </>
          )}
        </button>
      </div>

      {/* Lobby Members List */}
      <div className="space-y-3.5 relative z-10">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            👥 Guest List ({members.length} / {maxMembersLimit})
          </span>
          {!isPremium && (
            <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider flex items-center gap-1">
              Free Limit: 3 Max
            </span>
          )}
        </div>

        <div className="space-y-2.5 max-h-48 overflow-y-auto hide-scrollbar">
          {members.map((m) => {
            const isMe = m.user_id === userId;
            const initials = m.username ? m.username.substring(0, 2).toUpperCase() : '??';

            return (
              <div
                key={m.user_id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 dark:bg-navy-950/40 border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  {/* Dynamic Glowing ring avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 border border-white/10 ring-2"
                    style={{ 
                      backgroundColor: m.avatar_color || '#7c3aed',
                      borderColor: m.avatar_color || '#7c3aed',
                      boxShadow: `0 0 12px ${(m.avatar_color || '#7c3aed')}40`
                    }}
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-zinc-900 dark:text-white truncate max-w-44">
                      {m.username} {isMe && <span className="text-[10px] text-zinc-500 font-medium">(You)</span>}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                      {room.created_by === m.user_id ? '👑 Room Owner' : '🍿 Party Guest'}
                    </span>
                  </div>
                </div>

                {m.is_premium && <PremiumBadge />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Free Limit Nudge */}
      {!isPremium && members.length >= 3 && (
        <div
          onClick={onUpgradePrompt}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-600/10 border border-amber-500/30 flex items-center gap-3.5 text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/20 cursor-pointer active:scale-98 transition-all duration-300 relative z-10"
        >
          <Shield className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black tracking-wider flex items-center gap-1 uppercase">
              Expand Room Limit <Sparkles className="w-3 h-3 fill-amber-400" />
            </span>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5">
              Upgrade any guest to CineSwipe+ to accommodate up to 10 friends.
            </span>
          </div>
        </div>
      )}

      {/* Start Session CTA */}
      <div className="mt-2 space-y-2 relative z-10">
        {isHost ? (
          <button
            onClick={onStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-coral-500 to-amber-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-600/20 active:scale-[0.98] text-white font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 cursor-pointer glow-violet"
          >
            <Play className="w-4 h-4 fill-white text-white" /> Start Swiping Session
          </button>
        ) : (
          <div className="w-full py-4 text-center border border-white/5 rounded-2xl bg-black/20 dark:bg-navy-950/60 text-[10px] text-zinc-500 dark:text-zinc-400 font-black tracking-widest uppercase flex items-center justify-center gap-2.5">
            <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Waiting for Lobby Owner to launch...
          </div>
        )}
      </div>
    </div>
  );
}

