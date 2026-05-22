'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Undo, Heart, Sparkles, Lock, ArrowRight } from 'lucide-react';
import type { ContentItem } from '@/lib/types/content';

interface SwipeHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  liked: ContentItem[];
  disliked: ContentItem[];
  superLiked: ContentItem[];
  undo: () => void;
  isPremium: boolean;
  onUpgradePrompt: () => void;
}

export default function SwipeHistory({
  isOpen,
  onClose,
  liked,
  disliked,
  superLiked,
  undo,
  isPremium,
  onUpgradePrompt,
}: SwipeHistoryProps) {
  const [activeTab, setActiveTab] = useState<'liked' | 'disliked'>('liked');

  const activeList = activeTab === 'liked' ? [...superLiked, ...liked] : disliked;
  const freeTierLimit = 10;
  
  // Calculate if we need paywall masking
  const totalCount = activeList.length;
  const displayList = isPremium ? activeList : activeList.slice(0, freeTierLimit);
  const hiddenCount = totalCount - displayList.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sliding drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-80 max-w-full bg-gradient-to-b from-navy-900/95 to-navy-950/98 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col h-full shadow-2xl relative overflow-hidden select-none"
          >
            {/* Decorative background glows */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-coral-500/10 blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between relative z-10">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-2">
                🍿 Cine History Log
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Quick Actions */}
            {activeList.length > 0 && (
              <div className="px-4 py-3 bg-gradient-to-r from-violet-600/10 to-coral-500/10 border-b border-white/5 flex justify-between items-center relative z-10">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                  Accidental Swipe?
                </span>
                <button
                  onClick={undo}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-violet-400 hover:text-violet-300 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <Undo className="w-3.5 h-3.5 stroke-[2.5]" /> Undo Last
                </button>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/5 text-[10px] font-black uppercase tracking-widest relative z-10 bg-black/10">
              <button
                onClick={() => setActiveTab('liked')}
                className={`flex-1 py-3.5 text-center border-b-2 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'liked'
                    ? 'border-violet-500 text-violet-400 bg-white/5'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current text-coral-500" /> Matches ({liked.length + superLiked.length})
              </button>
              <button
                onClick={() => setActiveTab('disliked')}
                className={`flex-1 py-3.5 text-center border-b-2 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'disliked'
                    ? 'border-coral-500 text-coral-400 bg-white/5'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <X className="w-3.5 h-3.5 text-zinc-400" /> Dislikes ({disliked.length})
              </button>
            </div>

            {/* History grid container */}
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar relative z-10">
              {totalCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 gap-2.5">
                  <Heart className="w-8 h-8 opacity-25" />
                  <span className="text-[10px] font-black uppercase tracking-widest">History is empty</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {displayList.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="group aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 bg-white/5 transition-all duration-300 relative shadow-md shadow-black/30"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.posterUrl || '/poster-placeholder.svg'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/poster-placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent p-2.5 text-white flex flex-col justify-end">
                        <span className="text-[10px] font-black truncate">{item.title}</span>
                        <span className="text-[8px] text-zinc-400 mt-0.5">{item.releaseYear}</span>
                      </div>
                    </div>
                  ))}

                  {/* Locked paywall items overlay */}
                  {!isPremium && hiddenCount > 0 && (
                    <div
                      onClick={onUpgradePrompt}
                      className="col-span-2 mt-2 p-5 rounded-2xl border border-dashed border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-amber-600/10 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/15 active:scale-98 transition-all duration-300"
                    >
                      <Lock className="w-6 h-6 text-amber-500 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-amber-500 flex items-center gap-1 justify-center uppercase tracking-wide">
                          +{hiddenCount} Swipes Masked <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5">
                          Upgrade CineSwipe+ to reveal your complete historical swiped logs.
                        </span>
                      </div>
                      <span className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 glow-gold shadow-md shadow-amber-500/25">
                        Upgrade CineSwipe+ <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

