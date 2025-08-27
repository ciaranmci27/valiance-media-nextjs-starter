'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/styles/ThemeProvider';
import { seoConfig } from '@/seo/seo.config';

export function AdminFooter() {
  const { mode, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();
  
  const bottomLinks: { label: string; href: string; external?: boolean }[] = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms-of-service' },
    { label: 'Cookies', href: '#' },
  ];
  
  return (
    <footer className="relative border-t border-gray-200/30 dark:border-gray-700/30">
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
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </a>
                ) : link.href === '#' ? (
                  <button
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
                {index < bottomLinks.length - 1 && (
                  <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                )}
              </React.Fragment>
            ))}
            {/* Theme Toggle */}
            <Image
              src={mode === 'dark' ? '/images/light.png' : '/images/dark.png'}
              alt={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              width={24}
              height={24}
              onClick={toggleTheme}
              className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform ml-2"
            />
          </div>
          
          {/* Copyright */}
          <div className="text-center sm:text-left">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              © {currentYear} {seoConfig.siteName || 'Valiance Media'}. All rights reserved.
            </p>
          </div>
        </div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden lg:flex lg:justify-between lg:items-center">
          {/* Copyright - Left Side */}
          <p className="text-gray-600 dark:text-gray-400 text-sm">
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
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </a>
                ) : link.href === '#' ? (
                  <button
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
            {/* Theme Toggle */}
            <Image
              src={mode === 'dark' ? '/images/light.png' : '/images/dark.png'}
              alt={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              width={24}
              height={24}
              onClick={toggleTheme}
              className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}