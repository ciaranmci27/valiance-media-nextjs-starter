// Blog Post Type Definitions

export interface BlogPost {
  // Required fields
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  
  // Author information
  author: {
    name: string;
    image?: string;
    bio?: string;
  };
  
  // Optional fields
  category?: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
  readingTime?: number;
  featured?: boolean;
  draft?: boolean;
  excludeFromSearch?: boolean; // Exclude from search engines and sitemap
  
  // SEO fields
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
  };
}

export interface BlogCategory {
  slug: string;
  name: string;
  description?: string;
  image?: string;
}

export interface BlogListingProps {
  posts: BlogPost[];
  category?: BlogCategory;
}