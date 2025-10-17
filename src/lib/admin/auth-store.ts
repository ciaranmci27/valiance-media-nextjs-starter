// Simple in-memory session store for development
// In production, use a database or Redis

interface Session {
  token: string;
  username: string;
  createdAt: Date;
  lastActivity: Date;
}

interface LoginAttempt {
  username: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

class SessionStore {
  private sessions: Map<string, Session> = new Map();
  private loginAttempts: Map<string, LoginAttempt> = new Map();
  private sessionTimeoutMinutes: number = 60; // Default 60 minutes
  private maxLoginAttempts: number = 5; // Default 5 attempts
  private lockoutDurationMinutes: number = 15; // Default 15 minutes after max attempts

  // Update settings from saved configuration
  updateSettings(settings: { sessionTimeout?: number; maxLoginAttempts?: number; lockoutDuration?: number }) {
    if (typeof settings.sessionTimeout === 'number' && !Number.isNaN(settings.sessionTimeout)) {
      this.sessionTimeoutMinutes = settings.sessionTimeout;
    }
    if (typeof settings.maxLoginAttempts === 'number' && !Number.isNaN(settings.maxLoginAttempts)) {
      this.maxLoginAttempts = settings.maxLoginAttempts;
    }
    if (typeof settings.lockoutDuration === 'number' && !Number.isNaN(settings.lockoutDuration)) {
      this.lockoutDurationMinutes = settings.lockoutDuration;
    }
  }

  createSession(username: string, token: string): void {
    const now = new Date();
    this.sessions.set(token, {
      token,
      username,
      createdAt: now,
      lastActivity: now
    });
    // Clear login attempts on successful login
    // This should only be called when account is not locked
    this.loginAttempts.delete(username.toLowerCase());
  }

  getSession(token: string): Session | undefined {
    const session = this.sessions.get(token);
    if (session) {
      // Update last activity
      session.lastActivity = new Date();
    }
    return session;
  }

  deleteSession(token: string): void {
    this.sessions.delete(token);
  }

  isValidSession(token: string): boolean {
    const session = this.sessions.get(token);
    if (!session) return false;
    
    // Check session timeout based on last activity
    const now = new Date();
    const timeoutMs = this.sessionTimeoutMinutes * 60 * 1000;
    const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
    
    if (timeSinceActivity > timeoutMs) {
      // Session timed out
      this.deleteSession(token);
      return false;
    }
    
    // Update last activity
    session.lastActivity = now;
    
    // Also check if session is not older than 7 days (absolute max)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    if (session.createdAt < sevenDaysAgo) {
      this.deleteSession(token);
      return false;
    }
    
    return true;
  }

  // Login attempt tracking
  recordFailedLogin(username: string): { locked: boolean; remainingAttempts: number } {
    const key = username.toLowerCase();
    const now = new Date();
    
    let attempt = this.loginAttempts.get(key);
    
    if (!attempt) {
      attempt = {
        username: key,
        attempts: 1,
        lastAttempt: now
      };
    } else {
      // Check if locked
      if (attempt.lockedUntil && attempt.lockedUntil > now) {
        return { locked: true, remainingAttempts: 0 };
      }
      
      // Reset attempts if last attempt was more than 1 hour ago
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (attempt.lastAttempt < oneHourAgo) {
        attempt.attempts = 1;
      } else {
        attempt.attempts++;
      }
      
      attempt.lastAttempt = now;
      
      // Lock if max attempts reached
      if (attempt.attempts >= this.maxLoginAttempts) {
        attempt.lockedUntil = new Date(now.getTime() + this.lockoutDurationMinutes * 60 * 1000);
      }
    }
    
    this.loginAttempts.set(key, attempt);
    
    const remainingAttempts = Math.max(0, this.maxLoginAttempts - attempt.attempts);
    const locked = attempt.attempts >= this.maxLoginAttempts;
    
    return { locked, remainingAttempts };
  }

  isAccountLocked(username: string): boolean {
    const key = username.toLowerCase();
    const attempt = this.loginAttempts.get(key);
    
    if (!attempt) return false;
    
    const now = new Date();
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
      return true;
    }
    
    // Don't auto-clear here - let successful login clear it
    return false;
  }

  getRemainingLockTime(username: string): number {
    const key = username.toLowerCase();
    const attempt = this.loginAttempts.get(key);
    
    if (!attempt || !attempt.lockedUntil) return 0;
    
    const now = new Date();
    const remaining = attempt.lockedUntil.getTime() - now.getTime();
    
    return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
  }
}

// Create a singleton instance
export const sessionStore = new SessionStore();