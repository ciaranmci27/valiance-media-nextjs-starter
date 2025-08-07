// GitHub-based blog utilities for production environments
// Fetches blog content directly from GitHub repository without needing deployments

import { BlogPost, BlogCategory } from './blog-types';

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
}

// Cache for GitHub API responses (5 minutes)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchFromGitHub(path: string): Promise<any> {
  const cacheKey = path;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  // Use data branch for blog content
  const branch = process.env.GITHUB_DATA_BRANCH || 'blog-data';

  if (!token || !owner || !repo) {
    throw new Error('GitHub configuration missing');
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
    next: { revalidate: 60 } // Next.js cache for 1 minute
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

async function fetchFileContent(path: string): Promise<string | null> {
  const fileInfo = await fetchFromGitHub(path);
  if (!fileInfo || !fileInfo.download_url) return null;

  const response = await fetch(fileInfo.download_url, {
    next: { revalidate: 60 }
  });
  
  if (!response.ok) return null;
  return response.text();
}

// Load category metadata from GitHub
async function loadCategoryMetadataFromGitHub(categorySlug: string): Promise<BlogCategory> {
  const configPath = `blog-content/categories/${categorySlug}/.config.json`;
  const content = await fetchFileContent(configPath);
  
  if (content) {
    try {
      const configData = JSON.parse(content);
      return {
        slug: categorySlug,
        name: configData.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' '),
        description: configData.description || `Articles and posts in the ${categorySlug} category`
      };
    } catch (error) {
      console.warn(`Error parsing category config for ${categorySlug}:`, error);
    }
  }
  
  return {
    slug: categorySlug,
    name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' '),
    description: `Articles and posts in the ${categorySlug} category`
  };
}

// Load categories from GitHub
export async function loadCategoriesFromGitHub(): Promise<BlogCategory[]> {
  try {
    const categoriesData = await fetchFromGitHub('blog-content/categories');
    if (!categoriesData || !Array.isArray(categoriesData)) return [];

    const categories: BlogCategory[] = [];
    
    for (const item of categoriesData) {
      if (item.type === 'dir') {
        // Check if category has posts
        const categoryContents = await fetchFromGitHub(item.path);
        if (Array.isArray(categoryContents)) {
          const posts = categoryContents.filter((file: GitHubFile) => 
            file.name.endsWith('.json') && !file.name.startsWith('.')
          );
          
          if (posts.length > 0) {
            const metadata = await loadCategoryMetadataFromGitHub(item.name);
            categories.push(metadata);
          }
        }
      }
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error loading categories from GitHub:', error);
    return [];
  }
}

// Load all blog posts from GitHub
export async function loadBlogPostsFromGitHub(): Promise<BlogPost[]> {
  try {
    const posts: BlogPost[] = [];

    // Load posts from categories
    const categoriesData = await fetchFromGitHub('blog-content/categories');
    if (categoriesData && Array.isArray(categoriesData)) {
      for (const category of categoriesData) {
        if (category.type === 'dir') {
          const categoryContents = await fetchFromGitHub(category.path);
          if (Array.isArray(categoryContents)) {
            for (const file of categoryContents) {
              if (file.name.endsWith('.json') && !file.name.startsWith('.')) {
                const content = await fetchFileContent(file.path);
                if (content) {
                  try {
                    const postData = JSON.parse(content);
                    const slug = file.name.replace('.json', '');
                    posts.push({
                      ...postData,
                      slug,
                      category: category.name,
                      readingTime: calculateReadingTime(postData.content)
                    });
                  } catch (error) {
                    console.error(`Error parsing post ${file.name}:`, error);
                  }
                }
              }
            }
          }
        }
      }
    }

    // Load root-level posts
    const rootContents = await fetchFromGitHub('blog-content');
    if (rootContents && Array.isArray(rootContents)) {
      for (const file of rootContents) {
        if (file.type === 'file' && file.name.endsWith('.json') && file.name !== 'categories.json') {
          const content = await fetchFileContent(file.path);
          if (content) {
            try {
              const postData = JSON.parse(content);
              const slug = file.name.replace('.json', '');
              posts.push({
                ...postData,
                slug,
                readingTime: calculateReadingTime(postData.content)
              });
            } catch (error) {
              console.error(`Error parsing root post ${file.name}:`, error);
            }
          }
        }
      }
    }

    return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (error) {
    console.error('Error loading blog posts from GitHub:', error);
    return [];
  }
}

// Load a single post from GitHub
export async function loadPostFromGitHub(slug: string, category?: string): Promise<BlogPost | null> {
  try {
    let postPath: string;
    
    if (category) {
      postPath = `blog-content/categories/${category}/${slug}.json`;
    } else {
      // Try root first
      postPath = `blog-content/${slug}.json`;
    }

    let content = await fetchFileContent(postPath);
    
    // If not found and no category specified, search all categories
    if (!content && !category) {
      const categoriesData = await fetchFromGitHub('blog-content/categories');
      if (categoriesData && Array.isArray(categoriesData)) {
        for (const cat of categoriesData) {
          if (cat.type === 'dir') {
            const categoryPostPath = `blog-content/categories/${cat.name}/${slug}.json`;
            content = await fetchFileContent(categoryPostPath);
            if (content) {
              category = cat.name;
              break;
            }
          }
        }
      }
    }

    if (!content) return null;

    const postData = JSON.parse(content);
    return {
      ...postData,
      slug,
      category,
      readingTime: calculateReadingTime(postData.content)
    };
  } catch (error) {
    console.error(`Error loading post ${slug} from GitHub:`, error);
    return null;
  }
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Get related posts from GitHub
export async function getRelatedPostsFromGitHub(currentPost: BlogPost, limit: number = 3): Promise<BlogPost[]> {
  const allPosts = await loadBlogPostsFromGitHub();
  
  return allPosts
    .filter(post => 
      post.slug !== currentPost.slug && 
      (post.category === currentPost.category || 
       post.tags?.some(tag => currentPost.tags?.includes(tag)))
    )
    .slice(0, limit);
}

// Clear cache (useful after updates)
export function clearGitHubCache() {
  cache.clear();
}