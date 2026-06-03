"use strict";
/**
 * In-memory cache with TTL. Replace with Redis later if needed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = void 0;
exports.buildCacheKey = buildCacheKey;
exports.invalidateCache = invalidateCache;
exports.invalidateSchoolCache = invalidateSchoolCache;
exports.withCache = withCache;
const cache = new Map();
exports.CACHE_TTL = {
    SCHOOL_LIST: 60,
    SCHOOL_DETAIL: 300,
    ADMIN_STATS: 30,
};
function buildCacheKey(namespace, parts) {
    const serialized = Object.entries(parts)
        .filter(([, value]) => value !== undefined && value !== "")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join("|");
    return serialized ? `sf:${namespace}:${serialized}` : `sf:${namespace}`;
}
function globToRegExp(pattern) {
    const escaped = pattern
        .split("*")
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*");
    return new RegExp(`^${escaped}$`);
}
function invalidateCache(pattern) {
    const regex = globToRegExp(pattern);
    let removed = 0;
    for (const key of cache.keys()) {
        if (regex.test(key)) {
            cache.delete(key);
            removed++;
        }
    }
    return removed;
}
/** Clears public school list/detail/search caches and admin stats */
function invalidateSchoolCache() {
    invalidateCache("sf:schools:*");
    invalidateCache("sf:admin:stats*");
}
async function withCache(key, ttlSeconds, fetchFn) {
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
        return cached.value;
    }
    if (cached) {
        cache.delete(key);
    }
    const value = await fetchFn();
    cache.set(key, {
        value,
        expiresAt: now + ttlSeconds * 1000,
    });
    return value;
}
