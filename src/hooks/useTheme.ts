'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to dark
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
      return newTheme;
    });
  };

  return { theme, toggleTheme, mounted };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === 'dark') {
    // Dark theme (current default)
    root.style.setProperty('--indigo-bg', '#09090f');
    root.style.setProperty('--indigo-surface', '#111128');
    root.style.setProperty('--indigo-primary', '#c0c1ff');
    root.style.setProperty('--indigo-primary-dim', '#8889d9');
    root.style.setProperty('--indigo-btn', '#2e3192');
    root.style.setProperty('--indigo-text-muted', '#888899');
    root.style.setProperty('--indigo-text-faint', '#444455');
    root.style.setProperty('--indigo-border', '#1a1a2e');
    root.style.setProperty('--indigo-border-2', '#0f0f1f');
    root.style.setProperty('--indigo-tertiary', '#6b7adb');
  } else {
    // Light theme
    root.style.setProperty('--indigo-bg', '#f5f5f9');
    root.style.setProperty('--indigo-surface', '#ffffff');
    root.style.setProperty('--indigo-primary', '#2e3192');
    root.style.setProperty('--indigo-primary-dim', '#5a5db5');
    root.style.setProperty('--indigo-btn', '#6b7adb');
    root.style.setProperty('--indigo-text-muted', '#666666');
    root.style.setProperty('--indigo-text-faint', '#999999');
    root.style.setProperty('--indigo-border', '#e0e0e8');
    root.style.setProperty('--indigo-border-2', '#f0f0f5');
    root.style.setProperty('--indigo-tertiary', '#2e3192');
  }
}
