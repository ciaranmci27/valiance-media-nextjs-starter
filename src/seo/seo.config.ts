/**
 * SEO Configuration
 *
 * This file contains all the default SEO settings for your marketing website.
 * Update these values to match your brand and business.
 *
 * REQUIRED CONFIGURATION:
 * 1. Update `siteUrl` to your production domain
 * 2. Update `siteName` to your brand name
 * 3. Fill in `company` details for Organization schema
 * 4. Add `social` links for schema.org sameAs property
 * 5. Configure analytics IDs if using tracking
 */

export const seoConfig = {
  // ==========================================================================
  // SITE IDENTITY - Update these for your brand
  // ==========================================================================
  siteName: 'Valiance Media',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  titleTemplate: '{pageName} | {siteName}',
  defaultDescription: 'Build high-converting marketing websites with our Next.js boilerplate. Professional templates, SEO optimization, and modern design patterns included.',
  defaultKeywords: ['marketing website', 'nextjs boilerplate', 'web development', 'conversion optimization', 'landing pages', 'SEO'],

  // ==========================================================================
  // COMPANY INFORMATION - Required for Organization schema
  // ==========================================================================
  company: {
    name: '', // e.g., 'Acme Inc'
    legalName: '', // e.g., 'Acme Incorporated'
    email: '', // e.g., 'hello@example.com'
    phone: '', // e.g., '+1-555-123-4567'
    foundingDate: '', // e.g., '2020-01-01'
    address: {
      streetAddress: '',
      addressLocality: '', // City
      addressRegion: '', // State/Province
      postalCode: '',
      addressCountry: '', // e.g., 'US'
    },
  },

  // ==========================================================================
  // SOCIAL MEDIA - Used for schema.org sameAs property
  // ==========================================================================
  social: {
    twitter: '', // e.g., 'https://twitter.com/yourhandle'
    facebook: '', // e.g., 'https://facebook.com/yourpage'
    linkedin: '', // e.g., 'https://linkedin.com/company/yourcompany'
    instagram: '', // e.g., 'https://instagram.com/yourhandle'
    youtube: '', // e.g., 'https://youtube.com/@yourchannel'
    github: '', // e.g., 'https://github.com/yourorg'
  },

  // ==========================================================================
  // ANALYTICS - Add your tracking IDs
  // ==========================================================================
  analytics: {
    googleAnalyticsId: '', // e.g., 'G-XXXXXXXXXX'
    facebookPixelId: '', // e.g., '1234567890'
    hotjarId: '', // e.g., '1234567'
    clarityId: '', // e.g., 'abcdefghij'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    defaultImage: '/logos/og-default-logo.png',
    imageWidth: 1200,
    imageHeight: 630
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    },
    // Robots.txt configuration,
    txt: {
      rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '*.json'],
        crawlDelay: 0
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
        crawlDelay: 0
      }
      ],
      customRules: ''
    }
  },
  sitemap: {
    excludedPages: [
    '/admin',
    '/dashboard',
    '/api',
    '/test',
    '/dev'
  ],
    excludedBlogPatterns: [
    'example',
    'test',
    'demo',
    'sample'
  ],
    changeFrequency: {
      homepage: 'weekly',
      pages: 'monthly',
      blog: 'weekly',
      categories: 'monthly'
    },
    priority: {
      homepage: 1,
      mainPages: 0.8,
      blog: 0.6,
      categories: 0.7
    }
  },
  schema: {
    activeTypes: {
      organization: true,
      website: true,
      localBusiness: false,
      person: false,
      breadcrumbs: true
    },
    organization: {
      enabled: true,
      type: 'Organization',
      logo: {
        width: 600,
        height: 60
      },
      contactPoint: {
        contactType: 'customer service',
        areaServed: 'US',
        availableLanguage: [
    'English'
  ],
        hoursAvailable: {
          opens: '09:00',
          closes: '17:00',
          dayOfWeek: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ]
        },
        enabled: false
      }
    },
    website: {
      enabled: true,
      potentialAction: {
        enabled: true,
        queryInput: 'required name=search_term_string'
      }
    },
    localBusiness: {
      enabled: false,
      type: 'LocalBusiness',
      priceRange: '$$',
      openingHours: {
        monday: {
          opens: '09:00',
          closes: '17:00'
        },
        tuesday: {
          opens: '09:00',
          closes: '17:00'
        },
        wednesday: {
          opens: '09:00',
          closes: '17:00'
        },
        thursday: {
          opens: '09:00',
          closes: '17:00'
        },
        friday: {
          opens: '09:00',
          closes: '17:00'
        }
      },
      currenciesAccepted: 'USD'
    },
    person: {
      enabled: false
    },
    breadcrumbs: {
      enabled: true,
      homeLabel: 'Home',
      separator: '›',
      showCurrent: true
    }
  }
};

// ==========================================================================
// PAGE-SPECIFIC METADATA TEMPLATES
// These are fallbacks - prefer using seo-config.json files in each page folder
// ==========================================================================
export const pageMetadata = {
  home: {
    title: 'Modern Marketing Website Solutions',
    description: 'Build high-converting marketing websites with our Next.js boilerplate. Professional templates, SEO optimization, and modern design patterns included.',
    keywords: ['marketing website', 'nextjs boilerplate', 'web development', 'conversion optimization', 'landing pages', 'SEO'],
  },
  about: {
    title: 'About Us',
    description: 'Learn more about our company, mission, and the team behind our success.',
    keywords: ['about', 'company', 'team', 'mission'],
  },
  services: {
    title: 'Our Services',
    description: 'Explore our comprehensive range of services designed to help you succeed.',
    keywords: ['services', 'solutions', 'offerings'],
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with our team. We are here to help answer your questions.',
    keywords: ['contact', 'support', 'help', 'reach us'],
  },
  blog: {
    title: 'Blog',
    description: 'Read our latest articles, tutorials, insights, and industry updates.',
    keywords: ['blog', 'articles', 'tutorials', 'insights', 'news'],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Learn how we collect, use, and protect your personal information.',
    keywords: ['privacy', 'data protection', 'personal information'],
  },
  terms: {
    title: 'Terms of Service',
    description: 'Review the terms and conditions that govern your use of our services.',
    keywords: ['terms', 'conditions', 'legal', 'agreement'],
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'Understand how we use cookies and similar technologies on our website.',
    keywords: ['cookies', 'tracking', 'privacy'],
  },
};

export default seoConfig;
