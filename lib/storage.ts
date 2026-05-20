// A safe wrapper around localStorage that gracefully falls back if localStorage is disabled,
// unavailable, or throws errors (e.g. in Safari Private Browsing or restricted WebViews).

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`localStorage.getItem failed for key "${key}", using memory fallback:`, e);
      return memoryStore[key] || null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`localStorage.setItem failed for key "${key}", using memory fallback:`, e);
      memoryStore[key] = value;
    }
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`localStorage.removeItem failed for key "${key}", using memory fallback:`, e);
      delete memoryStore[key];
    }
  }
};
