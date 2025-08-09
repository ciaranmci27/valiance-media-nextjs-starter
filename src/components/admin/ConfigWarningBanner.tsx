'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConfigWarningBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkAndUpdate = () => {
      // Check if banner was previously dismissed this session
      const wasDismissed = sessionStorage.getItem('configBannerDismissed');
      if (wasDismissed) {
        setDismissed(true);
        return;
      }
      checkConfiguration();
    };
    
    checkAndUpdate();
    
    // Re-check when window regains focus (user might have updated config in another tab)
    const handleFocus = () => {
      checkAndUpdate();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Also re-check periodically
    const interval = setInterval(checkAndUpdate, 5000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const checkConfiguration = async () => {
    try {
      const res = await fetch('/api/admin/config-check');
      if (res.ok) {
        const data = await res.json();
        // Only show banner for critical missing fields (Site URL and Site Name)
        const criticalWarnings = data.warnings?.filter((w: any) => 
          w.message.includes('Site URL') || w.message.includes('Site Name')
        );
        const shouldShow = criticalWarnings && criticalWarnings.length > 0;
        setShowBanner(shouldShow);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('configBannerUpdate', { 
          detail: { showBanner: shouldShow } 
        }));
      }
    } catch (error) {
      console.error('Failed to check configuration:', error);
      setShowBanner(false);
      window.dispatchEvent(new CustomEvent('configBannerUpdate', { 
        detail: { showBanner: false } 
      }));
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!isMounted || !showBanner || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('configBannerDismissed', 'true');
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('configBannerUpdate', { 
      detail: { showBanner: false } 
    }));
  };

  return (
    <>
      {/* Fixed banner at top */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-50 dark:bg-amber-900/90 border-b border-amber-200 dark:border-amber-700">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-amber-600 dark:text-amber-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 mb-0">
                <span className="font-medium">Setup Required:</span> Configure your Site Name and Site URL.
              </p>
              <Link
                href="/admin/seo?section=basic"
                className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 underline"
              >
                Configure Now →
              </Link>
            </div>
            <button
              onClick={handleDismiss}
              className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 p-1"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Spacer to push content down */}
      <div className="h-10" />
    </>
  );
}