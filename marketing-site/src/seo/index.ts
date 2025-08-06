/**
 * SEO Module Index
 * 
 * Central export point for all SEO-related functionality.
 * This makes imports cleaner and more maintainable.
 */

// Configuration
export { seoConfig, pageMetadata } from './seo.config';

// Utilities
export {
  generateMetadata,
  generateCanonicalUrl,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateProductSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateAlternateLinks,
} from './seo-utils';

// Components
export { SEO } from './SEO';
export { StructuredData } from './StructuredData';

// Next.js special exports (these are re-exported from app directory)
export { default as sitemap } from './sitemap';
export { default as robots } from './robots';