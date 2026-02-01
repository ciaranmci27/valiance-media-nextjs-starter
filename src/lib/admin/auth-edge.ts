// Edge-compatible authentication utilities
// Uses Web Crypto API instead of Node.js crypto

// Get the admin token secret, throwing an error in production if not set
function getAdminTokenSecret(): string {
  const secret = process.env.ADMIN_TOKEN;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_TOKEN must be set in production environment');
  }
  return secret || 'default-dev-secret';
}

// Hash a string using Web Crypto API (Edge-compatible)
async function hashString(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verify a token (Edge-compatible version)
export async function verifyAuthEdge(token: string): Promise<boolean> {
  // Get auth configuration from environment
  const authProvider = process.env.ADMIN_AUTH_PROVIDER || 'simple';

  switch (authProvider) {
    case 'simple':
      // For simple auth, we'll use a static token approach
      const validUsername = process.env.ADMIN_USERNAME || 'admin';
      const validPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      
      if (!validPasswordHash) {
        console.error('ADMIN_PASSWORD_HASH not set');
        return false;
      }
      
      // Create the expected token (same logic as in verifyCredentials)
      const expectedToken = await hashString(
        `${validUsername}:${validPasswordHash}:${getAdminTokenSecret()}`
      );
      
      return token === expectedToken;

    default:
      // Unknown provider - reject for security
      console.error(`Unknown auth provider: ${authProvider}`);
      return false;
  }
}