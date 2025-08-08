// Page Type Definitions for file-based pages

export interface PageSEOConfig {
  slug: string;
  seo: {
    title: string;
    description: string;
    keywords?: string[];
    noIndex?: boolean;
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
  };
}

export interface Page {
  slug: string;
  path: string; // File system path
  title: string;
  content?: string; // The actual page.tsx content
  seoConfig?: PageSEOConfig;
  isHomePage?: boolean;
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
}