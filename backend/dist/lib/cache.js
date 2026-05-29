"use strict";
/**
 * Cache layer placeholder for future Redis integration.
 * Today: pass-through only. Swap `withCache` implementation when Redis is added.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCacheKey = buildCacheKey;
exports.withCache = withCache;
function buildCacheKey(namespace, parts) {
    const serialized = Object.entries(parts)
        .filter(([, value]) => value !== undefined && value !== "")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join("|");
    return `sf:${namespace}:${serialized}`;
}
async function withCache(_key, loader, _options = {}) {
    return loader();
}
