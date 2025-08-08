import { Metadata } from 'next';
import { seoConfig } from './seo.config';

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
  const metaTitle = title 
    ? seoConfig.titleTemplate.replace('%s', String(title))
    : seoConfig.defaultTitle;

  const metaDescription = description || seoConfig.defaultDescription;
  const metaKeywords = keywords || seoConfig.defaultKeywords;

  const metadata: any = {
    metadataBase: new URL(seoConfig.siteUrl),
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
  };

  // Add company-related metadata only if company data exists
  if (seoConfig.company?.name) {
    metadata.authors = [{ name: seoConfig.company.name }];
    metadata.creator = seoConfig.company.name;
    metadata.publisher = seoConfig.company.name;
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
      url: openGraph?.url || seoConfig.siteUrl,
      siteName: seoConfig.siteName,
      type: (openGraph as any)?.type || seoConfig.openGraph.type,
      locale: (openGraph as any)?.locale || seoConfig.openGraph.locale,
      images: openGraph?.images || [
        {
          url: seoConfig.openGraph.defaultImage,
          width: seoConfig.openGraph.imageWidth,
          height: seoConfig.openGraph.imageHeight,
          alt: seoConfig.siteName,
        },
      ],
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
    alternates: alternates || seoConfig.alternates,
    ...rest,
  };
}

/**
 * Generate JSON-LD structured data for organization
 * Returns null if company data is not configured
 */
export function generateOrganizationSchema() {
  // Check if company data exists and has required fields
  if (!seoConfig.company?.name || !seoConfig.company?.email) {
    return null;
  }

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.company.name,
    url: seoConfig.siteUrl,
  };

  // Add optional fields only if they exist
  if (seoConfig.company.legalName) {
    schema.legalName = seoConfig.company.legalName;
  }

  // Add logo if it exists
  const logoPath = `${seoConfig.siteUrl}/logos/square-logo.png`;
  schema.logo = logoPath;

  if (seoConfig.company.foundingDate) {
    schema.foundingDate = seoConfig.company.foundingDate;
  }

  // Add contact point if phone or email exists
  if (seoConfig.company.phone || seoConfig.company.email) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
    };
    if (seoConfig.company.phone) {
      schema.contactPoint.telephone = seoConfig.company.phone;
    }
    if (seoConfig.company.email) {
      schema.contactPoint.email = seoConfig.company.email;
    }
  }

  // Add address if any address fields exist
  if (seoConfig.company.address) {
    const addressFields = Object.entries(seoConfig.company.address).filter(
      ([_, value]) => value
    );
    if (addressFields.length > 0) {
      schema.address = {
        '@type': 'PostalAddress',
      };
      if (seoConfig.company.address.streetAddress) {
        schema.address.streetAddress = seoConfig.company.address.streetAddress;
      }
      if (seoConfig.company.address.addressLocality) {
        schema.address.addressLocality = seoConfig.company.address.addressLocality;
      }
      if (seoConfig.company.address.addressRegion) {
        schema.address.addressRegion = seoConfig.company.address.addressRegion;
      }
      if (seoConfig.company.address.postalCode) {
        schema.address.postalCode = seoConfig.company.address.postalCode;
      }
      if (seoConfig.company.address.addressCountry) {
        schema.address.addressCountry = seoConfig.company.address.addressCountry;
      }
    }
  }

  // Add social media links if they exist
  if (seoConfig.social) {
    const socialLinks = Object.values(seoConfig.social).filter(Boolean);
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
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.defaultDescription,
  };

  // Only add publisher if company name exists
  if (seoConfig.company?.name) {
    schema.publisher = {
      '@type': 'Organization',
      name: seoConfig.company.name,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}/logos/square-logo.png`,
      },
    };
  }

  // Add search action
  schema.potentialAction = {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`,
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
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: typeof window !== 'undefined' ? window.location.href : seoConfig.siteUrl,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
  };

  // Add author - use provided author or company name if available
  if (author || seoConfig.company?.name) {
    schema.author = {
      '@type': 'Organization',
      name: author || seoConfig.company.name,
    };
  }

  // Add publisher if company name exists
  if (seoConfig.company?.name) {
    schema.publisher = {
      '@type': 'Organization',
      name: seoConfig.company.name,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}/logos/square-logo.png`,
      },
    };
  }

  schema.image = image || seoConfig.openGraph.defaultImage;
  schema.mainEntityOfPage = {
    '@type': 'WebPage',
    '@id': typeof window !== 'undefined' ? window.location.href : seoConfig.siteUrl,
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
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: Array.isArray(image) ? image : [image],
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : seoConfig.siteUrl,
      priceCurrency: currency,
      price: price,
      availability: availability,
    },
  };

  // Add brand - use provided brand or company name if available
  if (brand || seoConfig.company?.name) {
    schema.brand = {
      '@type': 'Brand',
      name: brand || seoConfig.company.name,
    };
  }

  // Add seller if company name exists
  if (seoConfig.company?.name) {
    schema.offers.seller = {
      '@type': 'Organization',
      name: seoConfig.company.name,
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
  return `${seoConfig.siteUrl}${cleanPath}`;
}

/**
 * Generate alternate language links
 */
export function generateAlternateLinks(currentPath: string = '') {
  return Object.entries(seoConfig.alternates.languages).map(([lang, url]) => ({
    hrefLang: lang,
    href: `${url}${currentPath}`,
  }));
}