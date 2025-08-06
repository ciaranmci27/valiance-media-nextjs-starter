/**
 * Server-side CMS Configuration
 * Determines storage method based on deployment environment
 * This is used by API routes to decide whether to use local file system or GitHub API
 */

/**
 * Detect if the application is running in production
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production' && 
         process.env.VERCEL_ENV === 'production' ||
         process.env.NETLIFY === 'true' ||
         process.env.RAILWAY_ENVIRONMENT === 'production' ||
         process.env.RENDER === 'true' ||
         process.env.FLY_APP_NAME !== undefined ||
         process.env.DETA_RUNTIME === 'true';
};

/**
 * Check if we're in a local development environment
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || 
         process.env.NODE_ENV === 'test' ||
         (!isProduction() && !process.env.NODE_ENV);
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
 * Determine which storage method to use
 */
export const getStorageMethod = () => {
  // In development, always use local file system
  if (isDevelopment()) {
    return 'local';
  }
  
  // In production, use GitHub if configured, otherwise fall back to local
  if (isProduction() && isGitHubConfigured()) {
    return 'github';
  }
  
  // Default to local if GitHub is not configured
  return 'local';
};

/**
 * Get server-side CMS configuration
 */
export const getServerCMSConfig = () => {
  const storageMethod = getStorageMethod();
  
  return {
    storageMethod,
    useGitHub: storageMethod === 'github',
    useLocalFileSystem: storageMethod === 'local',
    isConfigured: storageMethod === 'github' ? isGitHubConfigured() : true,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isProduction: isProduction(),
      isDevelopment: isDevelopment(),
      gitHubConfigured: isGitHubConfigured(),
      vercelEnv: process.env.VERCEL_ENV,
      netlify: process.env.NETLIFY === 'true'
    }
  };
};

/**
 * Log environment detection for debugging
 */
export const logEnvironment = () => {
  const config = getServerCMSConfig();
  console.log('[CMS Config] Environment Detection:', {
    storageMethod: config.storageMethod,
    environment: config.environment
  });
};