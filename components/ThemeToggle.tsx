'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      id="theme-toggle-btn"
      className="p-2.5 rounded-full glass border hover:bg-white/10 dark:hover:bg-black/20 text-violet-500 dark:text-violet-400 transition-all duration-300"
      aria-label="Toggle visual theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5 animate-spin-slow" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
