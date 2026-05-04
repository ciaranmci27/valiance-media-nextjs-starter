'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { seoConfig } from '@/lib/seo/config';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
  inverted?: boolean;
}

const LOGO_PATH = '/logos/horizontal-logo.png';
const LOGO_INVERTED_PATH = '/logos/horizontal-logo-inverted.png';

/**
 * Theme-aware logo. Renders a single `<Image>` based on the current theme.
 * Because `useTheme()` initializes from the server-resolved cookie, the
 * src is correct from the very first render — no dual fetch, no hydration
 * mismatch. Edge case: first-time visitors with no cookie whose OS prefers
 * dark see a brief flash of the light logo before the bootstrap script
 * flips the theme; subsequent visits are pixel-perfect.
 */
export function Logo({
  width = 200,
  height = 40,
  className = 'h-10 w-auto',
  priority = false,
  alt,
  inverted,
}: LogoProps) {
  const { mode } = useTheme();
  const useInverted = inverted ?? mode === 'dark';
  const primarySrc = useInverted ? LOGO_INVERTED_PATH : LOGO_PATH;
  const fallbackSrc = useInverted ? LOGO_PATH : LOGO_INVERTED_PATH;

  const [useFallback, setUseFallback] = useState(false);

  // Reset fallback when the active variant changes (e.g., theme toggle)
  useEffect(() => {
    setUseFallback(false);
  }, [useInverted]);

  return (
    <Image
      src={useFallback ? fallbackSrc : primarySrc}
      alt={alt || `${seoConfig.siteName} Logo`}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setUseFallback(true)}
    />
  );
}
