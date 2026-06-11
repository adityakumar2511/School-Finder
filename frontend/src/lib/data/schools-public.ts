import {
  parsePaginatedResponse,
  type PaginationMeta,
} from "@/lib/api/pagination";
import type { SchoolCardProps } from "@/components/SchoolCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** Shared Next.js cache tag — invalidated by revalidateSchoolsCache() after mutations */
const SCHOOLS_CACHE_TAG = "schools" as const;

export type SchoolListResult = {
  schools: SchoolCardProps[];
  pagination: PaginationMeta;
};

export async function fetchSchoolList(
  params: Record<string, string | string[] | undefined>,
  options: { revalidate?: number } = { revalidate: 60 },
): Promise<SchoolListResult> {
  if (!API_BASE) {
    return {
      schools: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }

  const query = new URLSearchParams();
  query.set("status", "APPROVED");
  query.set("limit", "12");

  for (const [key, value] of Object.entries(params)) {
  if (!value) continue;
  if (Array.isArray(value)) {
    value.forEach((v) => query.append(key, v));
  } else {
    query.set(key, value);
  }
}

  try {
    // Cached for performance; busted via revalidateTag("schools") after mutations
    const res = await fetch(`${API_BASE}/api/schools?${query.toString()}`, {
      next: {
        revalidate: options.revalidate ?? 60,
        tags: [SCHOOLS_CACHE_TAG],
      },
    });

    if (!res.ok) {
      return {
        schools: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
      };
    }

    const json = await res.json();
    const { items, pagination } = parsePaginatedResponse<SchoolCardProps>(
      json,
      "schools",
    );

    return { schools: items, pagination };
  } catch {
    return {
      schools: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }
}

export async function fetchFeaturedSchools(
  limit = 6,
): Promise<SchoolCardProps[]> {
  const { schools } = await fetchSchoolList(
    { limit: String(limit) },
    { revalidate: 3600 },
  );
  return schools;
}

export async function fetchSchoolBySlug(slug: string) {
  if (!API_BASE) return null;

  try {
    // Cached for performance; busted via revalidateTag("schools") after mutations
    const res = await fetch(`${API_BASE}/api/schools/${slug}`, {
      next: {
        revalidate: 3600,
        tags: [SCHOOLS_CACHE_TAG],
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.data ?? json.school ?? json ?? null;
  } catch {
    return null;
  }
}

export async function fetchCities(): Promise<string[]> {
  if (!API_BASE) return [];
  try {
    // Cached for performance; busted via revalidateTag("schools") after mutations
    const res = await fetch(`${API_BASE}/api/schools/cities`, {
      next: { revalidate: 3600, tags: [SCHOOLS_CACHE_TAG] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? (json.data as string[]) : [];
  } catch {
    return [];
  }
}