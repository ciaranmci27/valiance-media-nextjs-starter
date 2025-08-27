import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { seoConfig as globalSeoConfig } from '@/seo/seo.config';

export function generateStaticMetadata(pagePath: string): Metadata {
  try {
    // Construct path to seo-config.json
    const seoConfigPath = path.join(
      process.cwd(),
      'src',
      'app',
      '(pages)',
      pagePath,
      'seo-config.json'
    );
    
    // Check if the SEO config exists
    if (!fs.existsSync(seoConfigPath)) {
      console.warn(`SEO config not found for page: ${pagePath}`);
      return {
        title: globalSeoConfig.siteName,
        description: `Welcome to ${globalSeoConfig.siteName}`,
      };
    }
    
    // Read and parse the SEO config
    const seoConfigContent = fs.readFileSync(seoConfigPath, 'utf-8');
    const seoConfig = JSON.parse(seoConfigContent);
    
    // Extract SEO data and build metadata
    const { seo, metadata: pageMeta } = seoConfig;
    
    return {
      title: seo?.title || globalSeoConfig.siteName,
      description: seo?.description || `Welcome to ${globalSeoConfig.siteName}`,
      keywords: seo?.keywords || [],
      authors: pageMeta?.author ? [{ name: pageMeta.author }] : undefined,
      openGraph: {
        title: seo?.title || globalSeoConfig.siteName,
        description: seo?.description || `Welcome to ${globalSeoConfig.siteName}`,
        type: 'website',
        locale: 'en_US',
        siteName: globalSeoConfig.siteName,
        images: seo?.ogImage ? [{ url: seo.ogImage }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.title || globalSeoConfig.siteName,
        description: seo?.description || `Welcome to ${globalSeoConfig.siteName}`,
        site: `@${globalSeoConfig.siteName.replace(/\s+/g, '')}`,
        images: seo?.ogImage ? [seo.ogImage] : undefined,
      },
      robots: {
        index: !seo?.noIndex,
        follow: true,
        googleBot: {
          index: !seo?.noIndex,
          follow: true,
        },
      },
    };
  } catch (error) {
    console.error(`Error loading metadata for ${pagePath}:`, error);
    return {
      title: globalSeoConfig.siteName,
      description: `Welcome to ${globalSeoConfig.siteName}`,
    };
  }
}