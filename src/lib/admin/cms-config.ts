/**
 * Universal CMS Configuration
 * Automatically detects environment and determines storage method:
 * - Development/Localhost: Uses local file system (no git commits)
 * - Production: Uses GitHub API with automatic commits
 */

export const getCMSConfig = () => {
  // Client-side environment detection
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.startsWith('192.168.') ||
     window.location.hostname.startsWith('172.') ||
     window.location.hostname.startsWith('10.') ||
     window.location.hostname === '[::1]' ||
     window.location.hostname.includes('.local'));

  // Server-side environment detection
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Determine if we should use GitHub based on environment
  const shouldUseGitHub = !isLocalhost && !isDevelopment && process.env.NODE_ENV === 'production';

  return {
    // Storage method based on environment
    useGitHub: shouldUseGitHub,
    useLocalFileSystem: !shouldUseGitHub,
    
    // Universal endpoints that auto-detect environment server-side
    endpoints: {
      create: '/api/admin/blog',
      update: '/api/admin/blog',
      delete: '/api/admin/blog',
      fetch: '/api/admin/blog',
      list: '/api/admin/blog-posts'
    },
    
    // Environment details for debugging
    environment: {
      isLocalhost,
      isDevelopment,
      isProduction: process.env.NODE_ENV === 'production',
      nodeEnv: process.env.NODE_ENV,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      storageMethod: shouldUseGitHub ? 'GitHub API' : 'Local File System'
    }
  };
};

/**
 * Check if GitHub integration is properly configured
 */
export const isGitHubConfigured = () => {
  return !!(
    process.env.GITHUB_TOKEN && 
    process.env.GITHUB_OWNER && 
    process.env.GITHUB_REPO
  );
};

/**
 * Get commit message based on action
 */
export const getCommitMessage = (action: 'create' | 'update' | 'delete', title: string) => {
  const messages = {
    create: `Create blog post: ${title}`,
    update: `Update blog post: ${title}`,
    delete: `Delete blog post: ${title}`
  };
  
  return messages[action];
};