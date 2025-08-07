/**
 * Page SEO Configuration Types
 * 
 * These types define the structure for page-level SEO configurations
 * that can be placed in seo-config.json files within page directories
 */

export interface PageSeoConfig {
  // Page identification
  slug: string;
  
  // SEO settings
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    noIndex?: boolean; // If true, adds noindex to robots meta tag
  };
  
  // Sitemap control
  sitemap?: {
    exclude?: boolean; // If true, excludes from sitemap
    priority?: number; // Custom priority (0.0 to 1.0)
    changeFrequency?: 'never' | 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'always';
  };
  
  // Additional metadata
  metadata?: {
    author?: string;
    category?: string;
    tags?: string[];
    lastModified?: string;
  };
  
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
  };
  sitemap?: {
    exclude?: boolean;
    priority?: number;
    changeFrequency?: 'never' | 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'always';
  };
  metadata?: {
    author?: string;
    category?: string;
    tags?: string[];
    lastModified?: string;
  };
}