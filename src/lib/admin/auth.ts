import crypto from 'crypto';

// Authentication configuration and utilities
// This is a flexible auth system that can be adapted to different providers

export interface AuthConfig {
  provider: 'simple' | 'custom' | 'oauth';
  simpleAuth?: {
    username: string;
    passwordHash: string;
  };
  customAuth?: {
    verifyFunction: (token: string) => Promise<boolean>;
  };
  oauthConfig?: {
    provider: string;
    clientId: string;
    clientSecret: string;
  };
}

// Generate a secure token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash a password using SHA256
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify a token (can be customized based on auth provider)
export async function verifyAuth(token: string): Promise<boolean> {
  // Get auth configuration from environment
  const authProvider = process.env.ADMIN_AUTH_PROVIDER || 'simple';

  switch (authProvider) {
    case 'simple':
      // For simple auth, we'll use a static token approach
      // The token is a hash of username + password hash + a secret
      const validUsername = process.env.ADMIN_USERNAME || 'admin';
      const validPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      
      if (!validPasswordHash) {
        console.error('ADMIN_PASSWORD_HASH not set');
        return false;
      }
      
      // Create the expected token (same logic as in verifyCredentials)
      const expectedToken = crypto
        .createHash('sha256')
        .update(`${validUsername}:${validPasswordHash}:${process.env.ADMIN_TOKEN || 'default-secret'}`)
        .digest('hex');
      
      return token === expectedToken;

    case 'jwt':
      // JWT verification (requires additional setup)
      // You can integrate with NextAuth.js, Auth0, Clerk, etc.
      return verifyJWT(token);

    case 'custom':
      // Custom verification logic
      // Users can implement their own verification
      return customVerification(token);

    default:
      // Default to simple verification
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';
      const defaultToken = crypto
        .createHash('sha256')
        .update(`${defaultUsername}:${defaultPasswordHash}:${process.env.ADMIN_TOKEN || 'default-secret'}`)
        .digest('hex');
      
      return token === defaultToken;
  }
}

// Hash a string (for API routes - Node.js environment)
async function hashStringNode(text: string): Promise<string> {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
}

// Verify credentials for login
export async function verifyCredentials(username: string, password: string): Promise<string | null> {
  const authProvider = process.env.ADMIN_AUTH_PROVIDER || 'simple';

  switch (authProvider) {
    case 'simple':
      // Simple username/password verification
      const validUsername = process.env.ADMIN_USERNAME || 'admin';
      const validPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      
      if (!validPasswordHash) {
        console.error('ADMIN_PASSWORD_HASH not set in environment variables');
        return null;
      }

      const passwordHash = hashPassword(password);
      
      if (username === validUsername && passwordHash === validPasswordHash) {
        // Generate a deterministic token based on credentials
        // This must match the Edge version in auth-edge.ts
        const token = await hashStringNode(
          `${validUsername}:${validPasswordHash}:${process.env.ADMIN_TOKEN || 'default-secret'}`
        );
        
        console.log('Login successful. Token created for:', username);
        
        return token;
      }
      
      console.log('Login failed. Invalid credentials for:', username);
      return null;

    case 'custom':
      // Custom authentication logic
      return customLogin(username, password);

    default:
      return null;
  }
}

// JWT verification placeholder (implement with your preferred JWT library)
async function verifyJWT(token: string): Promise<boolean> {
  // Example implementation with jsonwebtoken library:
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   return !!decoded;
  // } catch {
  //   return false;
  // }
  
  console.warn('JWT verification not implemented. Install jsonwebtoken and implement verifyJWT function.');
  return false;
}

// Custom verification placeholder
async function customVerification(token: string): Promise<boolean> {
  // Users can implement their own verification logic here
  // For example, checking against a database, external API, etc.
  
  // Example: Check if token exists in a database
  // const isValid = await db.tokens.findOne({ token, active: true });
  // return !!isValid;
  
  return false;
}

// Custom login placeholder
async function customLogin(username: string, password: string): Promise<string | null> {
  // Users can implement their own login logic here
  // For example, checking against a database, LDAP, etc.
  
  // Example: Check credentials against a database
  // const user = await db.users.findOne({ username });
  // if (user && await bcrypt.compare(password, user.passwordHash)) {
  //   const token = generateToken();
  //   await db.tokens.create({ token, userId: user.id });
  //   return token;
  // }
  
  return null;
}

// Helper function to create a password hash for initial setup
export function createPasswordHash(password: string): string {
  const hash = hashPassword(password);
  console.log('\n🔐 Add this to your .env.local file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`ADMIN_USERNAME=admin`);
  console.log(`ADMIN_TOKEN=${generateToken()}`);
  console.log('\nOr for development only:');
  console.log('DISABLE_ADMIN_AUTH=true\n');
  return hash;
}