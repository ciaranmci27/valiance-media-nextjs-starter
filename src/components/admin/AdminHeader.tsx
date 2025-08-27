'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/styles/ThemeProvider';
import { useRouter, usePathname } from 'next/navigation';
import { seoConfig } from '@/seo/seo.config';

export function AdminHeader() {
  const { mode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasBanner, setHasBanner] = useState(false);

  // Check if config banner is present
  useEffect(() => {
    // Start with banner assumed present to prevent slide-under
    setHasBanner(true);
    
    const checkBanner = () => {
      const wasDismissed = sessionStorage.getItem('configBannerDismissed');
      if (!wasDismissed) {
        // Check if essential config is missing
        fetch('/api/admin/config-check')
          .then(res => res.json())
          .then(data => {
            const criticalWarnings = data.warnings?.filter((w: any) => 
              w.message.includes('Site URL') || w.message.includes('Site Name')
            );
            setHasBanner(criticalWarnings && criticalWarnings.length > 0);
          })
          .catch(() => setHasBanner(false));
      } else {
        setHasBanner(false);
      }
    };
    
    checkBanner();
    
    // Listen for banner updates
    const handleBannerUpdate = (event: any) => {
      setHasBanner(event.detail?.showBanner || false);
    };
    
    window.addEventListener('configBannerUpdate', handleBannerUpdate);
    window.addEventListener('storage', checkBanner);
    
    return () => {
      window.removeEventListener('configBannerUpdate', handleBannerUpdate);
      window.removeEventListener('storage', checkBanner);
    };
  }, []);

  const navLinks = [
    { label: 'Pages', href: '/admin/pages' },
    { label: 'Posts', href: '/admin/blog' },
    { label: 'Categories', href: '/admin/blog/categories' },
    { label: 'SEO', href: '/admin/seo' },
    { label: 'Settings', href: '/admin/settings' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header 
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-700/30' 
          : 'bg-transparent border-b border-transparent'
      }`}
      style={{
        top: hasBanner ? '40px' : '0px'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/admin" className="flex items-center space-x-2">
            <Image
              src={mode === 'dark' ? '/logos/horizontal-logo-inverted.png' : '/logos/horizontal-logo.png'}
              alt={`${seoConfig.siteName} Admin Logo`}
              width={150}
              height={40}
              className="h-8 w-auto"
            />
            <span className="text-md font-medium text-gray-500 dark:text-gray-400 ml-2 pl-2 border-l border-gray-300 dark:border-gray-600">
              Admin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-md font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary dark:text-primary-light'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* View Site Link */}
            <a
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-2 text-md text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View Site
            </a>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-md font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-md font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary dark:text-primary-light'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <a
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  View Site
                </a>
                
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}