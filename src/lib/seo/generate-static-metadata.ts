import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { seoConfig } from './config';
import { getLlmsSettingsSync } from './llms-settings';

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
        openGraph: {
          title: seoConfig.siteName,
          description: `Welcome to ${seoConfig.siteName}`,
          images: [{
            url: `${seoConfig.siteUrl}${seoConfig.openGraph.defaultImage}`,
            width: seoConfig.openGraph.imageWidth,
            height: seoConfig.openGraph.imageHeight
          }]
        },
        twitter: {
          card: 'summary_large_image',
          images: [`${seoConfig.siteUrl}${seoConfig.openGraph.defaultImage}`]
        }
      };
    }
    
    // Read and parse the SEO config
    const seoConfigContent = fs.readFileSync(seoConfigPath, 'utf-8');
    const pageConfig = JSON.parse(seoConfigContent);

    // Extract SEO data
    const { seo, metadata: pageMeta, slug } = pageConfig;

    // Generate canonical URL
    let canonicalUrl: string;

    if (seo?.canonical && seo.canonical.trim() !== '') {
      canonicalUrl = seo.canonical.startsWith('http')
        ? seo.canonical
        : `${seoConfig.siteUrl}${seo.canonical}`;
    } else {
      // Auto-generate from slug
      const urlPath = slug === 'home' || !slug ? '/' : `/${slug}`;
      canonicalUrl = `${seoConfig.siteUrl}${urlPath}`;
    }

    // Validate OG image exists
    let ogImageUrl = seo?.ogImage || seo?.image || seoConfig.openGraph.defaultImage;

    if (ogImageUrl && !ogImageUrl.startsWith('http')) {
      const imagePath = path.join(process.cwd(), 'public', ogImageUrl);
      if (!fs.existsSync(imagePath)) {
        console.warn(`OG image not found for ${pagePath}: ${ogImageUrl}, falling back to default`);
        ogImageUrl = seoConfig.openGraph.defaultImage;
      }
    }

    const fullOgImageUrl = ogImageUrl?.startsWith('http')
      ? ogImageUrl
      : `${seoConfig.siteUrl}${ogImageUrl}`;

    // Advertise the page's `.md` sibling for AI crawlers when the AI Search
    // feature is on and the page has not opted out. The home page uses
    // `/index.md` (a `/.md` URL would be malformed). Skip when the page is
    // noIndex or excluded from sitemap/llms — the `.md` route would 404
    // anyway, advertising a 404 misleads crawlers.
    const llmsSettings = getLlmsSettingsSync();
    const isLlmsExcluded =
      seo?.noIndex === true ||
      pageConfig.sitemap?.exclude === true ||
      pageConfig.llms?.exclude === true ||
      pageMeta?.draft === true;
    const markdownAlternate =
      llmsSettings.enabled && !isLlmsExcluded
        ? canonicalUrl.endsWith('/')
          ? `${canonicalUrl}index.md`
          : `${canonicalUrl}.md`
        : undefined;

    return {
      title: seo?.title || seoConfig.siteName,
      description: seo?.description || `Welcome to ${seoConfig.siteName}`,
      keywords: seo?.keywords || [],
      authors: pageMeta?.author ? [{ name: pageMeta.author }] : undefined,
      alternates: {
        canonical: canonicalUrl,
        ...(markdownAlternate ? { types: { 'text/markdown': markdownAlternate } } : {}),
      },
      openGraph: {
        title: seo?.title || seoConfig.siteName,
        description: seo?.description || `Welcome to ${seoConfig.siteName}`,
        type: 'website',
        locale: 'en_US',
        siteName: seoConfig.siteName,
        url: canonicalUrl,
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
        creator: seo?.twitterCreator
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
      openGraph: {
        title: seoConfig.siteName,
        description: `Welcome to ${seoConfig.siteName}`,
        images: [{
          url: `${seoConfig.siteUrl}${seoConfig.openGraph.defaultImage}`,
          width: seoConfig.openGraph.imageWidth,
          height: seoConfig.openGraph.imageHeight
        }]
      },
      twitter: {
        card: 'summary_large_image',
        images: [`${seoConfig.siteUrl}${seoConfig.openGraph.defaultImage}`]
      }
    };
  }
}