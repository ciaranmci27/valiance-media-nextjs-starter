import { Octokit } from '@octokit/rest';

interface GitHubConfig {
  owner: string;
  repo: string;
  branch?: string;
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
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  readingTime?: number;
}

export class GitHubCMS {
  private octokit: Octokit;
  private config: Required<GitHubConfig>;

  constructor(config: GitHubConfig) {
    this.config = {
      ...config,
      branch: config.branch || 'main'
    };
    
    this.octokit = new Octokit({
      auth: config.token
    });
  }

  /**
   * Create or update a blog post in the GitHub repository
   */
  async savePost(post: BlogPost): Promise<void> {
    const path = `public/blog-content/${post.slug}.json`;
    const content = JSON.stringify(post, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');

    try {
      // Try to get existing file (for updates)
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.branch
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
        branch: this.config.branch,
        sha: existingFile && 'sha' in existingFile ? existingFile.sha : undefined
      });
    } catch (error) {
      console.error('Error saving post to GitHub:', error);
      throw new Error('Failed to save post to GitHub');
    }
  }

  /**
   * Delete a blog post from the GitHub repository
   */
  async deletePost(slug: string): Promise<void> {
    const path = `public/blog-content/${slug}.json`;

    try {
      // Get the file to get its SHA
      const { data: file } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.branch
      });

      if ('sha' in file) {
        await this.octokit.repos.deleteFile({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
          message: `Delete blog post: ${slug}`,
          sha: file.sha,
          branch: this.config.branch
        });
      }
    } catch (error) {
      console.error('Error deleting post from GitHub:', error);
      throw new Error('Failed to delete post from GitHub');
    }
  }

  /**
   * Upload an image to the GitHub repository
   */
  async uploadImage(
    filename: string, 
    imageData: Buffer | string,
    mimeType: string
  ): Promise<string> {
    const path = `public/blog-content/images/${filename}`;
    const encodedContent = typeof imageData === 'string' 
      ? imageData 
      : imageData.toString('base64');

    try {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message: `Upload image: ${filename}`,
        content: encodedContent,
        branch: this.config.branch
      });

      // Return the public URL for the image
      return `/blog-content/images/${filename}`;
    } catch (error) {
      console.error('Error uploading image to GitHub:', error);
      throw new Error('Failed to upload image to GitHub');
    }
  }

  /**
   * Get all blog posts from the repository
   */
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const { data: contents } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: 'public/blog-content',
        ref: this.config.branch
      });

      if (!Array.isArray(contents)) {
        return [];
      }

      const posts: BlogPost[] = [];

      for (const file of contents) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          try {
            const { data: fileContent } = await this.octokit.repos.getContent({
              owner: this.config.owner,
              repo: this.config.repo,
              path: file.path,
              ref: this.config.branch
            });

            if ('content' in fileContent) {
              const content = Buffer.from(fileContent.content, 'base64').toString();
              const post = JSON.parse(content);
              posts.push(post);
            }
          } catch (error) {
            console.error(`Error reading post ${file.name}:`, error);
          }
        }
      }

      return posts;
    } catch (error) {
      console.error('Error fetching posts from GitHub:', error);
      return [];
    }
  }

  /**
   * Get a single blog post by slug
   */
  async getPost(slug: string): Promise<BlogPost | null> {
    const path = `public/blog-content/${slug}.json`;

    try {
      const { data: file } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.branch
      });

      if ('content' in file) {
        const content = Buffer.from(file.content, 'base64').toString();
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error(`Error fetching post ${slug}:`, error);
      return null;
    }
  }

  /**
   * Trigger a deployment (works with Vercel/Netlify webhooks)
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