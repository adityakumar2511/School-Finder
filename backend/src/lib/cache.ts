/**
 * Cache layer placeholder for future Redis integration.
 * Today: pass-through only. Swap `withCache` implementation when Redis is added.
 */

export type CacheOptions = {
  /** Time-to-live in seconds (used when Redis is enabled) */
  ttlSeconds?: number;
  /** Namespace prefix for cache keys */
  namespace?: string;
};

export function buildCacheKey(
  namespace: string,
  parts: Record<string, string | number | undefined>
): string {
  const serialized = Object.entries(parts)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

  return `sf:${namespace}:${serialized}`;
}

export async function withCache<T>(
  _key: string,
  loader: () => Promise<T>,
  _options: CacheOptions = {}
): Promise<T> {
  return loader();
}
