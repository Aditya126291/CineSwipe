'use client';

interface Provider {
  name: string;
  logoUrl?: string;
  link?: string;
}

interface ProviderIconsProps {
  providers?: Provider[];
}

export default function ProviderIcons({ providers }: ProviderIconsProps) {
  // Built-in regional providers with premium SVG icons as fallbacks!
  const getProviderLogo = (name: string) => {
    switch (name.toLowerCase()) {
      case 'netflix':
        return (
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-zinc-800" title="Netflix">
            <span className="text-red-600 font-extrabold text-sm tracking-tighter">N</span>
          </div>
        );
      case 'prime video':
      case 'prime':
      case 'amazon prime':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#1a2430] flex items-center justify-center border border-zinc-800" title="Amazon Prime">
            <span className="text-sky-400 font-extrabold text-[10px] tracking-tight">prime</span>
          </div>
        );
      case 'disney+':
      case 'disney plus':
      case 'hotstar':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#030b24] flex items-center justify-center border border-zinc-800" title="Disney+">
            <span className="text-teal-400 font-bold text-xs">+</span>
          </div>
        );
      case 'apple tv+':
      case 'apple tv':
        return (
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-zinc-800" title="Apple TV+">
            <span className="text-white font-extrabold text-[9px] tracking-tighter">tv+</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700" title={name}>
            <span className="text-zinc-400 font-bold text-[9px] truncate px-0.5">{name.substring(0, 3).toUpperCase()}</span>
          </div>
        );
    }
  };

  const activeProviders = providers && providers.length > 0 ? providers : [
    { name: 'Netflix' },
    { name: 'Prime Video' },
    { name: 'Disney+' }
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-zinc-400">Available to Stream:</span>
      <div className="flex items-center gap-2">
        {activeProviders.map((p, idx) => (
          <a
            key={idx}
            href={p.link || '#'}
            target={p.link ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="hover:scale-110 active:scale-95 transition-all duration-200"
          >
            {getProviderLogo(p.name)}
          </a>
        ))}
      </div>
    </div>
  );
}
