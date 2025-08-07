// Blog Utilities for loading and parsing JSON blog posts

import fs from 'fs';
import path from 'path';
import { BlogPost, BlogCategory } from './blog-types';

// Load category metadata from .config.json file
function loadCategoryMetadata(categoryPath: string, slug: string): BlogCategory {
  const configPath = path.join(categoryPath, '.config.json');
  
  if (fs.existsSync(configPath)) {
    try {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return {
        slug,
        name: configData.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
        description: configData.description || `Articles and posts in the ${slug} category`
      };
    } catch (error) {
      console.warn(`Error loading category config for ${slug}:`, error);
    }
  }
  
  // Fallback to auto-generated metadata if no config file
  return {
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    description: `Articles and posts in the ${slug} category`
  };
}

// Load categories from individual .config.json files
export function loadCategories(): BlogCategory[] {
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
  const categoriesDir = path.join(blogContentDir, 'categories');
  
  if (!fs.existsSync(categoriesDir)) {
    return [];
  }

  const categories: BlogCategory[] = [];
  const categoryFolders = fs.readdirSync(categoriesDir);

  for (const folder of categoryFolders) {
    const categoryPath = path.join(categoriesDir, folder);
    const stat = fs.statSync(categoryPath);
    
    if (stat.isDirectory()) {
      // Count posts in this category (excluding .config.json)
      const posts = fs.readdirSync(categoryPath).filter(file => 
        file.endsWith('.json') && !file.startsWith('.')
      );
      const postCount = posts.length;
      
      if (postCount > 0) {
        categories.push(loadCategoryMetadata(categoryPath, folder));
      }
    }
  }

  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

// Load ALL categories (including empty ones) - useful for admin dashboard
export function loadAllCategories(): BlogCategory[] {
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
  const categoriesDir = path.join(blogContentDir, 'categories');
  
  if (!fs.existsSync(categoriesDir)) {
    return [];
  }

  const categories: BlogCategory[] = [];
  const categoryFolders = fs.readdirSync(categoriesDir);

  for (const folder of categoryFolders) {
    const categoryPath = path.join(categoriesDir, folder);
    const stat = fs.statSync(categoryPath);
    
    if (stat.isDirectory()) {
      categories.push(loadCategoryMetadata(categoryPath, folder));
    }
  }

  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

// Load all blog posts
export function loadBlogPosts(): BlogPost[] {
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
  const posts: BlogPost[] = [];

  if (!fs.existsSync(blogContentDir)) {
    return posts;
  }

  // Load posts from categories
  const categoriesDir = path.join(blogContentDir, 'categories');
  if (fs.existsSync(categoriesDir)) {
    const categories = fs.readdirSync(categoriesDir);
    
    for (const category of categories) {
      const categoryPath = path.join(categoriesDir, category);
      const stat = fs.statSync(categoryPath);
      
      if (stat.isDirectory()) {
        const postFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.json'));
        
        for (const postFile of postFiles) {
          // Skip config files
          if (postFile.startsWith('.')) continue;
          
          try {
            const postPath = path.join(categoryPath, postFile);
            const postData = JSON.parse(fs.readFileSync(postPath, 'utf-8'));
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
  }

  // Load root-level posts (no category)
  const rootFiles = fs.readdirSync(blogContentDir).filter(file => 
    file.endsWith('.json') && file !== 'categories.json'
  );
  
  for (const file of rootFiles) {
    try {
      const postPath = path.join(blogContentDir, file);
      const postData = JSON.parse(fs.readFileSync(postPath, 'utf-8'));
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

  return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

// Load posts by category
export function loadPostsByCategory(categorySlug: string): BlogPost[] {
  const allPosts = loadBlogPosts();
  return allPosts.filter(post => post.category === categorySlug);
}

// Load a single post
export function loadPost(slug: string, category?: string): BlogPost | null {
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
  
  // If category is specified, look in that category folder
  if (category) {
    const categoryPath = path.join(blogContentDir, 'categories', category);
    const postPath = path.join(categoryPath, `${slug}.json`);
    
    if (fs.existsSync(postPath)) {
      try {
        const postData = JSON.parse(fs.readFileSync(postPath, 'utf-8'));
        return {
          ...postData,
          slug,
          category,
          readingTime: calculateReadingTime(postData.content)
        };
      } catch (error) {
        console.error(`Error loading post ${slug} in category ${category}:`, error);
      }
    }
  }
  
  // Look in root directory
  const rootPostPath = path.join(blogContentDir, `${slug}.json`);
  if (fs.existsSync(rootPostPath)) {
    try {
      const postData = JSON.parse(fs.readFileSync(rootPostPath, 'utf-8'));
      return {
        ...postData,
        slug,
        readingTime: calculateReadingTime(postData.content)
      };
    } catch (error) {
      console.error(`Error loading root post ${slug}:`, error);
    }
  }
  
  // If no category specified, search all categories
  const categoriesDir = path.join(blogContentDir, 'categories');
  if (fs.existsSync(categoriesDir)) {
    const categories = fs.readdirSync(categoriesDir);
    
    for (const cat of categories) {
      const categoryPath = path.join(categoriesDir, cat);
      const stat = fs.statSync(categoryPath);
      
      if (stat.isDirectory()) {
        const postPath = path.join(categoryPath, `${slug}.json`);
        // Skip SEO config files
        if (slug === 'seo-config') continue;
        
        if (fs.existsSync(postPath)) {
          try {
            const postData = JSON.parse(fs.readFileSync(postPath, 'utf-8'));
            return {
              ...postData,
              slug,
              category: cat,
              readingTime: calculateReadingTime(postData.content)
            };
          } catch (error) {
            console.error(`Error loading post ${slug} in category ${cat}:`, error);
          }
        }
      }
    }
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
export function getRelatedPosts(currentPost: BlogPost, limit: number = 3): BlogPost[] {
  const allPosts = loadBlogPosts();
  
  return allPosts
    .filter(post => 
      post.slug !== currentPost.slug && 
      (post.category === currentPost.category || 
       post.tags?.some(tag => currentPost.tags?.includes(tag)))
    )
    .slice(0, limit);
}