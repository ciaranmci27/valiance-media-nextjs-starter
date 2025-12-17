/**
 * Server-side CMS Configuration
 * This boilerplate uses local file system storage for all blog content.
 * Changes are saved to public/blog-content/ and can be committed via your IDE/git client.
 */

/**
 * Check if we're in a local development environment
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
};

/**
 * Check if we're in production
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Get storage method - always local for this boilerplate
 */
export const getStorageMethod = () => {
  return 'local';
};

/**
 * Get server-side CMS configuration
 */
export const getServerCMSConfig = () => {
  return {
    storageMethod: 'local',
    useLocalFileSystem: true,
    isConfigured: true,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isProduction: isProduction(),
      isDevelopment: isDevelopment()
    }
  };
};

/**
 * Log environment detection for debugging
 */
export const logEnvironment = () => {
  const config = getServerCMSConfig();
  console.log('[CMS Config] Environment:', {
    storageMethod: config.storageMethod,
    environment: config.environment
  });
};
