import { Metadata } from 'next';
import { loadPageSeoConfig } from '@/lib/page-seo-utils';
import { seoConfig } from '@/seo/seo.config';

/**
 * Page SEO Utilities (Server-Only)
 * 
 * Provides easy integration of page-level SEO configurations
 * with fallbacks to global SEO settings.
 * 
 * ⚠️ SERVER-ONLY: Uses Node.js 'fs' module. Import directly from this file,
 * not from '@/seo' index. Use only in server components and generateMetadata.
 */

interface PageSEOProps {
  pagePath: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

/**
 * Generate metadata for a page using its seo-config.json
 * Use this in your page.tsx files to automatically apply SEO settings
 */
export function generatePageMetadata({
  pagePath,
  fallbackTitle,
  fallbackDescription,
}: PageSEOProps): Metadata {
  const pageConfig = loadPageSeoConfig(pagePath);
  
  // Build title with fallback chain
  const title = pageConfig?.seo?.title || 
    fallbackTitle || 
    `${(seoConfig as any).siteName || (seoConfig.openGraph as any)?.siteName || 'Website'}`;
  
  // Build description with fallback chain
  const configWithDefaults = seoConfig as any;
  const description = pageConfig?.seo?.description || 
    fallbackDescription || 
    configWithDefaults.defaultDescription;
  
  // Build keywords
  const keywords = pageConfig?.seo?.keywords?.join(', ') || 
    configWithDefaults.defaultKeywords?.join(', ');
  
  // Determine robots directive
  const robots = pageConfig?.seo?.noIndex === true 
    ? 'noindex, nofollow' 
    : 'index, follow';
  
  // Build image URL
  const imageUrl = pageConfig?.seo?.image || seoConfig.openGraph.defaultImage;
  
  return {
    title,
    description,
    keywords,
    robots,
    authors: [{ name: pageConfig?.metadata?.author || configWithDefaults.company?.name }],
    openGraph: {
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
      type: 'website',
      siteName: (seoConfig as any).siteName || (seoConfig.openGraph as any)?.siteName || 'Website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    other: {
      'page-category': pageConfig?.metadata?.category || '',
      'page-tags': pageConfig?.metadata?.tags?.join(', ') || '',
      'last-modified': pageConfig?.metadata?.lastModified || '',
    },
  };
}

/**
 * Check if a page should be excluded from search engines
 */
export function isPageNoIndex(pagePath: string): boolean {
  const pageConfig = loadPageSeoConfig(pagePath);
  return pageConfig?.seo?.noIndex === true;
}

/**
 * Get page configuration for debugging/development
 */
export function getPageConfig(pagePath: string) {
  return loadPageSeoConfig(pagePath);
}