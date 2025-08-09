/**
 * SEO Configuration
 * 
 * This file contains all the default SEO settings for your marketing website.
 * Update these values to match your brand and business.
 */

export const seoConfig = {
  siteName: '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  company: {
    name: '',
    legalName: '',
    foundingDate: '',
    email: '',
    phone: '',
    address: {
      streetAddress: '',
      addressLocality: '',
      addressRegion: '',
      postalCode: '',
      addressCountry: ''
    }
  },
  defaultTitle: '',
  titleTemplate: '{pageName} | {siteName}',
  defaultDescription: '',
  defaultKeywords: [],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: '',
    defaultImage: '/images/og-default.jpg',
    imageWidth: 1200,
    imageHeight: 630
  },
  alternates: {
    canonical: '',
    languages: {
      'en-US': ''
    }
  },
  social: {
    twitter: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    github: ''
  },
  verification: {
    google: '',
    bing: '',
    yandex: '',
    pinterest: ''
  },
  analytics: {
    googleAnalyticsId: '',
    facebookPixelId: '',
    hotjarId: '',
    clarityId: ''
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
        disallow: ['/api/', '/admin/', '/_next/', '/private/', '*.json', '/*?*'],
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
      organization: false,
      website: false,
      localBusiness: false,
      person: false,
      breadcrumbs: false
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

// Page-specific metadata templates
export const pageMetadata = {
  home: {
    title: 'Home',
    description: 'Welcome to our website',
    keywords: [],
  },
  about: {
    title: 'About Us',
    description: 'Learn more about our company',
    keywords: [],
  },
  services: {
    title: 'Our Services',
    description: 'Explore our range of services',
    keywords: [],
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with us',
    keywords: [],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Our privacy policy and data protection practices',
    keywords: [],
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms and conditions for using our services',
    keywords: [],
  },
};

export default seoConfig;
