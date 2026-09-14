import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../services/theme';

interface DarkModeToggleProps {
  variant?: 'compact' | 'full' | 'pill';
  className?: string;
}

export default function DarkModeToggle({ variant = 'compact', className = '' }: DarkModeToggleProps) {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`relative inline-flex h-8 w-14 items-center rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
          isDark ? 'bg-slate-700 focus:ring-offset-slate-900' : 'bg-slate-200'
        } ${className}`}
        aria-label="Toggle Dark Mode"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${
            isDark ? 'translate-x-6 bg-slate-900 text-amber-400' : 'translate-x-0 text-amber-500'
          }`}
        >
          {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </span>
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        id="dark-mode-toggle-btn"
      >
        <div className={`p-1 rounded-lg ${isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-600'}`}>
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </div>
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    );
  }

  // Compact variant (icon button)
  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-1.5 rounded-lg border transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-amber-400/50'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-slate-300'
      } ${className}`}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle Dark Mode"
      id="header-theme-toggle-btn"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700" />
      )}
    </button>
  );
}
