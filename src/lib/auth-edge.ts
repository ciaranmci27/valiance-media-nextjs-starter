// Edge-compatible authentication utilities
// Uses Web Crypto API instead of Node.js crypto

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
        `${validUsername}:${validPasswordHash}:${process.env.ADMIN_TOKEN || 'default-secret'}`
      );
      
      return token === expectedToken;

    default:
      // Default to simple verification
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';
      const defaultToken = await hashString(
        `${defaultUsername}:${defaultPasswordHash}:${process.env.ADMIN_TOKEN || 'default-secret'}`
      );
      
      return token === defaultToken;
  }
}