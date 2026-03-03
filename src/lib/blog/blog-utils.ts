// Blog Utilities for loading and parsing JSON blog posts

import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';
import { BlogPost, BlogCategory } from './blog-types';

// Load category metadata from .config.json file
async function loadCategoryMetadata(categoryPath: string, slug: string): Promise<BlogCategory> {
  const configPath = path.join(categoryPath, '.config.json');

  try {
    const configData = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    return {
      slug,
      name: configData.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      description: configData.description || `Articles and posts in the ${slug} category`
    };
  } catch {
    // Fallback to auto-generated metadata if no config file or read error
    return {
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      description: `Articles and posts in the ${slug} category`
    };
  }
}

// Load categories from individual .config.json files
export async function loadCategories(): Promise<BlogCategory[]> {
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
  const categoriesDir = path.join(blogContentDir, 'categories');

  try {
    await fs.access(categoriesDir);
  } catch {
    return [];
  }

  const categories: BlogCategory[] = [];
  const categoryFolders = await fs.readdir(categoriesDir);

  for (const folder of categoryFolders) {
    const categoryPath = path.join(categoriesDir, folder);
    const stat = await fs.stat(categoryPath);

    if (stat.isDirectory()) {
      // Count posts in this category (excluding .config.json)
      const posts = (await fs.readdir(categoryPath)).filter(file =>
        file.endsWith('.json') && !file.startsWith('.')
      );
      const postCount = posts.length;

      if (postCount > 0) {
        categories.push(await loadCategoryMetadata(categoryPath, folder));
      }
    }
  }

  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

// Load ALL categories (including empty ones) - useful for admin dashboard
export async function loadAllCategories(): Promise<BlogCategory[]> {
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
  const categoriesDir = path.join(blogContentDir, 'categories');

  try {
    await fs.access(categoriesDir);
  } catch {
    return [];
  }

  const categories: BlogCategory[] = [];
  const categoryFolders = await fs.readdir(categoriesDir);

  for (const folder of categoryFolders) {
    const categoryPath = path.join(categoriesDir, folder);
    const stat = await fs.stat(categoryPath);

    if (stat.isDirectory()) {
      categories.push(await loadCategoryMetadata(categoryPath, folder));
    }
  }

  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

// Load all blog posts
export async function loadBlogPosts(): Promise<BlogPost[]> {
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
  const posts: BlogPost[] = [];

  try {
    await fs.access(blogContentDir);
  } catch {
    return posts;
  }

  // Load posts from categories
  const categoriesDir = path.join(blogContentDir, 'categories');
  try {
    await fs.access(categoriesDir);
    const categories = await fs.readdir(categoriesDir);

    for (const category of categories) {
      const categoryPath = path.join(categoriesDir, category);
      const stat = await fs.stat(categoryPath);

      if (stat.isDirectory()) {
        const postFiles = (await fs.readdir(categoryPath)).filter(file => file.endsWith('.json'));

        for (const postFile of postFiles) {
          // Skip config files
          if (postFile.startsWith('.')) continue;

          try {
            const postPath = path.join(categoryPath, postFile);
            const postData = JSON.parse(await fs.readFile(postPath, 'utf-8'));
            const slug = postFile.replace('.json', '');

            posts.push({
              ...postData,
              slug,
              category,
              readingTime: calculateReadingTime(postData.content)
            });
          } catch (error) {
            console.error(`Error loading post ${postFile}:`, error);
          }
        }
      }
    }
  } catch {
    // No categories directory
  }

  // Load root-level posts (no category)
  try {
    const rootFiles = (await fs.readdir(blogContentDir)).filter(file =>
      file.endsWith('.json') && file !== 'categories.json'
    );

    for (const file of rootFiles) {
      try {
        const postPath = path.join(blogContentDir, file);
        const postData = JSON.parse(await fs.readFile(postPath, 'utf-8'));
        const slug = file.replace('.json', '');

        posts.push({
          ...postData,
          slug,
          readingTime: calculateReadingTime(postData.content)
        });
      } catch (error) {
        console.error(`Error loading root post ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading root blog directory:', error);
  }

  return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

// Load posts by category
export async function loadPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const allPosts = await loadBlogPosts();
  return allPosts.filter(post => post.category === categorySlug);
}

// Load a single post
export async function loadPost(slug: string, category?: string): Promise<BlogPost | null> {
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');

  // If category is specified, look in that category folder
  if (category) {
    const categoryPath = path.join(blogContentDir, 'categories', category);
    const postPath = path.join(categoryPath, `${slug}.json`);

    try {
      const postData = JSON.parse(await fs.readFile(postPath, 'utf-8'));
      return {
        ...postData,
        slug,
        category,
        readingTime: calculateReadingTime(postData.content)
      };
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        console.error(`Error loading post ${slug} in category ${category}:`, error);
      }
    }
  }

  // Look in root directory
  const rootPostPath = path.join(blogContentDir, `${slug}.json`);
  try {
    const postData = JSON.parse(await fs.readFile(rootPostPath, 'utf-8'));
    return {
      ...postData,
      slug,
      readingTime: calculateReadingTime(postData.content)
    };
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      console.error(`Error loading root post ${slug}:`, error);
    }
  }

  // If no category specified, search all categories
  const categoriesDir = path.join(blogContentDir, 'categories');
  try {
    const categories = await fs.readdir(categoriesDir);

    for (const cat of categories) {
      const categoryPath = path.join(categoriesDir, cat);
      const stat = await fs.stat(categoryPath);

      if (stat.isDirectory()) {
        // Skip SEO config files
        if (slug === 'seo-config') continue;

        const postPath = path.join(categoryPath, `${slug}.json`);
        try {
          const postData = JSON.parse(await fs.readFile(postPath, 'utf-8'));
          return {
            ...postData,
            slug,
            category: cat,
            readingTime: calculateReadingTime(postData.content)
          };
        } catch (error: any) {
          if (error?.code !== 'ENOENT') {
            console.error(`Error loading post ${slug} in category ${cat}:`, error);
          }
        }
      }
    }
  } catch {
    // No categories directory
  }

  return null;
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Get related posts
export async function getRelatedPosts(currentPost: BlogPost, limit: number = 3): Promise<BlogPost[]> {
  const allPosts = await loadBlogPosts();

  return allPosts
    .filter(post =>
      post.slug !== currentPost.slug &&
      (post.category === currentPost.category ||
       post.tags?.some(tag => currentPost.tags?.includes(tag)))
    )
    .slice(0, limit);
}

// React.cache() wrappers for request-level deduplication
// These ensure the same data is loaded only once per server render pass
export const cachedLoadBlogPosts = cache(loadBlogPosts);
export const cachedLoadCategories = cache(loadCategories);
export const cachedLoadPost = cache(loadPost);
export const cachedGetRelatedPosts = cache(getRelatedPosts);
