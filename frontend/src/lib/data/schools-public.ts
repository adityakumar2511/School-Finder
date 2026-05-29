import { parsePaginatedResponse, type PaginationMeta } from "@/lib/api/pagination";
import type { SchoolCardProps } from "@/components/SchoolCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type SchoolListResult = {
  schools: SchoolCardProps[];
  pagination: PaginationMeta;
};

export async function fetchSchoolList(
  params: Record<string, string | undefined>,
  options: { revalidate?: number } = { revalidate: 60 }
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
    if (value) query.set(key, value);
  }

  try {
    const res = await fetch(`${API_BASE}/api/schools?${query.toString()}`, {
      next: { revalidate: options.revalidate ?? 60 },
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
      "schools"
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
  limit = 6
): Promise<SchoolCardProps[]> {
  const { schools } = await fetchSchoolList(
    { limit: String(limit) },
    { revalidate: 3600 }
  );
  return schools;
}

export async function fetchSchoolBySlug(slug: string) {
  if (!API_BASE) return null;

  try {
    const res = await fetch(`${API_BASE}/api/schools/${slug}`, {
      next: { revalidate: 120 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.data ?? json.school ?? json ?? null;
  } catch {
    return null;
  }
}
