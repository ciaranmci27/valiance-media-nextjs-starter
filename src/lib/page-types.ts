// Page Type Definitions for file-based pages

import { PageSchema } from '@/components/admin/seo/schema-types';

export interface PageSEOConfig {
  slug: string;
  seo: {
    title: string;
    description: string;
    keywords?: string[];
    noIndex?: boolean;
    noFollow?: boolean;
    canonical?: string;
    image?: string;
  };
  sitemap?: {
    exclude?: boolean;
    priority?: number;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  };
  metadata?: {
    category?: string;
    lastModified?: string;
    template?: string;
    featured?: boolean;
    draft?: boolean;
    adminTitle?: string; // Short, clean title for CMS backend display (optional)
    author?: string; // Content author
    contentType?: string; // Type of content (e.g., 'programmatic-seo' for pages with dedicated sitemaps)
  };
  schemas?: PageSchema[];
}

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