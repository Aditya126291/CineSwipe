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
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Sliding drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 max-w-full bg-white dark:bg-navy-950 border-l border-zinc-200 dark:border-zinc-800 z-50 flex flex-col h-full shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                🎬 Your Surf Log
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            {activeList.length > 0 && (
              <div className="px-4 py-2 bg-violet-500/5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 font-semibold">
                  Accidental swipe?
                </span>
                <button
                  onClick={undo}
                  className="flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-500 active:scale-95 transition-all"
                >
                  <Undo className="w-3.5 h-3.5" /> Undo Last
                </button>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setActiveTab('liked')}
                className={`flex-1 py-3 font-extrabold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'liked'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Heart className="w-4 h-4 fill-current text-rose-500" /> Liked ({liked.length + superLiked.length})
              </button>
              <button
                onClick={() => setActiveTab('disliked')}
                className={`flex-1 py-3 font-extrabold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'disliked'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <X className="w-4 h-4 text-zinc-400" /> Disliked ({disliked.length})
              </button>
            </div>

            {/* History grid container */}
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
              {totalCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 gap-2">
                  <Heart className="w-8 h-8 opacity-35" />
                  <span className="text-xs font-bold">Log is empty. Start swiping!</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {displayList.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="group aspect-[2/3] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 relative"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.posterUrl || '/poster-placeholder.svg'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/poster-placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 text-white flex flex-col justify-end">
                        <span className="text-[10px] font-extrabold truncate">{item.title}</span>
                        <span className="text-[8px] text-zinc-300">{item.releaseYear}</span>
                      </div>
                    </div>
                  ))}

                  {/* Locked paywall items overlay */}
                  {!isPremium && hiddenCount > 0 && (
                    <div
                      onClick={onUpgradePrompt}
                      className="col-span-2 mt-2 p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-amber-500/10 active:scale-98 transition-all duration-300"
                    >
                      <Lock className="w-6 h-6 text-amber-500" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1 justify-center">
                          +{hiddenCount} Swipes Masked <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          Upgrade to premium to see full swiped logs
                        </span>
                      </div>
                      <span className="mt-1.5 px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                        Go CineSwipe+ <ArrowRight className="w-3 h-3" />
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
