'use client';
import { useState } from 'react';
import { resolveGeoLink, getClientRegion } from '@/lib/catalog/providers-geo';

interface Provider {
  name: string;
  logoUrl?: string;
  link?: string;
}

interface ProviderIconsProps {
  providers?: Provider[];
  movieId?: number;
  movieTitle?: string;
}

export default function ProviderIcons({ providers, movieId, movieTitle }: ProviderIconsProps) {
  const region = getClientRegion();
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  // Dynamic regional provider adjustment at runtime
  const activeProviders = (providers && providers.length > 0 ? providers : [
    { name: 'Netflix' },
    { name: 'Prime Video' },
    { name: 'Disney+' }
  ]).map((p) => {
    const nameLower = p.name.toLowerCase();

    // 1. Outside India (e.g. US), swap any Hotstar to Disney+
    if (region === 'US' && (nameLower === 'hotstar' || nameLower === 'disney+ hotstar')) {
      return {
        ...p,
        name: 'Disney+',
        logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-disney.svg'
      };
    }

    // 2. In India, group Disney+ and Hotstar under the unified brand
    if (region === 'IN' && nameLower === 'disney+') {
      return {
        ...p,
        name: 'Disney+ Hotstar',
        logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hotstar.svg'
      };
    }

    // 3. Outside India, show premium Max instead of stale HBO
    if (region === 'US' && (nameLower === 'hbo' || nameLower === 'max')) {
      return {
        ...p,
        name: 'Max',
        logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hbo.svg'
      };
    }

    // 4. In India, route HBO to JioCinema since it hosts Max content
    if (region === 'IN' && (nameLower === 'hbo' || nameLower === 'max')) {
      return {
        ...p,
        name: 'JioCinema',
        logoUrl: 'https://cymawrixliqpnsrkyfvb.supabase.co/storage/v1/object/public/posters/provider-hbo.svg' // Fallback to HBO themed badge
      };
    }

    return p;
  });

  // Premium hand-styled vector SVG icons or HTML layouts
  const getProviderLogo = (name: string, logoUrl?: string) => {
    const normName = name.toLowerCase();

    // If the database has a valid public logoUrl (hosted on Supabase or TMDB), render it directly!
    // BUT only if it hasn't failed to load in this session!
    if (logoUrl && logoUrl.startsWith('http') && !failedLogos[normName]) {
      return (
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-md hover:border-zinc-700 transition-colors duration-200">
          <img 
            src={logoUrl} 
            alt={name} 
            className="w-7 h-7 object-contain rounded-md" 
            onError={() => {
              setFailedLogos(prev => ({ ...prev, [normName]: true }));
            }}
          />
        </div>
      );
    }

    // High fidelity fallback badges
    switch (normName) {
      case 'netflix':
        return (
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-zinc-800 shadow-md hover:border-zinc-700 transition-colors duration-200" title="Netflix">
            <span className="text-red-600 font-extrabold text-sm tracking-tighter">N</span>
          </div>
        );
      case 'prime video':
      case 'prime':
      case 'amazon prime':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#1a2430] flex items-center justify-center border border-[#1f3044] shadow-md hover:border-sky-500/30 transition-colors duration-200" title="Amazon Prime Video">
            <span className="text-sky-400 font-extrabold text-[10px] tracking-tight">prime</span>
          </div>
        );
      case 'disney+':
      case 'disney plus':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#020d2d] to-[#0a1848] flex items-center justify-center border border-[#0f2461] shadow-md hover:border-teal-400/30 transition-colors duration-200" title="Disney+">
            <span className="text-teal-400 font-bold text-xs tracking-tighter">+</span>
          </div>
        );
      case 'hotstar':
      case 'disney+ hotstar':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#051126] to-[#122b59] flex items-center justify-center border border-[#183975] shadow-md hover:border-amber-400/30 transition-colors duration-200" title="Disney+ Hotstar">
            <span className="text-amber-400 font-black text-[9px] tracking-tighter uppercase">star</span>
          </div>
        );
      case 'max':
      case 'hbo':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-900 flex items-center justify-center border border-indigo-500/40 shadow-md hover:border-blue-400/50 transition-colors duration-200" title="Max">
            <span className="text-white font-black text-[9px] tracking-tight">MAX</span>
          </div>
        );
      case 'jiocinema':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-950 to-pink-900 flex items-center justify-center border border-pink-700/30 shadow-md hover:border-pink-500/50 transition-colors duration-200" title="JioCinema">
            <span className="text-pink-400 font-black text-[9px] tracking-tighter uppercase">Jio</span>
          </div>
        );
      case 'sonyliv':
        return (
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-md hover:border-amber-500/30 transition-colors duration-200" title="SonyLIV">
            <span className="text-amber-500 font-black text-[8px] tracking-tighter uppercase">LIV</span>
          </div>
        );
      case 'zee5':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-950 to-zinc-950 flex items-center justify-center border border-purple-800/40 shadow-md hover:border-purple-500/40 transition-colors duration-200" title="ZEE5">
            <span className="text-purple-400 font-black text-[9px] tracking-tight uppercase">ZEE5</span>
          </div>
        );
      case 'tvmaze':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center border border-emerald-500/30 shadow-md hover:border-emerald-400/50 transition-colors duration-200" title="TVMaze">
            <span className="text-emerald-400 font-black text-[9px] tracking-tight uppercase">maze</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 hover:border-zinc-500 transition-colors duration-200" title={name}>
            <span className="text-zinc-400 font-bold text-[9px] truncate px-0.5">{name.substring(0, 3).toUpperCase()}</span>
          </div>
        );
    }
  };

  const getAffiliateLink = (name: string, originalLink?: string) => {
    if (!originalLink || originalLink === '#') return '#';
    try {
      const url = new URL(originalLink);
      
      // Amazon Prime Video Associate Tag injection
      if (url.hostname.includes('amazon.')) {
        const affiliateTag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'cineswipe-21';
        url.searchParams.set('tag', affiliateTag);
        return url.toString();
      }
      
      // Apple TV Campaign / Affiliate Token injection
      if (url.hostname.includes('apple.com')) {
        const affiliateId = process.env.NEXT_PUBLIC_APPLE_AFFILIATE_ID || '1011l35Fp';
        url.searchParams.set('at', affiliateId);
        url.searchParams.set('ct', 'cineswipe');
        return url.toString();
      }
      
      return originalLink;
    } catch {
      return originalLink;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-zinc-400">Available to Stream:</span>
      <div className="flex items-center gap-2">
        {activeProviders.map((p, idx) => {
          const finalLink = resolveGeoLink(movieId || 0, p.name, p.link, movieTitle);
          const affLink = getAffiliateLink(p.name, finalLink);
          return (
            <a
              key={idx}
              href={affLink}
              target={affLink && affLink !== '#' ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {getProviderLogo(p.name, p.logoUrl)}
            </a>
          );
        })}
      </div>
    </div>
  );
}
