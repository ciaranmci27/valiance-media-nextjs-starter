'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { seoConfig } from '@/seo/seo.config';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}

const LOGO_PATH = '/logos/horizontal-logo.png';
const LOGO_INVERTED_PATH = '/logos/horizontal-logo-inverted.png';

export function Logo({
  width = 200,
  height = 40,
  className = 'h-10 w-auto',
  priority = false,
  alt,
}: LogoProps) {
  const { mode } = useTheme();
  const [useFallback, setUseFallback] = useState(false);

  // Determine which logo to use based on mode and fallback state
  // Dark mode: try inverted first, fallback to regular
  // Light mode: try regular first, fallback to inverted
  const getPrimarySrc = () => mode === 'dark' ? LOGO_INVERTED_PATH : LOGO_PATH;
  const getFallbackSrc = () => mode === 'dark' ? LOGO_PATH : LOGO_INVERTED_PATH;

  const src = useFallback ? getFallbackSrc() : getPrimarySrc();

  const handleError = () => {
    // If primary logo fails, try the fallback
    if (!useFallback) {
      setUseFallback(true);
    }
  };

  return (
    <Image
      src={src}
      alt={alt || `${seoConfig.siteName} Logo`}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
    />
  );
}
