'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/styles/ThemeProvider';
import { seoConfig } from '@/seo/seo.config';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface FooterProps {
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  showNewsletter?: boolean;
  showBrandDescription?: boolean;
  brandDescription?: string;
  copyrightText?: string;
  bottomLinks?: FooterLink[];
}

export function Footer({
  sections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
        { label: 'How It Works', href: '#' },
        { label: 'Pricing', href: '#' },
        { label: 'Download iOS', href: '#' },
        { label: 'Download Android', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Blog', href: '/blog' },
        { label: 'Press Kit', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Support', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Library', href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'API Docs', href: '#' },
        { label: 'Status', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms-of-service' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'GDPR', href: '#' },
      ],
    },
  ],
  socialLinks = [
    { 
      label: 'Twitter', 
      href: '#', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    },
    { 
      label: 'Instagram', 
      href: '#', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
    },
    { 
      label: 'Facebook', 
      href: '#', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    },
    { 
      label: 'YouTube', 
      href: '#', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    },
  ],
  showNewsletter = true,
  showBrandDescription = true,
  brandDescription = 'Your company description here.',
  copyrightText = `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
  bottomLinks = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms-of-service' },
    { label: 'Cookies', href: '#' },
  ],
}: FooterProps) {
  const { mode, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter submission
    console.log('Newsletter signup:', email);
  };

  return (
    <footer className="relative border-t border-gray-200/30 dark:border-gray-700/30">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        {/* Mobile/Tablet: Stacked Layout */}
        <div className="lg:hidden">
          {/* Brand Section - Full width on mobile */}
          <div className="text-center sm:text-left mb-8 sm:mb-12">
            <Link href="/" className="inline-block mt-8 mb-4">
              <Image
                src={mode === 'dark' ? '/logos/horizontal-logo-inverted.png' : '/logos/horizontal-logo.png'}
                alt={`${seoConfig.siteName} Logo`}
                width={180}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
            {showBrandDescription && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto sm:mx-0">
                {brandDescription}
              </p>
            )}
            {/* Social Links */}
            <div className="flex justify-center sm:justify-start space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections - Mobile/Tablet Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 sm:gap-8">
            {sections.map((section) => (
              <div key={section.title} className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                  {section.title}
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors text-sm sm:text-base"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors text-sm sm:text-base"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Side-by-side Layout */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={mode === 'dark' ? '/logos/horizontal-logo-inverted.png' : '/logos/horizontal-logo.png'}
                alt={`${seoConfig.siteName} Logo`}
                width={180}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
            {showBrandDescription && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                {brandDescription}
              </p>
            )}
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections - Takes 4 columns (1 each) */}
          {sections.map((section) => (
            <div key={section.title} className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </p>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 py-6 sm:pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          {/* Mobile/Tablet: Stacked Layout */}
          <div className="lg:hidden flex flex-col space-y-4 sm:space-y-6">
            {/* Bottom Links */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6 text-sm">
              {bottomLinks.map((link, index) => (
                <React.Fragment key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
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
                {copyrightText}
              </p>
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden lg:flex lg:justify-between lg:items-center">
            {/* Copyright - Left Side */}
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {copyrightText}
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
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
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
      </div>
    </footer>
  );
}