// Page Type Definitions for file-based pages

import type { PageSeoConfig } from '@/lib/seo/page-seo-types';

// Unified type lives in page-seo-types.ts; re-exported here for backward compatibility.
export type PageSEOConfig = PageSeoConfig;

export interface Page {
  slug: string;
  path: string; // File system path
  title: string;
  content?: string; // The actual page.tsx content
  seoConfig?: PageSEOConfig;
  isHomePage?: boolean;
  isClientComponent?: boolean;
  exists: boolean;
}

export interface PageListItem {
  slug: string;
  title: string;
  path: string;
  lastModified?: string;
  category?: string;
  featured?: boolean;
  draft?: boolean;
  isHomePage?: boolean;
  isClientComponent?: boolean;
  isDynamicRoute?: boolean; // true if route has dynamic segments like [slug]
  priority?: number; // sitemap priority (0.0 to 1.0)
}