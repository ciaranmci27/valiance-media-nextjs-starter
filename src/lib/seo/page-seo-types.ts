/**
 * Page SEO Configuration Types
 *
 * Unified type for page-level SEO configurations stored in seo-config.json files.
 * Used by both the admin CMS pipeline (PageEditor, page-utils-server) and
 * the SEO/sitemap reading pipeline (page-seo-utils, sitemap-pages).
 */

import type { PageSchema } from '@/lib/seo/schema-types';

export interface PageSeoConfig {
  // Page identification
  slug: string;

  // SEO settings
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    canonical?: string;
  };

  // Sitemap control
  sitemap?: {
    exclude?: boolean;
    priority?: number;
    changeFrequency?: 'never' | 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'always';
  };

  // AI-search (llms.txt) control
  llms?: {
    exclude?: boolean;
  };

  // Additional metadata
  metadata?: {
    author?: string;
    category?: string;
    tags?: string[];
    lastModified?: string;
    adminTitle?: string;
    contentType?: string;
    template?: string;
    featured?: boolean;
    draft?: boolean;
  };

  // Structured data schemas
  schemas?: PageSchema[];

  // Open Graph metadata
  openGraph?: {
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };

  // Twitter card metadata
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    images?: string[];
  };

  // Robots directives
  robots?: string;

  // Alternate language versions
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
}

export interface PageSeoConfigRaw {
  // Same as PageSeoConfig but all fields optional for easy JSON creation
  slug?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    canonical?: string;
  };
  sitemap?: {
    exclude?: boolean;
    priority?: number;
    changeFrequency?: 'never' | 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'always';
  };
  llms?: {
    exclude?: boolean;
  };
  metadata?: {
    author?: string;
    category?: string;
    tags?: string[];
    lastModified?: string;
    adminTitle?: string;
    contentType?: string;
    template?: string;
    featured?: boolean;
    draft?: boolean;
  };
  schemas?: PageSchema[];
  openGraph?: PageSeoConfig['openGraph'];
  twitter?: PageSeoConfig['twitter'];
  robots?: string;
  alternates?: PageSeoConfig['alternates'];
}