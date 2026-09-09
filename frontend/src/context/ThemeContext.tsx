'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'bisaarthi-theme';

let listeners: Array<() => void> = [];

function emitThemeChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribeTheme(callback: () => void) {
  listeners.push(callback);

  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', onStorage);

  let mediaQuery: MediaQueryList | null = null;
  const onMediaChange = () => {
    callback();
  };

  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', onMediaChange);
      } else if ('addListener' in mediaQuery) {
        (mediaQuery as { addListener: (cb: () => void) => void }).addListener(onMediaChange);
      }
    }
  } catch {
    // Ignore media query listener setup error
  }

  return () => {
    listeners = listeners.filter((l) => l !== callback);
    window.removeEventListener('storage', onStorage);
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onMediaChange);
      } else if ('removeListener' in mediaQuery) {
        (mediaQuery as { removeListener: (cb: () => void) => void }).removeListener(onMediaChange);
      }
    }
  };
}

function getThemeSnapshot(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // Fallback if localStorage access fails
  }
  return 'system';
}

function getServerThemeSnapshot(): Theme {
  return 'system';
}

function getIsDarkSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const theme = getThemeSnapshot();
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

function getServerIsDarkSnapshot(): boolean {
  return false;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const isDark = useSyncExternalStore(
    subscribeTheme,
    getIsDarkSnapshot,
    getServerIsDarkSnapshot
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore localStorage write error
    }
    emitThemeChange();
  };

  const toggleTheme = () => {
    const nextTheme: Theme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'system' as Theme,
      isDark: false,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
};
