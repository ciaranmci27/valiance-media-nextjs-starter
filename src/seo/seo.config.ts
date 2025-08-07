/**
 * SEO Configuration
 * 
 * This file contains all the default SEO settings for your marketing website.
 * Update these values to match your brand and business.
 */

export const seoConfig = {
  // Basic Information
  siteName: 'Your Company Name',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  
  // Company Information
  company: {
    name: 'Your Company',
    legalName: 'Your Company LLC',
    foundingDate: '',
    email: 'info@example.com',
    phone: '', // Optional: Add your phone number
    address: {
      streetAddress: '', // Optional: Add your street address
      addressLocality: '', // Optional: Add your city
      addressRegion: '', // Optional: Add your state/region
      postalCode: '', // Optional: Add your postal code
      addressCountry: '' // Optional: Add your country code (e.g., US)
    }
  },

  // Default SEO Settings
  defaultTitle: 'Welcome to Your Company - Your Tagline Here',
  titleTemplate: '%s | Your Company',
  defaultDescription: 'Describe your company and what makes it unique. This description will appear in search results.',
  defaultKeywords: [
    'keyword1',
    'keyword2',
    'keyword3'
  ],

  // Open Graph Defaults
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Your Company Name',
    defaultImage: '/images/og-image.jpg', // Create this image at 1200x630px
    imageWidth: 1200,
    imageHeight: 630,
  },

  // Social Media Links (Optional - leave empty if not applicable)
  social: {
    twitter: '',
    linkedin: '',
    github: '',
    instagram: '',
    facebook: '',
    youtube: '',
  },

  // Additional SEO Settings
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION || '',
    pinterest: process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION || '',
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
    facebookPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',
    hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
    clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || '',
  },

  // Robots Configuration
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
      'max-snippet': -1,
    },
  },

  // Language and Region
  alternates: {
    canonical: 'https://valiancemedia.com',
    languages: {
      'en-US': 'https://valiancemedia.com',
      // Add more language versions as needed
      // 'es-ES': 'https://es.valiancemedia.com',
    },
  },

  // Sitemap Configuration
  sitemap: {
    // Pages to exclude from sitemap
    excludedPages: [
      '/admin',
      '/dashboard',
      '/api',
      '/test',
      '/dev',
      // Add any internal or development pages here
    ],
    // Blog posts with these patterns in filename will be excluded
    excludedBlogPatterns: [
      'example',
      'test',
      'demo',
      'sample',
    ],
    // Change frequencies for different content types
    changeFrequency: {
      homepage: 'weekly',
      pages: 'monthly',
      blog: 'weekly',
      categories: 'monthly',
    },
    // Priorities for different content types
    priority: {
      homepage: 1.0,
      mainPages: 0.8,
      blog: 0.6,
      categories: 0.7,
    },
  },
};

// Page-specific metadata templates
export const pageMetadata = {
  home: {
    title: 'Home',
    description: 'Welcome to Valiance Media - We create innovative in-house software solutions and e-commerce brands that drive growth.',
    keywords: ['Valiance Media', 'software company', 'e-commerce solutions', 'digital innovation'],
  },
  about: {
    title: 'About Us',
    description: 'Learn about Valiance Media LLC, our mission to create innovative digital products, and our commitment to excellence.',
    keywords: ['about Valiance Media', 'company history', 'our mission', 'team'],
  },
  services: {
    title: 'Our Services',
    description: 'Explore our range of in-house software solutions and e-commerce brands designed to accelerate your business growth.',
    keywords: ['services', 'software solutions', 'e-commerce', 'digital products'],
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Valiance Media. We\'re here to help you with your digital transformation journey.',
    keywords: ['contact', 'get in touch', 'support', 'Valiance Media contact'],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Valiance Media\'s privacy policy - Learn how we collect, use, and protect your personal information.',
    keywords: ['privacy policy', 'data protection', 'GDPR', 'privacy'],
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms and conditions for using Valiance Media\'s services and products.',
    keywords: ['terms of service', 'terms and conditions', 'legal', 'agreement'],
  },
};

export default seoConfig;