'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { seoConfig } from '@/seo/seo.config';

export function AdminFooter() {
  const pathname = usePathname();
  const { mode, toggleTheme } = useTheme();

  if (pathname === '/admin/login') return null;
  const currentYear = new Date().getFullYear();
  
  const bottomLinks: { label: string; href: string; external?: boolean }[] = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms-of-service' },
    { label: 'Cookies', href: '#' },
  ];
  
  return (
    <footer className="relative border-t" style={{ borderColor: 'var(--color-border-light)' }}>
      {/* Bottom Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Mobile/Tablet: Stacked Layout */}
        <div className="lg:hidden">
          {/* Links */}
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs sm:text-sm mb-3">
            {bottomLinks.map((link, index) => (
              <React.Fragment key={link.label}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </a>
                ) : link.href === '#' ? (
                  <button
                    className="hover:text-primary-600 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="hover:text-primary-600 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                )}
                {index < bottomLinks.length - 1 && (
                  <span className="hidden sm:inline" style={{ color: 'var(--color-text-tertiary)' }}>•</span>
                )}
              </React.Fragment>
            ))}
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-0 bg-transparent border-0 cursor-pointer hover:scale-110 transition-transform ml-2"
            >
              <Image
                src={mode === 'dark' ? '/images/light.png' : '/images/dark.png'}
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </button>
          </div>
          
          {/* Copyright */}
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              © {currentYear} {seoConfig.siteName || 'Valiance Media'}. All rights reserved.
            </p>
          </div>
        </div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden lg:flex lg:justify-between lg:items-center">
          {/* Copyright - Left Side */}
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            © {currentYear} {seoConfig.siteName || 'Valiance Media'}. All rights reserved.
          </p>
          
          {/* Links & Theme Toggle - Right Side */}
          <div className="flex items-center gap-6 text-sm">
            {bottomLinks.map((link, index) => (
              <React.Fragment key={link.label}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </a>
                ) : link.href === '#' ? (
                  <button
                    className="hover:text-primary-600 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="hover:text-primary-600 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-0 bg-transparent border-0 cursor-pointer hover:scale-110 transition-transform"
            >
              <Image
                src={mode === 'dark' ? '/images/light.png' : '/images/dark.png'}
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}