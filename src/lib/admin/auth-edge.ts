// Edge-compatible authentication utilities
// Uses Web Crypto API for HMAC token verification

function getAdminTokenSecret(): string {
  const secret = process.env.ADMIN_TOKEN;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_TOKEN must be set in production environment');
  }
  return secret || 'default-dev-secret';
}

// Verify an HMAC-signed token using Web Crypto API (Edge-compatible)
// Token format: <random-session-id>.<hmac-signature>
export async function verifyAuthEdge(token: string): Promise<boolean> {
  try {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return false;

    const sessionId = token.substring(0, dotIndex);
    const providedSignature = token.substring(dotIndex + 1);

    if (!sessionId || !providedSignature) return false;

    // Validate hex format
    if (!/^[a-f0-9]+$/.test(sessionId) || !/^[a-f0-9]+$/.test(providedSignature)) {
      return false;
    }

    const secret = getAdminTokenSecret();
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert hex signature to Uint8Array
    const sigBytes = new Uint8Array(
      providedSignature.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );

    // crypto.subtle.verify uses constant-time comparison
    return crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(sessionId)
    );
  } catch {
    return false;
  }
}
