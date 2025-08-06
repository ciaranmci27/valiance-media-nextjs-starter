import { MetadataRoute } from 'next';
import { seoConfig } from './seo.config';

/**
 * Generate sitemap for the website
 * This file automatically generates a sitemap.xml at /sitemap.xml
 * 
 * Add your dynamic routes here as your site grows.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = seoConfig.siteUrl;
  
  // Static routes - add your pages here
  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/contact',
    '/privacy',
    '/terms-of-service',
  ];

  const staticPages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes example (uncomment and modify as needed)
  // const products = await getProducts(); // Your data fetching function
  // const productPages = products.map((product) => ({
  //   url: `${baseUrl}/products/${product.slug}`,
  //   lastModified: product.updatedAt,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }));

  // const blogPosts = await getBlogPosts(); // Your data fetching function
  // const blogPages = blogPosts.map((post) => ({
  //   url: `${baseUrl}/blog/${post.slug}`,
  //   lastModified: post.updatedAt,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }));

  return [
    ...staticPages,
    // ...productPages,
    // ...blogPages,
  ];
}