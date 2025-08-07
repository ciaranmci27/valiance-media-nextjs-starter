import { seoConfig, pageMetadata } from '@/seo/seo.config';

export interface SEOConfigData {
  siteName: string;
  siteUrl: string;
  company: {
    name: string;
    legalName: string;
    foundingDate: string;
    email: string;
    phone: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  };
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  openGraph: {
    type: string;
    locale: string;
    siteName: string;
    defaultImage: string;
    imageWidth: number;
    imageHeight: number;
  };
  twitter?: {
    handle: string;
    site: string;
    cardType: string;
  };
  social: {
    twitter: string;
    linkedin: string;
    github: string;
    instagram: string;
    facebook: string;
    youtube: string;
  };
  verification: {
    google: string;
    bing: string;
    yandex: string;
    pinterest: string;
  };
  analytics: {
    googleAnalyticsId: string;
    facebookPixelId: string;
    hotjarId: string;
    clarityId: string;
  };
  robots: {
    index: boolean;
    follow: boolean;
    nocache: boolean;
    googleBot: {
      index: boolean;
      follow: boolean;
      noimageindex: boolean;
      'max-video-preview': number;
      'max-image-preview': string;
      'max-snippet': number;
    };
  };
  alternates: {
    canonical: string;
    languages: Record<string, string>;
  };
  sitemap: {
    excludedPages: string[];
    excludedBlogPatterns: string[];
    changeFrequency: {
      homepage: string;
      pages: string;
      blog: string;
      categories: string;
    };
    priority: {
      homepage: number;
      mainPages: number;
      blog: number;
      categories: number;
    };
  };
}

export function getCurrentConfig(): { config: SEOConfigData } {
  // Return the current configuration from the imported module
  // Add default twitter config for backward compatibility
  const configWithDefaults = {
    ...seoConfig,
    twitter: {
      handle: '',
      site: '',
      cardType: 'summary_large_image'
    }
  };
  return {
    config: configWithDefaults as SEOConfigData
  };
}

export function formatConfigForFile(config: SEOConfigData): string {
  // Helper function to check if a value is empty
  const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') {
      // Check if all values in object are empty
      return Object.values(value).every(v => isEmpty(v));
    }
    return false;
  };

  // Helper function to filter out empty fields from an object
  const filterEmptyFields = (obj: any): any => {
    const filtered: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!isEmpty(value)) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const filteredNested = filterEmptyFields(value);
          if (Object.keys(filteredNested).length > 0) {
            filtered[key] = filteredNested;
          }
        } else {
          filtered[key] = value;
        }
      }
    }
    return filtered;
  };

  const formatValue = (value: any, path: string = ''): string => {
    if (value === null || value === undefined) {
      return "''";
    }
    
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "\\'")}'`;
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      if (typeof value[0] === 'string') {
        return `[\n    ${value.map(v => `'${v.replace(/'/g, "\\'")}'`).join(',\n    ')}\n  ]`;
      }
      return `[${value.join(', ')}]`;
    }
    
    return 'null';
  };

  const formatObject = (obj: any, indent: number = 1): string => {
    const spaces = '  '.repeat(indent);
    const entries: string[] = [];
    
    // Filter out empty values at the top level
    const filteredObj = indent === 1 ? filterEmptyFields(obj) : obj;

    for (const [key, value] of Object.entries(filteredObj)) {
      // Skip empty values
      if (isEmpty(value)) continue;
      // Skip twitter config as it's now in Social Media
      if (key === 'twitter' && indent === 1) continue;
      let formattedValue: string;
      
      // Handle special cases with environment variables
      if (key === 'siteUrl' && indent === 1) {
        formattedValue = `process.env.NEXT_PUBLIC_SITE_URL || '${value}'`;
      } else if (key === 'verification' && indent === 1) {
        const verificationEntries: string[] = [];
        for (const [vKey, vValue] of Object.entries(value as any)) {
          if (!isEmpty(vValue)) {
            verificationEntries.push(`    ${vKey}: process.env.NEXT_PUBLIC_${vKey.toUpperCase()}_SITE_VERIFICATION || '${vValue}'`);
          }
        }
        if (verificationEntries.length > 0) {
          formattedValue = `{\n${verificationEntries.join(',\n')}\n  }`;
        } else {
          continue; // Skip if no verification entries
        }
      } else if (key === 'analytics' && indent === 1) {
        const analyticsEntries: string[] = [];
        const analyticsEnvMap: Record<string, string> = {
          googleAnalyticsId: 'GA_ID',
          facebookPixelId: 'FB_PIXEL_ID',
          hotjarId: 'HOTJAR_ID',
          clarityId: 'CLARITY_ID'
        };
        for (const [aKey, aValue] of Object.entries(value as any)) {
          if (!isEmpty(aValue)) {
            const envKey = analyticsEnvMap[aKey] || aKey.toUpperCase();
            analyticsEntries.push(`    ${aKey}: process.env.NEXT_PUBLIC_${envKey} || '${aValue}'`);
          }
        }
        if (analyticsEntries.length > 0) {
          formattedValue = `{\n${analyticsEntries.join(',\n')}\n  }`;
        } else {
          continue; // Skip if no analytics entries
        }
      } else if (key === 'social' && indent === 1) {
        // Filter out empty social links
        const socialEntries: string[] = [];
        for (const [sKey, sValue] of Object.entries(value as any)) {
          if (!isEmpty(sValue)) {
            socialEntries.push(`${spaces}  ${sKey}: '${sValue}'`);
          }
        }
        if (socialEntries.length > 0) {
          formattedValue = `{\n${socialEntries.join(',\n')}\n  }`;
        } else {
          continue; // Skip if no social entries
        }
      } else if (key === 'company' && indent === 1) {
        // Special handling for company to exclude empty address
        const companyData = { ...(value as any) } as any;
        if (companyData.address && isEmpty(filterEmptyFields(companyData.address))) {
          delete companyData.address;
        }
        // Filter out other empty fields in company
        const filteredCompany = filterEmptyFields(companyData);
        if (Object.keys(filteredCompany).length > 0) {
          formattedValue = formatObject(filteredCompany, indent + 1);
        } else {
          continue;
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const filteredNested = filterEmptyFields(value);
        if (Object.keys(filteredNested).length > 0) {
          formattedValue = formatObject(filteredNested, indent + 1);
        } else {
          continue; // Skip empty objects
        }
      } else {
        formattedValue = formatValue(value);
      }

      // Handle keys with special characters
      const keyStr = key.includes('-') || key.includes(' ') ? `'${key}'` : key;
      entries.push(`${spaces}${keyStr}: ${formattedValue}`);
    }

    return `{\n${entries.join(',\n')}\n${' '.repeat((indent - 1) * 2)}}`;
  };

  return `/**
 * SEO Configuration
 * 
 * This file contains all the default SEO settings for your marketing website.
 * Update these values to match your brand and business.
 */

export const seoConfig = ${formatObject(config)};

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
`;
}