/**
 * CMS Configuration
 * This boilerplate uses local file system storage for blog content.
 * Changes are saved locally and can be committed via your IDE/git client.
 */

export const getCMSConfig = () => {
  return {
    // Storage method - always local file system
    useLocalFileSystem: true,

    // API endpoints for blog operations
    endpoints: {
      create: '/api/admin/blog',
      update: '/api/admin/blog',
      delete: '/api/admin/blog',
      fetch: '/api/admin/blog',
      list: '/api/admin/blog-posts'
    },

    // Environment details for debugging
    environment: {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      nodeEnv: process.env.NODE_ENV,
      storageMethod: 'Local File System'
    }
  };
};
