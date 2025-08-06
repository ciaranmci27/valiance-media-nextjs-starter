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

  return {
    metadataBase: new URL(seoConfig.siteUrl),
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: seoConfig.company.name }],
    creator: seoConfig.company.name,
    publisher: seoConfig.company.name,
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
      card: (twitter as any)?.card || seoConfig.twitter.cardType as any,
      title: twitter?.title || metaTitle,
      description: twitter?.description || metaDescription,
      site: seoConfig.twitter.site,
      creator: seoConfig.twitter.handle,
      images: twitter?.images || [seoConfig.openGraph.defaultImage],
      ...twitter,
    },
    robots: robots || (seoConfig.robots as any),
    alternates: alternates || seoConfig.alternates,
    verification: {
      google: seoConfig.verification.google,
      other: {
        'msvalidate.01': seoConfig.verification.bing,
        'yandex-verification': seoConfig.verification.yandex,
        'p:domain_verify': seoConfig.verification.pinterest,
      },
    },
    ...rest,
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.company.name,
    legalName: seoConfig.company.legalName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/logos/square-logo.png`,
    foundingDate: seoConfig.company.foundingDate,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: seoConfig.company.phone,
      contactType: 'customer service',
      email: seoConfig.company.email,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: seoConfig.company.address.streetAddress,
      addressLocality: seoConfig.company.address.addressLocality,
      addressRegion: seoConfig.company.address.addressRegion,
      postalCode: seoConfig.company.address.postalCode,
      addressCountry: seoConfig.company.address.addressCountry,
    },
    sameAs: Object.values(seoConfig.social).filter(Boolean),
  };
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.defaultDescription,
    publisher: {
      '@type': 'Organization',
      name: seoConfig.company.name,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}/logos/square-logo.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
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
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: typeof window !== 'undefined' ? window.location.href : seoConfig.siteUrl,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: author || seoConfig.company.name,
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.company.name,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}/logos/square-logo.png`,
      },
    },
    image: image || seoConfig.openGraph.defaultImage,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': typeof window !== 'undefined' ? window.location.href : seoConfig.siteUrl,
    },
  };
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
    brand: {
      '@type': 'Brand',
      name: brand || seoConfig.company.name,
    },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : seoConfig.siteUrl,
      priceCurrency: currency,
      price: price,
      availability: availability,
      seller: {
        '@type': 'Organization',
        name: seoConfig.company.name,
      },
    },
  };

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