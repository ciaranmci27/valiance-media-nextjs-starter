'use client';

import { useEffect } from 'react';
import { StructuredData } from './StructuredData';
import { 
  generateOrganizationSchema, 
  generateWebsiteSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateProductSchema,
} from './seo-utils';

interface SEOProps {
  // Page-specific structured data
  structuredData?: Record<string, any> | Record<string, any>[];
  
  // Common structured data types
  includeOrganization?: boolean;
  includeWebsite?: boolean;
  
  // Page-specific data
  pageData?: {
    title: string;
    description: string;
    datePublished?: string;
    dateModified?: string;
    author?: string;
    image?: string;
  };
  
  // Breadcrumbs
  breadcrumbs?: Array<{ name: string; url: string }>;
  
  // FAQ
  faqs?: Array<{ question: string; answer: string }>;
  
  // Product (for e-commerce pages)
  product?: {
    name: string;
    description: string;
    image: string | string[];
    price: number | string;
    currency?: string;
    availability?: string;
    brand?: string;
    sku?: string;
    rating?: number;
    reviewCount?: number;
  };
}

/**
 * SEO Component
 * 
 * This component handles structured data and other SEO enhancements for pages.
 * Place it in your page components to add rich snippets and structured data.
 * 
 * @example
 * ```tsx
 * <SEO 
 *   includeOrganization 
 *   includeWebsite
 *   pageData={{
 *     title: "About Us",
 *     description: "Learn about our company"
 *   }}
 *   breadcrumbs={[
 *     { name: "Home", url: "/" },
 *     { name: "About", url: "/about" }
 *   ]}
 * />
 * ```
 */
export function SEO({
  structuredData,
  includeOrganization = false,
  includeWebsite = false,
  pageData,
  breadcrumbs,
  faqs,
  product,
}: SEOProps) {
  // Collect all structured data
  const allStructuredData: Record<string, any>[] = [];

  // Add custom structured data
  if (structuredData) {
    if (Array.isArray(structuredData)) {
      allStructuredData.push(...structuredData);
    } else {
      allStructuredData.push(structuredData);
    }
  }

  // Add organization schema (only if company data exists)
  if (includeOrganization) {
    const orgSchema = generateOrganizationSchema();
    if (orgSchema) {
      allStructuredData.push(orgSchema);
    }
  }

  // Add website schema
  if (includeWebsite) {
    allStructuredData.push(generateWebsiteSchema());
  }

  // Add webpage schema
  if (pageData) {
    allStructuredData.push(generateWebPageSchema(pageData));
  }

  // Add breadcrumb schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    allStructuredData.push(generateBreadcrumbSchema(breadcrumbs));
  }

  // Add FAQ schema
  if (faqs && faqs.length > 0) {
    allStructuredData.push(generateFAQSchema(faqs));
  }

  // Add product schema
  if (product) {
    allStructuredData.push(generateProductSchema(product));
  }

  // Add viewport meta tag for mobile optimization
  useEffect(() => {
    // Check if viewport meta tag exists
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=5';
      document.head.appendChild(meta);
    }
  }, []);

  if (allStructuredData.length === 0) {
    return null;
  }

  return <StructuredData data={allStructuredData} />;
}