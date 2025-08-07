// Universal blog utilities that automatically choose between filesystem and GitHub
// Uses filesystem in development, GitHub API in production

import { BlogPost, BlogCategory } from './blog-types';
import * as fsUtils from './blog-utils';
import * as githubUtils from './blog-utils-github';

// Check if we should use GitHub (production with GitHub configured)
function shouldUseGitHub(): boolean {
  return (
    process.env.NODE_ENV === 'production' &&
    !!process.env.GITHUB_TOKEN &&
    !!process.env.GITHUB_OWNER &&
    !!process.env.GITHUB_REPO
  );
}

// Universal functions that automatically choose the right implementation
export async function loadCategories(): Promise<BlogCategory[]> {
  if (shouldUseGitHub()) {
    return githubUtils.loadCategoriesFromGitHub();
  }
  return Promise.resolve(fsUtils.loadCategories());
}

export async function loadAllCategories(): Promise<BlogCategory[]> {
  if (shouldUseGitHub()) {
    // GitHub version doesn't distinguish between all and visible categories
    return githubUtils.loadCategoriesFromGitHub();
  }
  return Promise.resolve(fsUtils.loadAllCategories());
}

export async function loadBlogPosts(): Promise<BlogPost[]> {
  if (shouldUseGitHub()) {
    return githubUtils.loadBlogPostsFromGitHub();
  }
  return Promise.resolve(fsUtils.loadBlogPosts());
}

export async function loadPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const allPosts = await loadBlogPosts();
  return allPosts.filter(post => post.category === categorySlug);
}

export async function loadPost(slug: string, category?: string): Promise<BlogPost | null> {
  if (shouldUseGitHub()) {
    return githubUtils.loadPostFromGitHub(slug, category);
  }
  return Promise.resolve(fsUtils.loadPost(slug, category));
}

export async function getRelatedPosts(currentPost: BlogPost, limit: number = 3): Promise<BlogPost[]> {
  if (shouldUseGitHub()) {
    return githubUtils.getRelatedPostsFromGitHub(currentPost, limit);
  }
  return Promise.resolve(fsUtils.getRelatedPosts(currentPost, limit));
}