// SEO module exports (client-safe)
export * from './seo-utils';
export * from './seo.config';
export * from './SEO';
export * from './StructuredData';

// Note: Server-only functions (sitemap functions and page-seo-utils) should be 
// imported directly from their individual files in server components and route handlers.
// They use Node.js 'fs' module and cannot be used in client components.