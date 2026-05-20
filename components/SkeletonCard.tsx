'use client';

export default function SkeletonCard() {
  return (
    <div className="w-full max-w-sm aspect-[2/3] md:max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-navy-900/80 shadow-2xl overflow-hidden flex flex-col relative">
      {/* Header Poster Shimmer */}
      <div className="w-full flex-1 bg-zinc-200 dark:bg-zinc-800/80 relative overflow-hidden">
        <div className="absolute inset-0 skeleton" />
      </div>
      
      {/* Footer Info Shimmer */}
      <div className="p-6 flex flex-col gap-3.5 bg-white dark:bg-navy-950">
        <div className="flex justify-between items-center gap-4">
          <div className="h-6 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 skeleton" />
          </div>
          <div className="h-6 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 skeleton" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 skeleton" />
          </div>
          <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 skeleton" />
          </div>
        </div>
        
        <div className="space-y-2 mt-1">
          <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 skeleton" />
          </div>
          <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
