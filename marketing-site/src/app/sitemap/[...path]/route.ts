import { 
  handleSitemapIndex,
  handlePagesSitemap,
  handleBlogPostsSitemap,
  handleBlogCategoriesSitemap,
} from '@/seo/routes/sitemap-handlers';

/**
 * Centralized Sitemap Route Handler
 * 
 * This route handles all sitemap requests within the /sitemap directory:
 * - /sitemap/sitemap.xml -> sitemap index
 * - /sitemap/sitemap-pages.xml -> pages sitemap
 * - /sitemap/sitemap-blog-posts.xml -> blog posts sitemap
 * - /sitemap/sitemap-blog-categories.xml -> blog categories sitemap
 * 
 * ALL sitemap functionality is contained within the /sitemap directory!
 */

type SitemapParams = {
  path: string[];
};

export async function GET(
  request: Request,
  { params }: { params: Promise<SitemapParams> }
): Promise<Response> {
  const resolvedParams = await params;
  const sitemapPath = resolvedParams.path.join('/');

  // Handle different sitemap types with clean URLs
  switch (sitemapPath) {
    case 'pages':
      return handlePagesSitemap(request);
      
    case 'blog-posts':
      return handleBlogPostsSitemap(request);
      
    case 'blog-categories':
      return handleBlogCategoriesSitemap(request);
      
    default:
      return new Response('Sitemap not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
  }
}