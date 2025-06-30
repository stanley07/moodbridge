// src/hooks/useDarkMode.ts
import { useEffect, useState } from 'react';

export default function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const enabled = root.classList.contains('dark');
    root.classList.toggle('dark', !enabled);
    localStorage.setItem('theme', !enabled ? 'dark' : 'light');
    setIsDark(!enabled);

    console.log(`🌗 Theme toggled: ${!enabled ? 'dark' : 'light'}`);
  };

  return [isDark, toggle];
}
