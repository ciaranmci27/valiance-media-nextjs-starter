'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AnalyticsContextType {
  isExcluded: boolean;
  isLoading: boolean;
  userIP: string | null;
  exclusionReason: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

/**
 * Hook to access analytics exclusion state.
 * Must be used within an AnalyticsProvider.
 */
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

// Session storage key for caching exclusion status
const CACHE_KEY = 'analytics_exclusion_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedExclusion {
  isExcluded: boolean;
  userIP: string | null;
  exclusionReason: string | null;
  timestamp: number;
}

/**
 * AnalyticsProvider wraps the app to provide analytics exclusion state.
 * On mount, it checks if the current user should be excluded from analytics
 * (based on IP, localhost, or bot detection) and provides this state to all children.
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [isExcluded, setIsExcluded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userIP, setUserIP] = useState<string | null>(null);
  const [exclusionReason, setExclusionReason] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkExclusion = async () => {
      try {
        // Check session cache first
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed: CachedExclusion = JSON.parse(cached);
            const age = Date.now() - parsed.timestamp;
            if (age < CACHE_DURATION_MS) {
              // Use cached value
              setIsExcluded(parsed.isExcluded);
              setUserIP(parsed.userIP);
              setExclusionReason(parsed.exclusionReason);
              setIsLoading(false);

              // Set global flag for non-React code
              if (typeof window !== 'undefined') {
                (window as Window & { __ANALYTICS_EXCLUDED__?: boolean }).__ANALYTICS_EXCLUDED__ = parsed.isExcluded;
              }
              return;
            }
          } catch {
            // Invalid cache, continue to fetch
          }
        }

        // Fetch exclusion status from API
        const res = await fetch('/api/analytics/check-exclusion');
        if (res.ok) {
          const data = await res.json();
          setIsExcluded(data.isExcluded);
          setUserIP(data.ip);
          setExclusionReason(data.reason);

          // Cache the result
          const cacheData: CachedExclusion = {
            isExcluded: data.isExcluded,
            userIP: data.ip,
            exclusionReason: data.reason,
            timestamp: Date.now(),
          };
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

          // Set global flag for non-React code
          if (typeof window !== 'undefined') {
            (window as Window & { __ANALYTICS_EXCLUDED__?: boolean }).__ANALYTICS_EXCLUDED__ = data.isExcluded;
          }
        }
      } catch (error) {
        console.error('Error checking analytics exclusion:', error);
        // On error, default to not excluded (fail open for analytics)
        setIsExcluded(false);
        // Set global flag so non-React tracking code works
        if (typeof window !== 'undefined') {
          (window as Window & { __ANALYTICS_EXCLUDED__?: boolean }).__ANALYTICS_EXCLUDED__ = false;
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkExclusion();
  }, []);

  // Prevent flash of content during initial load
  if (!mounted) {
    return null;
  }

  return (
    <AnalyticsContext.Provider value={{ isExcluded, isLoading, userIP, exclusionReason }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Clears the analytics exclusion cache.
 * Useful when admin updates exclusion settings.
 */
export function clearAnalyticsCache() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CACHE_KEY);
  }
}
