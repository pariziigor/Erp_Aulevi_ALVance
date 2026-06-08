import { Moon, Sun } from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle no-hover-lift flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-lg backdrop-blur-xl ${className}`}
      aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
