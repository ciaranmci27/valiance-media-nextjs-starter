// Simple in-memory session store for development
// In production, use a database or Redis

interface Session {
  token: string;
  username: string;
  createdAt: Date;
}

class SessionStore {
  private sessions: Map<string, Session> = new Map();

  createSession(username: string, token: string): void {
    this.sessions.set(token, {
      token,
      username,
      createdAt: new Date()
    });
  }

  getSession(token: string): Session | undefined {
    return this.sessions.get(token);
  }

  deleteSession(token: string): void {
    this.sessions.delete(token);
  }

  isValidSession(token: string): boolean {
    const session = this.sessions.get(token);
    if (!session) return false;
    
    // Check if session is not older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return session.createdAt > sevenDaysAgo;
  }
}

// Create a singleton instance
export const sessionStore = new SessionStore();