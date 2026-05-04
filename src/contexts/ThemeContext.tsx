'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { lightTheme, darkTheme, ThemeMode, ThemeColors } from '@/styles/themes';

interface ThemeContextType {
  colors: ThemeColors;
  mode: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  /**
   * Server-resolved theme from the cookie. Used as the initial state so
   * the client and server agree on the very first render — no flash, no
   * hydration mismatch on theme-dependent components.
   */
  initialTheme: ThemeMode;
  children: React.ReactNode;
}

/**
 * Suppress every CSS transition for one frame so the theme flip is instant.
 * Without this, elements with large color deltas between themes (e.g. a
 * surface going #FFFFFF → #0A0A0A) animate via their `transition-colors`
 * rule and visibly fade. We restore transitions immediately after, so
 * hover/focus animations still work normally.
 */
function flipThemeWithoutAnimation() {
  const css = document.createElement('style');
  css.appendChild(
    document.createTextNode(
      '*,*::before,*::after{transition:none !important}'
    )
  );
  document.head.appendChild(css);
  // Force a reflow so the no-transition rule is committed before the theme flips.
  void window.getComputedStyle(document.body);
  // Remove on next tick — by then the theme attribute change has been painted.
  // `Element.remove()` (vs `parent.removeChild`) is a no-op if the node has
  // already been detached, so this can't throw if some other code removed
  // our style element first.
  window.setTimeout(() => {
    css.remove();
  }, 1);
}

/**
 * Resolve the initial theme. On the server, use the cookie-derived prop.
 * On the client, prefer the actual class on <html> — the bootstrap script
 * may have flipped it (first-visit dark-OS users with no cookie yet).
 * This keeps mode state and DOM state in sync, so the user's first toggle
 * click does what they expect.
 */
function resolveInitialTheme(initialTheme: ThemeMode): ThemeMode {
  if (typeof document === 'undefined') return initialTheme;
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => resolveInitialTheme(initialTheme));
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render — server already applied the class/attribute via
    // RootLayout, and there are no transitions to suppress on initial mount.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Persist via cookie (1-year expiry) so the server can read it on the
    // next page load and render the correct theme directly. samesite=lax
    // covers normal navigation; theme is non-sensitive so no Secure flag
    // needed (works on localhost http during dev).
    document.cookie = `theme=${mode}; path=/; max-age=31536000; samesite=lax`;
    flipThemeWithoutAnimation();
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [mode]);

  const setTheme = (theme: ThemeMode) => setMode(theme);
  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const colors = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ colors, mode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}