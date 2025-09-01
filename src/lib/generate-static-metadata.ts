import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { seoConfig } from '@/seo/seo.config';

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
        title: seoConfig.siteName,
        description: `Welcome to ${seoConfig.siteName}`,
      };
    }
    
    // Read and parse the SEO config
    const seoConfigContent = fs.readFileSync(seoConfigPath, 'utf-8');
    const pageConfig = JSON.parse(seoConfigContent);
    
    // Extract SEO data
    const { seo, metadata: pageMeta } = pageConfig;
    
    // Determine OG image - use page-specific or fall back to global default
    const ogImageUrl = seo?.ogImage || seoConfig.openGraph.defaultImage;
    const fullOgImageUrl = ogImageUrl?.startsWith('http') 
      ? ogImageUrl 
      : `${seoConfig.siteUrl}${ogImageUrl}`;
    
    return {
      title: seo?.title || seoConfig.siteName,
      description: seo?.description || `Welcome to ${seoConfig.siteName}`,
      keywords: seo?.keywords || [],
      authors: pageMeta?.author ? [{ name: pageMeta.author }] : undefined,
      openGraph: {
        title: seo?.title || seoConfig.siteName,
        description: seo?.description || `Welcome to ${seoConfig.siteName}`,
        type: 'website',
        locale: 'en_US',
        siteName: seoConfig.siteName,
        images: [{ 
          url: fullOgImageUrl,
          width: seoConfig.openGraph.imageWidth,
          height: seoConfig.openGraph.imageHeight
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.title || seoConfig.siteName,
        description: seo?.description || `Welcome to ${seoConfig.siteName}`,
        site: `@${seoConfig.siteName.replace(/\s+/g, '')}`,
        images: [fullOgImageUrl],
      },
      robots: {
        index: !seo?.noIndex,
        follow: !seo?.noFollow,
        googleBot: {
          index: !seo?.noIndex,
          follow: !seo?.noFollow,
        },
      },
    };
  } catch (error) {
    console.error(`Error loading metadata for ${pagePath}:`, error);
    return {
      title: seoConfig.siteName,
      description: `Welcome to ${seoConfig.siteName}`,
    };
  }
}