import { Metadata } from 'next';
import { seoConfig } from './seo.config';

/**
 * Get a valid site URL with fallback
 */
function getSiteUrl(): string {
  // Check if siteUrl exists and is valid
  const configSiteUrl = (seoConfig as any).siteUrl;
  if (configSiteUrl) {
    try {
      new URL(configSiteUrl);
      return configSiteUrl;
    } catch {
      // Invalid URL, continue to fallback
    }
  }
  
  // Fallback to environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SITE_URL);
      return process.env.NEXT_PUBLIC_SITE_URL;
    } catch {
      // Invalid URL, continue to fallback
    }
  }
  
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Production fallback - use a placeholder that won't break
  // This should be updated in production
  return 'https://example.com';
}

/**
 * Generate metadata for a page
 */
export function generateMetadata({
  title,
  description,
  keywords,
  openGraph,
  twitter,
  robots,
  alternates,
  ...rest
}: Partial<Metadata> = {}): Metadata {
  const siteUrl = getSiteUrl();
  
  // Handle empty config values gracefully
  const configFull = seoConfig as any;
  const siteName = (seoConfig as any).siteName || (seoConfig.openGraph as any)?.siteName || 'Website';
  const defaultTitle = configFull.defaultTitle || siteName;
  const titleTemplate = seoConfig.titleTemplate || '{pageName} | {siteName}';
  
  const metaTitle = title 
    ? titleTemplate.replace('{pageName}', String(title)).replace('{siteName}', siteName)
    : defaultTitle;

  const metaDescription = description || configFull.defaultDescription || `Welcome to ${siteName}`;
  const metaKeywords = keywords || configFull.defaultKeywords || [];

  const metadata: any = {
    metadataBase: new URL(siteUrl),
    title: metaTitle || 'Website',
    description: metaDescription,
    keywords: metaKeywords,
  };

  // Add company-related metadata only if company data exists and is not empty
  if (configFull.company?.name && configFull.company.name.trim()) {
    metadata.authors = [{ name: configFull.company.name }];
    metadata.creator = configFull.company.name;
    metadata.publisher = configFull.company.name;
  }

  return {
    ...metadata,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: openGraph?.title || metaTitle,
      description: openGraph?.description || metaDescription,
      url: openGraph?.url || siteUrl,
      siteName: siteName,
      type: (openGraph as any)?.type || seoConfig.openGraph.type || 'website',
      locale: (openGraph as any)?.locale || seoConfig.openGraph.locale || 'en_US',
      images: openGraph?.images || (seoConfig.openGraph.defaultImage ? [
        {
          url: seoConfig.openGraph.defaultImage,
          width: seoConfig.openGraph.imageWidth || 1200,
          height: seoConfig.openGraph.imageHeight || 630,
          alt: siteName,
        },
      ] : []),
      ...openGraph,
    },
    twitter: {
      card: (twitter as any)?.card || 'summary_large_image' as any,
      title: twitter?.title || metaTitle,
      description: twitter?.description || metaDescription,
      images: twitter?.images || [seoConfig.openGraph.defaultImage],
      ...twitter,
    },
    robots: robots || (seoConfig.robots as any),
    alternates: alternates || (configFull.alternates?.canonical ? configFull.alternates : undefined),
    ...rest,
  };
}

/**
 * Generate JSON-LD structured data for organization
 * Returns null if company data is not configured
 */
export function generateOrganizationSchema() {
  const configFull = seoConfig as any;
  // Check if company data exists and has required fields (not empty strings)
  if (!configFull.company?.name?.trim() || !configFull.company?.email?.trim()) {
    return null;
  }

  const siteUrl = getSiteUrl();
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: configFull.company.name,
    url: siteUrl,
  };

  // Add optional fields only if they exist
  if (configFull.company.legalName) {
    schema.legalName = configFull.company.legalName;
  }

  // Add logo if it exists
  const logoPath = `${siteUrl}/logos/square-logo.png`;
  schema.logo = logoPath;

  if (configFull.company.foundingDate) {
    schema.foundingDate = configFull.company.foundingDate;
  }

  // Add contact point if phone or email exists
  if (configFull.company.phone || configFull.company.email) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
    };
    if (configFull.company.phone) {
      schema.contactPoint.telephone = configFull.company.phone;
    }
    if (configFull.company.email) {
      schema.contactPoint.email = configFull.company.email;
    }
  }

  // Add address if any address fields exist
  if (configFull.company.address) {
    const addressFields = Object.entries(configFull.company.address).filter(
      ([_, value]) => value
    );
    if (addressFields.length > 0) {
      schema.address = {
        '@type': 'PostalAddress',
      };
      if (configFull.company.address.streetAddress) {
        schema.address.streetAddress = configFull.company.address.streetAddress;
      }
      if (configFull.company.address.addressLocality) {
        schema.address.addressLocality = configFull.company.address.addressLocality;
      }
      if (configFull.company.address.addressRegion) {
        schema.address.addressRegion = configFull.company.address.addressRegion;
      }
      if (configFull.company.address.postalCode) {
        schema.address.postalCode = configFull.company.address.postalCode;
      }
      if (configFull.company.address.addressCountry) {
        schema.address.addressCountry = configFull.company.address.addressCountry;
      }
    }
  }

  // Add social media links if they exist
  const configWithSocial = seoConfig as any;
  if (configWithSocial.social) {
    const socialLinks = Object.values(configWithSocial.social).filter(Boolean);
    if (socialLinks.length > 0) {
      schema.sameAs = socialLinks;
    }
  }

  return schema;
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteSchema() {
  const configFull = seoConfig as any;
  // Return null if no site name is configured
  const siteNameCheck = (seoConfig as any).siteName || (seoConfig.openGraph as any)?.siteName;
  if (!siteNameCheck?.trim()) {
    return null;
  }
  
  const siteUrl = getSiteUrl();
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteNameCheck,
    url: siteUrl,
    description: configFull.defaultDescription || `Welcome to ${siteNameCheck}`,
  };

  // Only add publisher if company name exists and is not empty
  if (configFull.company?.name?.trim()) {
    schema.publisher = {
      '@type': 'Organization',
      name: configFull.company.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logos/square-logo.png`,
      },
    };
  }

  // Add search action
  schema.potentialAction = {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  };

  return schema;
}

/**
 * Generate JSON-LD structured data for a webpage
 */
export function generateWebPageSchema({
  title,
  description,
  datePublished,
  dateModified,
  author,
  image,
}: {
  title: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) {
  const configFull = seoConfig as any;
  const siteUrl = getSiteUrl();
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: typeof window !== 'undefined' ? window.location.href : siteUrl,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
  };

  // Add author - use provided author or company name if available and not empty
  if (author || configFull.company?.name?.trim()) {
    schema.author = {
      '@type': 'Organization',
      name: author || configFull.company.name,
    };
  }

  // Add publisher if company name exists and is not empty
  if (configFull.company?.name?.trim()) {
    schema.publisher = {
      '@type': 'Organization',
      name: configFull.company.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logos/square-logo.png`,
      },
    };
  }

  schema.image = image || seoConfig.openGraph.defaultImage;
  schema.mainEntityOfPage = {
    '@type': 'WebPage',
    '@id': typeof window !== 'undefined' ? window.location.href : siteUrl,
  };

  return schema;
}

/**
 * Generate JSON-LD structured data for a product
 */
export function generateProductSchema({
  name,
  description,
  image,
  price,
  currency = 'USD',
  availability = 'https://schema.org/InStock',
  brand,
  sku,
  rating,
  reviewCount,
}: {
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
}) {
  const configFull = seoConfig as any;
  const siteUrl = getSiteUrl();
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: Array.isArray(image) ? image : [image],
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : siteUrl,
      priceCurrency: currency,
      price: price,
      availability: availability,
    },
  };

  // Add brand - use provided brand or company name if available and not empty
  if (brand || configFull.company?.name?.trim()) {
    schema.brand = {
      '@type': 'Brand',
      name: brand || configFull.company.name,
    };
  }

  // Add seller if company name exists and is not empty
  if (configFull.company?.name?.trim()) {
    schema.offers.seller = {
      '@type': 'Organization',
      name: configFull.company.name,
    };
  }

  if (sku) schema.sku = sku;

  if (rating && reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount,
    };
  }

  return schema;
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD structured data for FAQ
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const siteUrl = getSiteUrl();
  return `${siteUrl}${cleanPath}`;
}

/**
 * Generate alternate language links
 */
export function generateAlternateLinks(currentPath: string = '') {
  const configWithAlternates = seoConfig as any;
  if (!configWithAlternates.alternates?.languages) {
    return [];
  }
  return Object.entries(configWithAlternates.alternates.languages).map(([lang, url]) => ({
    hrefLang: lang,
    href: `${url}${currentPath}`,
  }));
}