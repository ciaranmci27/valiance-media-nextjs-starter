import { Octokit } from '@octokit/rest';

interface GitHubConfig {
  owner: string;
  repo: string;
  branch?: string;
  dataBranch?: string; // Separate branch for blog data
  token: string;
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category?: string;
  tags?: string[];
  author?: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  featured?: boolean;
  draft?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
  };
  readingTime?: number;
  updatedAt?: string;
}

/**
 * GitHub CMS that uses a separate branch for blog data
 * This prevents Vercel from auto-deploying on content changes
 */
export class GitHubCMSDataBranch {
  private octokit: Octokit;
  private config: Required<GitHubConfig>;

  constructor(config: GitHubConfig) {
    this.config = {
      ...config,
      branch: config.branch || 'main',
      dataBranch: config.dataBranch || 'blog-data' // Separate branch for content
    };
    
    this.octokit = new Octokit({
      auth: config.token
    });
  }

  /**
   * Ensure the data branch exists
   */
  async ensureDataBranch(): Promise<void> {
    try {
      // Check if branch exists
      await this.octokit.repos.getBranch({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: this.config.dataBranch
      });
    } catch (error: any) {
      if (error.status === 404) {
        // Branch doesn't exist, create it from main
        try {
          // Get the main branch reference
          const { data: mainRef } = await this.octokit.git.getRef({
            owner: this.config.owner,
            repo: this.config.repo,
            ref: `heads/${this.config.branch}`
          });

          // Create the new branch
          await this.octokit.git.createRef({
            owner: this.config.owner,
            repo: this.config.repo,
            ref: `refs/heads/${this.config.dataBranch}`,
            sha: mainRef.object.sha
          });

          console.log(`Created data branch: ${this.config.dataBranch}`);
        } catch (createError) {
          console.error('Error creating data branch:', createError);
          throw new Error('Failed to create data branch');
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Create or update a blog post in the data branch
   */
  async savePost(post: BlogPost): Promise<void> {
    await this.ensureDataBranch();
    
    // Determine path based on category
    const path = post.category 
      ? `blog-content/categories/${post.category}/${post.slug}.json`
      : `blog-content/${post.slug}.json`;
    
    const content = JSON.stringify(post, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');

    try {
      // Try to get existing file (for updates)
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.dataBranch // Use data branch
      }).catch(() => ({ data: null }));

      const message = existingFile 
        ? `Update blog post: ${post.title}`
        : `Create blog post: ${post.title}`;

      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message,
        content: encodedContent,
        branch: this.config.dataBranch, // Commit to data branch
        sha: existingFile && 'sha' in existingFile ? existingFile.sha : undefined
      });
    } catch (error) {
      console.error('Error saving post to GitHub data branch:', error);
      throw new Error('Failed to save post to GitHub');
    }
  }

  /**
   * Delete a blog post from the data branch
   */
  async deletePost(slug: string, category?: string): Promise<void> {
    await this.ensureDataBranch();
    
    const path = category
      ? `blog-content/categories/${category}/${slug}.json`
      : `blog-content/${slug}.json`;

    try {
      // Get the file to get its SHA
      const { data: file } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.dataBranch // Use data branch
      });

      if ('sha' in file) {
        await this.octokit.repos.deleteFile({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
          message: `Delete blog post: ${slug}`,
          sha: file.sha,
          branch: this.config.dataBranch // Delete from data branch
        });
      }
    } catch (error) {
      console.error('Error deleting post from GitHub data branch:', error);
      throw new Error('Failed to delete post from GitHub');
    }
  }

  /**
   * Get all blog posts from the data branch
   */
  async getAllPosts(): Promise<BlogPost[]> {
    await this.ensureDataBranch();
    
    try {
      const posts: BlogPost[] = [];
      
      // Get root level posts
      try {
        const { data: rootContents } = await this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: 'blog-content',
          ref: this.config.dataBranch
        });

        if (Array.isArray(rootContents)) {
          for (const file of rootContents) {
            if (file.type === 'file' && file.name.endsWith('.json')) {
              const post = await this.getPostFromPath(file.path);
              if (post) posts.push(post);
            }
          }
        }
      } catch (error) {
        console.log('No root blog-content directory in data branch');
      }

      // Get categorized posts
      try {
        const { data: categoriesContents } = await this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: 'blog-content/categories',
          ref: this.config.dataBranch
        });

        if (Array.isArray(categoriesContents)) {
          for (const category of categoriesContents) {
            if (category.type === 'dir') {
              const { data: categoryFiles } = await this.octokit.repos.getContent({
                owner: this.config.owner,
                repo: this.config.repo,
                path: category.path,
                ref: this.config.dataBranch
              });

              if (Array.isArray(categoryFiles)) {
                for (const file of categoryFiles) {
                  if (file.type === 'file' && file.name.endsWith('.json') && !file.name.startsWith('.')) {
                    const post = await this.getPostFromPath(file.path);
                    if (post) {
                      post.category = category.name;
                      posts.push(post);
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.log('No categories directory in data branch');
      }

      return posts;
    } catch (error) {
      console.error('Error fetching posts from GitHub data branch:', error);
      return [];
    }
  }

  /**
   * Get a single blog post by slug
   */
  async getPost(slug: string, category?: string): Promise<BlogPost | null> {
    await this.ensureDataBranch();
    
    const path = category
      ? `blog-content/categories/${category}/${slug}.json`
      : `blog-content/${slug}.json`;

    return this.getPostFromPath(path);
  }

  /**
   * Helper to get post content from a path
   */
  private async getPostFromPath(path: string): Promise<BlogPost | null> {
    try {
      const { data: file } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.dataBranch
      });

      if ('content' in file) {
        const content = Buffer.from(file.content, 'base64').toString();
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Trigger a deployment (if needed)
   */
  async triggerDeployment(webhookUrl?: string): Promise<void> {
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            trigger: 'blog-update',
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Error triggering deployment:', error);
      }
    }
  }
}