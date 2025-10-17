import fs from 'fs/promises';
import path from 'path';

interface LockoutData {
  [key: string]: {
    attempts: number;
    lastAttempt: string;
    lockedUntil?: string;
    failedUsernames: string[]; // Track which usernames were tried
  };
}

class LockoutStore {
  private lockoutFile = path.join(process.cwd(), '.lockouts.json');
  private lockoutData: LockoutData = {};
  private initialized = false;
  
  constructor() {
    // Don't load in constructor, load on first use
  }

  private async loadLockouts() {
    try {
      const data = await fs.readFile(this.lockoutFile, 'utf-8');
      this.lockoutData = JSON.parse(data);
      
      // Clean up expired entries
      const now = new Date();
      let needsSave = false;
      for (const key in this.lockoutData) {
        const lockout = this.lockoutData[key];
        if (lockout.lockedUntil && new Date(lockout.lockedUntil) <= now) {
          delete this.lockoutData[key];
          needsSave = true;
        }
      }
      if (needsSave) {
        await this.saveLockouts();
      }
      this.initialized = true;
    } catch (error) {
      // File doesn't exist or is invalid, start fresh
      console.log('Starting with fresh lockout data');
      this.lockoutData = {};
      this.initialized = true;
    }
  }

  private async saveLockouts() {
    try {
      await fs.writeFile(this.lockoutFile, JSON.stringify(this.lockoutData, null, 2));
    } catch (error) {
      console.error('Failed to save lockout data:', error);
    }
  }

  private getClientIdentifier(ip: string | null): string {
    // Use IP address as the key, fallback to a default for local development
    return ip || 'local-development';
  }

  async recordFailedAttempt(
    ip: string | null, 
    username: string, 
    maxAttempts: number, 
    lockoutMinutes: number
  ): Promise<{ locked: boolean; remainingAttempts: number }> {
    const key = this.getClientIdentifier(ip);
    const now = new Date();
    
    // Always reload to get latest data
    await this.loadLockouts();
    
    let lockout = this.lockoutData[key];
    
    if (!lockout) {
      lockout = {
        attempts: 1,
        lastAttempt: now.toISOString(),
        failedUsernames: [username.toLowerCase()]
      };
    } else {
      // Check if already locked
      if (lockout.lockedUntil && new Date(lockout.lockedUntil) > now) {
        return { locked: true, remainingAttempts: 0 };
      }
      
      // Reset attempts if last attempt was more than 1 hour ago
      const lastAttempt = new Date(lockout.lastAttempt);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      if (lastAttempt < oneHourAgo) {
        lockout.attempts = 1;
        lockout.failedUsernames = [username.toLowerCase()];
      } else {
        lockout.attempts++;
        // Track this username attempt
        if (!lockout.failedUsernames.includes(username.toLowerCase())) {
          lockout.failedUsernames.push(username.toLowerCase());
        }
      }
      
      lockout.lastAttempt = now.toISOString();
      
      // Lock if max attempts reached
      if (lockout.attempts >= maxAttempts) {
        const lockedUntil = new Date(now.getTime() + lockoutMinutes * 60 * 1000);
        lockout.lockedUntil = lockedUntil.toISOString();
      }
    }
    
    this.lockoutData[key] = lockout;
    await this.saveLockouts();
    
    const remainingAttempts = Math.max(0, maxAttempts - lockout.attempts);
    const locked = lockout.attempts >= maxAttempts;
    
    console.log(`Failed attempt from ${key} for user ${username}:`, {
      attempts: lockout.attempts,
      maxAttempts,
      locked,
      remainingAttempts
    });
    
    return { locked, remainingAttempts };
  }

  async isLocked(ip: string | null): Promise<boolean> {
    // Always reload to get latest data
    await this.loadLockouts();
    
    const key = this.getClientIdentifier(ip);
    const lockout = this.lockoutData[key];
    
    if (!lockout || !lockout.lockedUntil) {
      console.log(`No lockout found for IP ${key}`);
      return false;
    }
    
    const now = new Date();
    const lockedUntil = new Date(lockout.lockedUntil);
    
    console.log(`Checking lockout for IP ${key}:`, {
      now: now.toISOString(),
      lockedUntil: lockedUntil.toISOString(),
      isLocked: lockedUntil > now,
      attemptedUsernames: lockout.failedUsernames
    });
    
    if (lockedUntil > now) {
      return true;
    }
    
    // Lock expired, clean it up
    console.log(`Lock expired for IP ${key}, cleaning up`);
    delete this.lockoutData[key];
    await this.saveLockouts();
    return false;
  }

  async getRemainingLockTime(ip: string | null): Promise<number> {
    // Always reload to get latest data
    await this.loadLockouts();
    
    const key = this.getClientIdentifier(ip);
    const lockout = this.lockoutData[key];
    
    if (!lockout || !lockout.lockedUntil) {
      return 0;
    }
    
    const now = new Date();
    const lockedUntil = new Date(lockout.lockedUntil);
    const remaining = lockedUntil.getTime() - now.getTime();
    
    return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
  }

  async clearLockout(ip: string | null) {
    // Reload first to ensure we have latest data
    await this.loadLockouts();
    const key = this.getClientIdentifier(ip);
    delete this.lockoutData[key];
    await this.saveLockouts();
  }
}

// Export singleton instance
export const lockoutStore = new LockoutStore();