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

  const maxMembersLimit = room.max_members || (isPremium ? 10 : 3);
  const isFull = members.length >= maxMembersLimit;

  return (
    <div className="w-full max-w-md p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900 shadow-2xl flex flex-col gap-6 select-none animate-scale-in">
      {/* Header Room Info */}
      <div className="flex flex-col items-center text-center">
        <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500 mb-3 animate-float">
          <Users className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-zinc-950 dark:text-white">Multiplayer Party Lobby</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Share the code below with your popcorn partner to swipe together.
        </p>
      </div>

      {/* Copy Room Code Pill */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-navy-950 border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Party Access Code</span>
          <span className="text-2xl font-black tracking-widest text-zinc-950 dark:text-white">
            {room.code}
          </span>
        </div>
        <button
          onClick={copyRoomCode}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Code
            </>
          )}
        </button>
      </div>

      {/* Lobby Members grid list */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            👥 Members Ready ({members.length} / {maxMembersLimit})
          </span>
          {!isPremium && (
            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
              Free Limit: 3 Max
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
          {members.map((m) => {
            const isMe = m.user_id === userId;
            const initials = m.username ? m.username.substring(0, 2).toUpperCase() : '??';

            return (
              <div
                key={m.user_id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-navy-950/50 border border-zinc-150 dark:border-zinc-800/40"
              >
                <div className="flex items-center gap-2.5">
                  {/* Dynamic Color Ring avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 border border-white/20"
                    style={{ backgroundColor: m.avatar_color || '#7c3aed' }}
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-40">
                      {m.username} {isMe && <span className="text-[10px] text-zinc-400 font-medium">(You)</span>}
                    </span>
                    <span className="text-[9px] text-zinc-500">
                      {room.created_by === m.user_id ? 'Party Host' : 'Guest'}
                    </span>
                  </div>
                </div>

                {m.is_premium && <PremiumBadge />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Free limit nudge trigger */}
      {!isPremium && members.length >= 3 && (
        <div
          onClick={onUpgradePrompt}
          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3 text-amber-400 hover:bg-amber-500/15 cursor-pointer active:scale-98 transition-all"
        >
          <Shield className="w-5 h-5 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold flex items-center gap-1 uppercase">
              Expand Room Limit <Sparkles className="w-3 h-3 fill-amber-400" />
            </span>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-tight">
              Upgrade any 1 member to CineSwipe+ to host up to 10 friends.
            </span>
          </div>
        </div>
      )}

      {/* Start Session Call to action button */}
      <div className="mt-2 space-y-2">
        {isHost ? (
          <button
            onClick={onStart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-coral-500 hover:scale-[1.02] active:scale-[0.98] text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" /> Start Swiping Session
          </button>
        ) : (
          <div className="w-full py-3 text-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-navy-950/80 text-xs text-zinc-500 dark:text-zinc-400 font-bold flex items-center justify-center gap-2">
            <span className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Waiting for Host to start party...
          </div>
        )}
      </div>
    </div>
  );
}
