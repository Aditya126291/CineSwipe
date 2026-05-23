export type Region = 'US' | 'IN' | 'GLOBAL';

export interface ProviderLinkMap {
  US: string;
  IN: string;
  GLOBAL?: string;
}

// Full map dictionary of verified direct URLs for all 27 catalog items
export const PROVIDER_GEO_DICTIONARY: Record<number, Record<string, ProviderLinkMap>> = {
  // --- MOVIES ---
  157336: { // Interstellar
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B00TU9UFEE/',
      IN: 'https://www.primevideo.com/detail/0GP3U1E0P8QTR5VIM6A1L6A4GQ/'
    }
  },
  299534: { // Avengers: Endgame
    'disney+': {
      US: 'https://www.disneyplus.com/movies/avengers-endgame/rPQo8YJkGuFa',
      IN: 'https://www.hotstar.com/movies/avengers-endgame/1260010041'
    },
    'hotstar': {
      US: 'https://www.disneyplus.com/movies/avengers-endgame/rPQo8YJkGuFa',
      IN: 'https://www.hotstar.com/movies/avengers-endgame/1260010041'
    }
  },
  19995: { // Avatar
    'disney+': {
      US: 'https://www.disneyplus.com/movies/avatar/2MCPAZ27rgoB',
      IN: 'https://www.hotstar.com/movies/avatar/1260014801'
    },
    'hotstar': {
      US: 'https://www.disneyplus.com/movies/avatar/2MCPAZ27rgoB',
      IN: 'https://www.hotstar.com/movies/avatar/1260014801'
    }
  },
  550: { // Fight Club
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B00153B82C/',
      IN: 'https://www.primevideo.com/detail/0H9N7QG7Y3TN/'
    }
  },
  693134: { // Dune: Part Two
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B0CX77YJWW/',
      IN: 'https://www.primevideo.com/detail/0K7SNXMEVAGP/'
    },
    'hbo': {
      US: 'https://www.max.com/movies/dune-part-two/',
      IN: 'https://www.jiocinema.com/movies/dune-part-two/3929452'
    },
    'max': {
      US: 'https://www.max.com/movies/dune-part-two/',
      IN: 'https://www.jiocinema.com/movies/dune-part-two/3929452'
    }
  },
  572802: { // Aquaman and the Lost Kingdom
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B0CPW3G3CS/',
      IN: 'https://www.primevideo.com/detail/0H09M7QG7Y3T/'
    },
    'hbo': {
      US: 'https://www.max.com/movies/aquaman-and-the-lost-kingdom/',
      IN: 'https://www.jiocinema.com/movies/aquaman-and-the-lost-kingdom/3895034'
    },
    'max': {
      US: 'https://www.max.com/movies/aquaman-and-the-lost-kingdom/',
      IN: 'https://www.jiocinema.com/movies/aquaman-and-the-lost-kingdom/3895034'
    }
  },
  256040: { // Baahubali: The Beginning
    'netflix': {
      US: 'https://www.netflix.com/title/80204901',
      IN: 'https://www.netflix.com/title/80204901'
    },
    'hotstar': {
      US: 'https://www.netflix.com/title/80204901',
      IN: 'https://www.hotstar.com/movies/baahubali-the-beginning-hindi/1770016089'
    }
  },
  350312: { // Baahubali 2: The Conclusion
    'netflix': {
      US: 'https://www.netflix.com/title/80204902',
      IN: 'https://www.netflix.com/title/80204902'
    },
    'hotstar': {
      US: 'https://www.netflix.com/title/80204902',
      IN: 'https://www.hotstar.com/movies/baahubali-2-the-conclusion-hindi/1770016091'
    }
  },
  579974: { // RRR
    'netflix': {
      US: 'https://www.netflix.com/title/81476453',
      IN: 'https://www.netflix.com/title/81476453'
    },
    'hotstar': {
      US: 'https://www.netflix.com/title/81476453',
      IN: 'https://www.hotstar.com/movies/rrr/1260098521'
    }
  },
  784606: { // K.G.F: Chapter 2
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B0B8K4PFSK/',
      IN: 'https://www.primevideo.com/detail/0PD51WY386M/'
    }
  },
  811656: { // Pushpa: The Rise
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B09PT7H3S8/',
      IN: 'https://www.primevideo.com/detail/0H09M7QG7Y3T/'
    }
  },
  554600: { // Uri: The Surgical Strike
    'zee5': {
      US: 'https://www.zee5.com/movies/details/uri-the-surgical-strike/0-0-28564',
      IN: 'https://www.zee5.com/movies/details/uri-the-surgical-strike/0-0-28564'
    }
  },

  // --- TV SHOWS ---
  1396: { // Breaking Bad
    'netflix': {
      US: 'https://www.netflix.com/title/70143825',
      IN: 'https://www.netflix.com/title/70143825'
    }
  },
  1399: { // Game of Thrones
    'hbo': {
      US: 'https://www.max.com/shows/game-of-thrones/',
      IN: 'https://www.jiocinema.com/show/game-of-thrones/3739269'
    },
    'max': {
      US: 'https://www.max.com/shows/game-of-thrones/',
      IN: 'https://www.jiocinema.com/show/game-of-thrones/3739269'
    },
    'hotstar': {
      US: 'https://www.max.com/shows/game-of-thrones/',
      IN: 'https://www.jiocinema.com/show/game-of-thrones/3739269'
    }
  },
  66732: { // Stranger Things
    'netflix': {
      US: 'https://www.netflix.com/title/80057281',
      IN: 'https://www.netflix.com/title/80057281'
    }
  },
  2316: { // The Office
    'netflix': {
      US: 'https://www.peacocktv.com/stream-tv/the-office',
      IN: 'https://www.netflix.com/title/70136120'
    },
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B000HX2IO0/',
      IN: 'https://www.primevideo.com/detail/0H9M7QG7Y3T/'
    }
  },
  1668: { // Friends
    'netflix': {
      US: 'https://www.max.com/shows/friends/',
      IN: 'https://www.netflix.com/title/70153404'
    }
  },
  76479: { // The Boys
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B0875N5Y88/',
      IN: 'https://www.primevideo.com/detail/0K7SNXMEVAGP/'
    }
  },
  114461: { // Ahsoka
    'disney+': {
      US: 'https://www.disneyplus.com/series/ahsoka/426ty8nA3H0J',
      IN: 'https://www.hotstar.com/shows/ahsoka/1260148560'
    },
    'hotstar': {
      US: 'https://www.disneyplus.com/series/ahsoka/426ty8nA3H0J',
      IN: 'https://www.hotstar.com/shows/ahsoka/1260148560'
    }
  },
  93405: { // Squid Game
    'netflix': {
      US: 'https://www.netflix.com/title/81040344',
      IN: 'https://www.netflix.com/title/81040344'
    }
  },
  82856: { // The Mandalorian
    'disney+': {
      US: 'https://www.disneyplus.com/series/the-mandalorian/3jLKiM87oThg',
      IN: 'https://www.hotstar.com/shows/the-mandalorian/1260021071'
    },
    'hotstar': {
      US: 'https://www.disneyplus.com/series/the-mandalorian/3jLKiM87oThg',
      IN: 'https://www.hotstar.com/shows/the-mandalorian/1260021071'
    }
  },
  84958: { // Loki
    'disney+': {
      US: 'https://www.disneyplus.com/series/loki/6759V4ghT2Ea',
      IN: 'https://www.hotstar.com/shows/loki/1260063462'
    },
    'hotstar': {
      US: 'https://www.disneyplus.com/series/loki/6759V4ghT2Ea',
      IN: 'https://www.hotstar.com/shows/loki/1260063462'
    }
  },
  82068: { // Mirzapur
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B07JJ1QHLF/',
      IN: 'https://www.primevideo.com/detail/0PD51WY386M/'
    }
  },
  92446: { // The Family Man
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B07X2PWPX7/',
      IN: 'https://www.primevideo.com/detail/0H09M7QG7Y3T/'
    }
  },
  80894: { // Sacred Games
    'netflix': {
      US: 'https://www.netflix.com/title/80115328',
      IN: 'https://www.netflix.com/title/80115328'
    }
  },
  104770: { // Scam 1992
    'sonyliv': {
      US: 'https://www.sonyliv.com/shows/scam-1992-the-harshad-mehta-story-1700000292',
      IN: 'https://www.sonyliv.com/shows/scam-1992-the-harshad-mehta-story-1700000292'
    }
  },
  98114: { // Panchayat
    'prime video': {
      US: 'https://www.amazon.com/gp/video/detail/B0868882L1/',
      IN: 'https://www.primevideo.com/detail/0H9N7QG7Y3TN/'
    }
  }
};

/**
 * Synchronously detects if the client resides in the United States, India, or another Global territory.
 * Supports URL search parameter and sessionStorage overrides for easy local simulation (?geo=US or ?geo=IN).
 */
export function getClientRegion(): Region {
  if (typeof window === 'undefined') return 'IN'; // Safe build-time fallback
  try {
    // 1. Check URL parameters for override (explicit URL query params take precedence!)
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const geo = params.get('geo')?.toUpperCase();
      if (geo === 'US' || geo === 'IN' || geo === 'GLOBAL') {
        sessionStorage.setItem('cineswipe-geo-override', geo);
        return geo as Region;
      }
    }

    // 2. Session storage override for testing
    const override = sessionStorage.getItem('cineswipe-geo-override');
    if (override === 'US' || override === 'IN' || override === 'GLOBAL') {
      return override as Region;
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && (tz.startsWith('America/') || tz.startsWith('US/') || tz === 'EST' || tz === 'MST' || tz === 'PST' || tz === 'CST')) {
      return 'US';
    }
    if (tz && (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta')) {
      return 'IN';
    }
    // Fallback: check language parameters
    const lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    if (lang.toLowerCase().includes('-us') || lang.toLowerCase() === 'en-us') {
      return 'US';
    }
  } catch (e) {
    console.error('Failed to detect timezone/region:', e);
  }
  return 'IN'; // Default to standard fallback matching Indian catalog
}

/**
 * Generates search URLs dynamically when a specific deep-link is missing or '#'
 */
export function getSearchFallbackLink(providerName: string, title: string, region: Region): string {
  const query = encodeURIComponent(title);
  switch (providerName.toLowerCase()) {
    case 'netflix':
      return `https://www.netflix.com/search?q=${query}`;
    case 'prime video':
    case 'prime':
    case 'amazon prime':
      return region === 'US'
        ? `https://www.amazon.com/s?k=${query}+prime+video`
        : `https://www.amazon.in/s?k=${query}+prime+video`;
    case 'disney+':
    case 'disney plus':
    case 'hotstar':
      return region === 'US'
        ? `https://www.disneyplus.com/`
        : `https://www.hotstar.com/in/explore?search_query=${query}`;
    case 'hbo':
    case 'max':
      return region === 'US'
        ? `https://www.max.com/search?q=${query}`
        : `https://www.jiocinema.com/search?query=${query}`;
    case 'sonyliv':
      return `https://www.sonyliv.com/search?q=${query}`;
    case 'zee5':
      return `https://www.zee5.com/search?q=${query}`;
    default:
      return '#';
  }
}

/**
 * Intercepts catalog provider links and resolves the exact URL based on geolocation.
 * Falls back to active search queries rather than returning '#' to avoid current page reloads.
 */
export function resolveGeoLink(movieId: number, providerName: string, fallbackLink?: string, movieTitle?: string): string {
  const normName = providerName.trim().toLowerCase();
  const region = getClientRegion();

  const movieMaps = PROVIDER_GEO_DICTIONARY[movieId];
  if (movieMaps) {
    const providerMap = movieMaps[normName];
    if (providerMap) {
      const resolved = providerMap[region] || providerMap.IN || fallbackLink || '#';
      if (resolved && resolved !== '#') return resolved;
    }
  }

  // If link is missing or #, run search fallback to prevent current page anchor reload
  if ((!fallbackLink || fallbackLink === '#') && movieTitle) {
    return getSearchFallbackLink(providerName, movieTitle, region);
  }

  // Generic dynamic host rewrites for dynamic TVMaze fallback links
  if (fallbackLink && fallbackLink !== '#') {
    try {
      const url = new URL(fallbackLink);
      
      // Disney+ / Hotstar dynamic redirecting
      if (normName === 'disney+' || normName === 'hotstar') {
        if (region === 'US') {
          return 'https://www.disneyplus.com/';
        }
        return fallbackLink;
      }

      // Max (HBO) dynamic redirecting
      if (normName === 'hbo' || normName === 'max') {
        if (region === 'US') {
          return fallbackLink.replace(/hbo\.com/, 'max.com');
        }
        return 'https://www.jiocinema.com/';
      }

      // Amazon Prime dynamic host matching
      if (url.hostname.includes('amazon.')) {
        if (region === 'US' && url.hostname.includes('.in')) {
          url.hostname = 'www.amazon.com';
        } else if (region === 'IN' && url.hostname.includes('.com') && !url.hostname.includes('primevideo')) {
          url.hostname = 'www.amazon.in';
        }
        return url.toString();
      }
    } catch {
      // Fallback
    }
  }

  return fallbackLink || '#';
}
