import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Authentication utilities
// Uses bcrypt for password hashing and HMAC-signed tokens for sessions

const BCRYPT_ROUNDS = 12;

function getAdminTokenSecret(): string {
  const secret = process.env.SIMPLE_ADMIN_TOKEN;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('SIMPLE_ADMIN_TOKEN must be set in production environment');
  }
  if (!secret) {
    console.warn('SIMPLE_ADMIN_TOKEN not set — using project-derived dev secret. Set SIMPLE_ADMIN_TOKEN in .env for security.');
  }
  return secret || `dev-${process.cwd()}-secret`;
}

// Hash a password using bcrypt (salted, slow by design)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Compare a password against a bcrypt hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate a random hex string (for SIMPLE_ADMIN_TOKEN secret in .env)
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate a random HMAC-signed session token
// Format: <random-session-id>.<hmac-signature>
export function generateSignedToken(): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const signature = crypto
    .createHmac('sha256', getAdminTokenSecret())
    .update(sessionId)
    .digest('hex');
  return `${sessionId}.${signature}`;
}

// Verify an HMAC-signed token (constant-time comparison)
export function verifySignedToken(token: string): boolean {
  try {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return false;

    const sessionId = token.substring(0, dotIndex);
    const signature = token.substring(dotIndex + 1);

    if (!sessionId || !signature) return false;

    // Validate hex format (matches auth-edge.ts)
    if (!/^[a-f0-9]+$/.test(sessionId) || !/^[a-f0-9]+$/.test(signature)) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', getAdminTokenSecret())
      .update(sessionId)
      .digest('hex');

    if (signature.length !== expectedSignature.length) return false;

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

// Verify a token (used by API routes in Node.js runtime)
export async function verifyAuth(token: string): Promise<boolean> {
  return verifySignedToken(token);
}

// Verify credentials and return a signed token on success
export async function verifyCredentials(username: string, password: string): Promise<string | null> {
  const validUsername = process.env.SIMPLE_ADMIN_USERNAME || 'admin';
  const validPasswordHash = process.env.SIMPLE_ADMIN_PASSWORD_HASH;

  if (!validPasswordHash) {
    console.error('SIMPLE_ADMIN_PASSWORD_HASH not set in environment variables');
    return null;
  }

  if (username !== validUsername) return null;

  const passwordMatch = await comparePassword(password, validPasswordHash);
  if (!passwordMatch) return null;

  return generateSignedToken();
}
