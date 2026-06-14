import { revalidateTag } from "next/cache";

/**
 * Invalidates all Next.js Data Cache entries tagged "schools".
 *
 * Tagged fetches (see src/lib/data/schools-public.ts and src/app/sitemap.ts):
 *   - School listings (revalidate: 60s)
 *   - School detail by slug (revalidate: 3600s)
 *   - Featured schools (revalidate: 3600s)
 *   - Cities filter list (revalidate: 3600s)
 *   - Sitemap school URLs (revalidate: 3600s)
 *
 * Call from API route handlers immediately after a successful school mutation
 * so the next page request fetches fresh data from the backend.
 */
export function revalidateSchoolsCache(): void {
  revalidateTag("schools");
}
