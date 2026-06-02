/**
 * In-memory JWT blacklist.
 * Limitation: resets on server restart — logged-out tokens
 * valid again until expiry after restart.
 * Production upgrade path: replace with Redis SET with TTL.
 * Current scale: handles up to 10,000 concurrent blacklisted tokens.
 */

interface BlacklistEntry {
  jti: string;
  expiresAt: number;
}

class TokenBlacklist {
  private store = new Map<string, number>();
  private readonly MAX_SIZE = 10_000;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
    this.cleanupInterval.unref();
  }

  add(jti: string, expiresAt: number): void {
    if (this.store.size >= this.MAX_SIZE) {
      const oldest = [...this.store.entries()].sort((a, b) => a[1] - b[1])[0];
      if (oldest) {
        this.store.delete(oldest[0]);
      }
    }
    this.store.set(jti, expiresAt);
  }

  has(jti: string): boolean {
    const exp = this.store.get(jti);
    if (!exp) {
      return false;
    }
    if (Date.now() > exp) {
      this.store.delete(jti);
      return false;
    }
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [jti, exp] of this.store) {
      if (now > exp) {
        this.store.delete(jti);
      }
    }
  }

  size(): number {
    return this.store.size;
  }
}

export const tokenBlacklist = new TokenBlacklist();

export type { BlacklistEntry };
