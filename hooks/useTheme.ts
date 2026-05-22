'use client';

import { useEffect, useState } from 'react';
import { safeStorage } from '@/lib/storage';

export type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = safeStorage.getItem('cineswipe-theme') as Theme | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    // Toggle class immediately to prevent transition flash
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    
    // Defer state update to avoid synchronous cascading renders warning
    const timer = setTimeout(() => {
      setTheme(initialTheme);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    safeStorage.setItem('cineswipe-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return { theme, toggleTheme };
}
