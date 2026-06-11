/**
 * In-memory cache with TTL. Replace with Redis later if needed.
 */

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

export const CACHE_TTL = {
  SCHOOL_LIST: 60,
  SCHOOL_DETAIL: 300,
  ADMIN_STATS: 30,
} as const;

export function buildCacheKey(
  namespace: string,
  parts: Record<string, string | number | undefined>
): string {
  const serialized = Object.entries(parts)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

  return serialized ? `sf:${namespace}:${serialized}` : `sf:${namespace}`;
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");

  return new RegExp(`^${escaped}$`);
}

export function invalidateCache(pattern: string): number {
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

/**
 * Clears all school-related backend caches after any mutation.
 * Covers: list, cursor list, search, detail, cities, and admin stats.
 * Call this immediately after create/update/approve/reject/delete/image changes.
 */
export function invalidateSchoolCache(): void {
  invalidateCache("sf:schools:*");
  invalidateCache("sf:admin:stats*");
  // Legacy key used before cities moved to buildCacheKey — clear for safety
  invalidateCache("schools:cities");
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
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
