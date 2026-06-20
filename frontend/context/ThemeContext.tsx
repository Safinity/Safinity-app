import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { darkTheme, lightTheme, type ThemeMode } from '@/constants/theme';

const THEME_STORAGE_KEY = 'safinity-theme-mode';

type ThemePreferenceContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | undefined>(undefined);

async function readStoredThemeMode(): Promise<ThemeMode | null> {
  try {
    const storedValue =
      Platform.OS === 'web'
        ? window.localStorage.getItem(THEME_STORAGE_KEY)
        : await SecureStore.getItemAsync(THEME_STORAGE_KEY);

    return storedValue === 'light' || storedValue === 'dark' ? storedValue : null;
  } catch {
    return null;
  }
}

async function persistThemeMode(mode: ThemeMode) {
  try {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
      return;
    }

    await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
  } catch {
    // Theme persistence is non-critical; keep the in-memory selection active.
  }
}

export function AppThemeProvider({ children }: React.PropsWithChildren) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    let isMounted = true;

    readStoredThemeMode().then(storedMode => {
      if (isMounted && storedMode) {
        setThemeModeState(storedMode);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    persistThemeMode(mode);
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeModeState(currentMode => {
      const nextMode = currentMode === 'dark' ? 'light' : 'dark';
      persistThemeMode(nextMode);
      return nextMode;
    });
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleThemeMode,
    }),
    [setThemeMode, themeMode, toggleThemeMode],
  );

  const selectedTheme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemePreferenceContext.Provider value={value}>
      <StyledThemeProvider theme={selectedTheme}>{children}</StyledThemeProvider>
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error('useThemePreference must be used inside AppThemeProvider');
  }

  return context;
}
