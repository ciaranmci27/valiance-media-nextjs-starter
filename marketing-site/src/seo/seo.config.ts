/**
 * SEO Configuration
 * 
 * This file contains all the default SEO settings for your marketing website.
 * Update these values to match your brand and business.
 */

export const seoConfig = {
  // Basic Information
  siteName: 'Valiance Media',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://valiancemedia.com',
  
  // Company Information
  company: {
    name: 'Valiance Media LLC',
    legalName: 'Valiance Media LLC',
    foundingDate: '2024',
    email: 'hello@valiancemedia.com',
    phone: '+1-555-0123', // Update with your actual phone
    address: {
      streetAddress: '123 Innovation Drive', // Update with your actual address
      addressLocality: 'Austin',
      addressRegion: 'TX',
      postalCode: '78701',
      addressCountry: 'US'
    }
  },

  // Default SEO Settings
  defaultTitle: 'Valiance Media - In-House Software & E-commerce Innovation',
  titleTemplate: '%s | Valiance Media',
  defaultDescription: 'Valiance Media LLC creates innovative in-house software solutions and e-commerce brands. We build digital products that drive growth and deliver exceptional user experiences.',
  defaultKeywords: [
    'software development',
    'e-commerce',
    'digital products',
    'SaaS',
    'technology innovation',
    'Valiance Media',
    'custom software',
    'digital transformation'
  ],

  // Open Graph Defaults
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Valiance Media',
    defaultImage: '/images/og-image.jpg', // Create this image at 1200x630px
    imageWidth: 1200,
    imageHeight: 630,
  },

  // Twitter/X Configuration
  twitter: {
    handle: '@valiancemedia', // Update with your actual handle
    site: '@valiancemedia',
    cardType: 'summary_large_image',
  },

  // Social Media Links
  social: {
    twitter: 'https://twitter.com/valiancemedia',
    linkedin: 'https://linkedin.com/company/valiance-media',
    github: 'https://github.com/valiance-media',
    instagram: 'https://instagram.com/valiancemedia',
    facebook: 'https://facebook.com/valiancemedia',
    youtube: 'https://youtube.com/@valiancemedia',
  },

  // Additional SEO Settings
  verification: {
    google: '', // Add your Google Search Console verification code
    bing: '', // Add your Bing Webmaster verification code
    yandex: '', // Add your Yandex verification code
    pinterest: '', // Add your Pinterest verification code
  },

  // Analytics
  analytics: {
    googleAnalyticsId: '', // Add your GA4 Measurement ID (G-XXXXXXXXXX)
    facebookPixelId: '', // Add your Facebook Pixel ID
    hotjarId: '', // Add your Hotjar ID
    clarityId: '', // Add your Microsoft Clarity ID
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