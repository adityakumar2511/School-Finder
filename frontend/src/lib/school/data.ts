import type { InquiryStatus, SchoolStatus } from "@/lib/types/database";
import { backendFetch } from "@/lib/api/server";

export type SchoolDashboardSchool = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  address: string;
  pincode: string | null;
  board: string;
  schoolType: string;
  medium: string;
  classesFrom: number;
  classesTo: number;
  phone: string;
  email: string | null;
  website: string | null;
  description: string | null;
  status: SchoolStatus;
  rejectionReason: string | null;
  totalStudents: number | null;
  tuitionFeeMonthly: number | null;
  admissionFee: number | null;
  totalAnnualFee: number | null;
  transportFee: number | null;
  hostelFee: number | null;
  logoUrl: string | null;
  establishedYear: number | null;
  createdAt: string;
  images?: Array<{ id: string; url: string; caption: string | null }>;
  facilities?: Array<{ facility: { id: string; name: string; icon: string | null } }>;
};

export type SchoolInquiryRow = {
  id: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  parent: {
    name: string | null;
    email: string;
    phone: string | null;
  };
};

export type InquiryStats = {
   total: number;
   NEW: number;
   CONTACTED: number;
   INTERESTED: number;
   CONVERTED: number;
   CLOSED: number;
};

export async function getOwnedSchool(): Promise<SchoolDashboardSchool | null> {
  const { ok, data } = await backendFetch<{ data?: SchoolDashboardSchool }>(
    "/api/schools/my-school"
  );

  if (!ok || !data?.data) {
    return null;
  }

  return data.data;
}

export async function getInquiryStats(schoolId: string): Promise<InquiryStats> {
  const { ok, data } = await backendFetch<{
    stats?: InquiryStats;
  }>(`/api/inquiries/school/${schoolId}?page=1&limit=1`);

  if (!ok || !data?.stats) {
    return { total: 0, NEW: 0, CONTACTED: 0, INTERESTED: 0, CONVERTED: 0, CLOSED: 0 };
  }

  return data.stats;
}

export async function getRecentInquiries(
  schoolId: string,
  limit = 5
): Promise<SchoolInquiryRow[]> {
  const { ok, data } = await backendFetch<{
    inquiries?: SchoolInquiryRow[];
  }>(`/api/inquiries/school/${schoolId}?page=1&limit=${limit}`);

  return ok && data?.inquiries ? data.inquiries : [];
}

export type InquiryListResult = {
  inquiries: SchoolInquiryRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function getSchoolInquiriesList(
  schoolId: string,
  options: {
    page?: number;
    limit?: number;
    status?: InquiryStatus;
    search?: string;
  } = {}
): Promise<InquiryListResult> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options.status) params.set("status", options.status);
  if (options.search?.trim()) params.set("search", options.search.trim());

  const { ok, data } = await backendFetch<{
    inquiries?: SchoolInquiryRow[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  }>(`/api/inquiries/school/${schoolId}?${params.toString()}`);

  if (!ok || !data) {
    return { inquiries: [], total: 0, page, limit, totalPages: 1 };
  }

  const pagination = data.pagination ?? {
    total: 0,
    page,
    limit,
    totalPages: 1,
  };

  return {
    inquiries: data.inquiries ?? [],
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
  };
}
