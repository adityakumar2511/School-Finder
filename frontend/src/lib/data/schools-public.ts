import {
  parsePaginatedResponse,
  type PaginationMeta,
} from "@/lib/api/pagination";
import type { SchoolCardProps } from "@/components/public/schools/SchoolCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const SCHOOLS_CACHE_TAG = "schools" as const;

export type SchoolListResult = {
  schools: SchoolCardProps[];
  pagination: PaginationMeta;
};

export type NearbySchool = SchoolCardProps & {
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
};

export type NearbySchoolsParams = {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
  excludeId?: string;
};

const EMPTY_SCHOOL_LIST: SchoolListResult = {
  schools: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
};

export async function fetchSchoolList(
  params: Record<string, string | string[] | undefined>,
  options: { revalidate?: number } = { revalidate: 60 },
): Promise<SchoolListResult> {
  if (!API_BASE) {
    return EMPTY_SCHOOL_LIST;
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
    const res = await fetch(`${API_BASE}/api/schools?${query.toString()}`, {
      next: {
        revalidate: options.revalidate ?? 60,
        tags: [SCHOOLS_CACHE_TAG],
      },
    });

    if (!res.ok) {
      return EMPTY_SCHOOL_LIST;
    }

    const json = await res.json();

    const { items, pagination } = parsePaginatedResponse<SchoolCardProps>(
      json,
      "schools",
    );

    return { schools: items, pagination };
  } catch {
    return EMPTY_SCHOOL_LIST;
  }
}

export async function fetchFeaturedSchools(
  limit = 6,
): Promise<SchoolCardProps[]> {
  const { schools } = await fetchSchoolList(
    { limit: String(limit), featured: "true" },
    { revalidate: 3600 },
  );

  return schools;
}

export async function fetchSchoolBySlug(slug: string) {
  if (!API_BASE) return null;

  try {
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

export async function fetchNearbySchools(
  params: NearbySchoolsParams,
  options: { revalidate?: number } = { revalidate: 300 },
): Promise<NearbySchool[]> {
  if (!API_BASE) return [];

  const { lat, lng, radius = 10, limit = 6, excludeId } = params;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return [];
  }

  const query = new URLSearchParams();
  query.set("lat", String(lat));
  query.set("lng", String(lng));
  query.set("radius", String(radius));
  query.set("limit", String(limit));

  if (excludeId) {
    query.set("excludeId", excludeId);
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/schools/nearby?${query.toString()}`,
      {
        next: {
          revalidate: options.revalidate ?? 300,
          tags: [SCHOOLS_CACHE_TAG],
        },
      },
    );

    if (!res.ok) return [];

    const json = await res.json();

    if (Array.isArray(json.data)) {
      return json.data as NearbySchool[];
    }

    if (Array.isArray(json.schools)) {
      return json.schools as NearbySchool[];
    }

    return [];
  } catch {
    return [];
  }
}

export async function fetchCities(): Promise<string[]> {
  if (!API_BASE) return [];

  try {
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

// --- Phase 5: SEO dynamic page fetchers ---

/** Fetch all distinct cities that have approved+visible schools — for static params */
export async function fetchAllCities(): Promise<string[]> {
  if (!API_BASE) return [];

  try {
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

/** Fetch schools filtered by city — used by /schools/city/[city] */
export async function fetchSchoolsByCity(
  city: string,
  page = 1,
): Promise<SchoolListResult> {
  return fetchSchoolList({ city, page: String(page) }, { revalidate: 60 });
}

/** Fetch schools filtered by state — used by /schools/state/[state] */
export async function fetchSchoolsByState(
  state: string,
  page = 1,
): Promise<SchoolListResult> {
  return fetchSchoolList({ state, page: String(page) }, { revalidate: 60 });
}

/** Fetch schools filtered by board — used by /schools/board/[board] */
export async function fetchSchoolsByBoard(
  board: string,
  page = 1,
): Promise<SchoolListResult> {
  return fetchSchoolList({ board, page: String(page) }, { revalidate: 60 });
}



/**
 * Client-side school detail fetcher for compare page.
 * Does NOT use next: cache — safe to call from browser.
 */
export async function fetchSchoolDetailClient(
  slug: string,
): Promise<import("@/lib/types/database").SchoolDetail | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/schools/${slug}`);
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? json.school ?? json) ?? null;
  } catch {
    return null;
  }
}



/**
 * Fetch approved + visible schools for homepage browse section.
 * Used to derive dynamic states/cities/boards/management types and render school cards.
 */
export async function fetchHomeBrowseSchools(
  limit = 1000,
): Promise<SchoolCardProps[]> {
  const { schools } = await fetchSchoolList(
    { limit: String(limit) },
    { revalidate: 3600 },
  );

  return schools;
}

export async function fetchAllStates(): Promise<string[]> {
  const schools = await fetchHomeBrowseSchools(1000);

  return Array.from(
    new Set(
      schools
        .map((school) => school.state)
        .filter((state): state is string => Boolean(state)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export async function fetchAllCitiesFromSchools(): Promise<string[]> {
  const schools = await fetchHomeBrowseSchools(1000);

  return Array.from(
    new Set(
      schools
        .map((school) => school.city)
        .filter((city): city is string => Boolean(city)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}