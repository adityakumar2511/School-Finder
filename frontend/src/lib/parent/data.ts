import type { SchoolCardProps } from "@/components/public/schools/SchoolCard";
import { backendFetch } from "@/lib/api/server";

export type ParentSchoolCard = SchoolCardProps;

export type ParentProfile = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  createdAt: string;
};

export async function getParentProfile(): Promise<ParentProfile | null> {
  const { ok, data } = await backendFetch<{ data?: ParentProfile }>(
    "/api/parent/profile"
  );

  return ok && data?.data ? data.data : null;
}

export async function getParentDashboardData() {
  const [profileResult, favouritesResult] = await Promise.all([
    backendFetch<{ data?: ParentProfile }>("/api/parent/profile"),
    backendFetch<{
      schools?: ParentSchoolCard[];
      pagination?: { total: number };
    }>("/api/parent/favourites?page=1&limit=3"),
  ]);

  const user = profileResult.ok ? profileResult.data?.data ?? null : null;
  const recentSaved = favouritesResult.ok ? favouritesResult.data?.schools ?? [] : [];
  const favouritesCount = favouritesResult.ok
    ? favouritesResult.data?.pagination?.total ?? recentSaved.length
    : 0;

  return {
    user,
    favouritesCount,
    recentSaved,
  };
}

export async function getParentFavourites(page: number, pageSize: number) {
  const { ok, data } = await backendFetch<{
    schools?: ParentSchoolCard[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(`/api/parent/favourites?page=${page}&limit=${pageSize}`);

  if (!ok || !data) {
    return {
      schools: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }

  const pagination = data.pagination ?? {
    total: 0,
    page,
    limit: pageSize,
    totalPages: 1,
  };

  return {
    schools: data.schools ?? [],
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.limit,
    totalPages: pagination.totalPages,
  };
}
