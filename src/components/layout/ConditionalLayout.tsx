'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import ConfigWarningBanner from '@/components/admin/ConfigWarningBanner';
import { Footer } from './Footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';
  const [hasBanner, setHasBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if config banner should be shown
  useEffect(() => {
    if (isAdminPage && !isAdminLogin) {
      const checkBanner = () => {
        const wasDismissed = sessionStorage.getItem('configBannerDismissed');
        if (!wasDismissed) {
          fetch('/api/admin/config-check')
            .then(res => res.json())
            .then(data => {
              const criticalWarnings = data.warnings?.filter((w: any) => 
                w.message.includes('Site URL') || w.message.includes('Site Name')
              );
              setHasBanner(criticalWarnings && criticalWarnings.length > 0);
              setIsLoading(false);
            })
            .catch(() => {
              setHasBanner(false);
              setIsLoading(false);
            });
        } else {
          setHasBanner(false);
          setIsLoading(false);
        }
      };
      
      checkBanner();

      // Listen for custom event when banner is dismissed or config changes
      const handleBannerChange = () => checkBanner();
      window.addEventListener('configBannerUpdate', handleBannerChange);

      return () => {
        window.removeEventListener('configBannerUpdate', handleBannerChange);
      };
    } else {
      setIsLoading(false);
    }
  }, [isAdminPage, isAdminLogin]);

  if (isAdminLogin) {
    // Login page: no header/footer
    return (
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        {children}
      </div>
    );
  }

  if (isAdminPage) {
    // Admin pages: admin header with warning banner, no regular footer (admin footer handled in admin layout)
    return (
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        {/* Warning banner at the top */}
        <ConfigWarningBanner />
        {/* Admin header below the banner */}
        <AdminHeader />
        {/* Main content with adjusted padding - wait for loading to complete */}
        <main className={`flex-1 w-full relative z-10 transition-all duration-300 ${
          isLoading ? 'pt-32' : (hasBanner ? 'pt-32' : 'pt-20')
        }`}>
          {children}
        </main>
      </div>
    );
  }

  // Regular pages: with header/footer
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Header />
      <main className="flex-1 pt-20 w-full relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}