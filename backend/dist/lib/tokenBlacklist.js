"use strict";
/**
 * In-memory JWT blacklist.
 * Limitation: resets on server restart — logged-out tokens
 * valid again until expiry after restart.
 * Production upgrade path: replace with Redis SET with TTL.
 * Current scale: handles up to 10,000 concurrent blacklisted tokens.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenBlacklist = void 0;
class TokenBlacklist {
    constructor() {
        this.store = new Map();
        this.MAX_SIZE = 10000;
        this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
        this.cleanupInterval.unref();
    }
    add(jti, expiresAt) {
        if (this.store.size >= this.MAX_SIZE) {
            const oldest = [...this.store.entries()].sort((a, b) => a[1] - b[1])[0];
            if (oldest) {
                this.store.delete(oldest[0]);
            }
        }
        this.store.set(jti, expiresAt);
    }
    has(jti) {
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
    cleanup() {
        const now = Date.now();
        for (const [jti, exp] of this.store) {
            if (now > exp) {
                this.store.delete(jti);
            }
        }
    }
    size() {
        return this.store.size;
    }
}
exports.tokenBlacklist = new TokenBlacklist();
