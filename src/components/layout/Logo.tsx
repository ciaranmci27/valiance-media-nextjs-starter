'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { seoConfig } from '@/seo/seo.config';

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

export function Logo({
  width = 200,
  height = 40,
  className = 'h-10 w-auto',
  priority = false,
  alt,
  inverted,
}: LogoProps) {
  const { mode } = useTheme();
  const [useFallback, setUseFallback] = useState(false);
  const useInverted = inverted ?? mode === 'dark';

  // Reset fallback when the logo variant changes (theme toggle or navigation)
  useEffect(() => {
    setUseFallback(false);
  }, [useInverted]);
  const getPrimarySrc = () => useInverted ? LOGO_INVERTED_PATH : LOGO_PATH;
  const getFallbackSrc = () => useInverted ? LOGO_PATH : LOGO_INVERTED_PATH;

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
