import type { InquiryStatus, Role, SchoolStatus, AdminAccessLevel  } from "@/lib/types/database";
import { adminFetch } from "@/lib/api/server";
import { ACCOUNT_DISABLED_PHONE } from "./constants";

export type AdminStats = {
  totalSchools: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  totalUsers: number;
  totalInquiries: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const { ok, data } = await adminFetch<{ stats?: AdminStats }>("/api/admin/stats");

  if (!ok || !data?.stats) {
    return {
      totalSchools: 0,
      pendingSchools: 0,
      approvedSchools: 0,
      rejectedSchools: 0,
      totalUsers: 0,
      totalInquiries: 0,
    };
  }

  return data.stats;
}

export async function getRecentSchoolRegistrations(limit = 5) {
  const { ok, data } = await adminFetch<{
    data?: Array<{
      id: string;
      name: string;
      city: string;
      status: SchoolStatus;
      createdAt: string;
      owner: { name: string | null; email: string };
    }>;
    schools?: Array<{
      id: string;
      name: string;
      city: string;
      status: SchoolStatus;
      createdAt: string;
      owner: { name: string | null; email: string };
    }>;
  }>(`/api/admin/schools?page=1&limit=${limit}`);

  return ok && data?.schools ? data.schools : ok && data?.data ? data.data : [];
}

export async function getRecentInquiries(limit = 5) {
  const { ok, data } = await adminFetch<{
    data?: Array<{
      id: string;
      message: string;
      status: InquiryStatus;
      createdAt: string;
      school: { name: string };
      parent: { name: string | null; email: string };
    }>;
    inquiries?: Array<{
      id: string;
      message: string;
      status: InquiryStatus;
      createdAt: string;
      school: { name: string };
      parent: { name: string | null; email: string };
    }>;
  }>(`/api/admin/inquiries?page=1&limit=${limit}`);

  return ok && data?.inquiries ? data.inquiries : ok && data?.data ? data.data : [];
}

export async function getRecentModerationActivity(limit = 5) {
  const { ok, data } = await adminFetch<{
    data?: Array<{
      id: string;
      name: string;
      status: SchoolStatus;
      rejectionReason: string | null;
      updatedAt?: string;
      createdAt: string;
    }>;
  }>(`/api/admin/schools?page=1&limit=${limit}`);

  if (!ok || !data?.data) return [];

  return data.data
    .filter((school) => school.status === "APPROVED" || school.status === "REJECTED")
    .map((school) => ({
      ...school,
      updatedAt: school.updatedAt ?? school.createdAt,
    }));
}

export type AdminSchoolRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  address: string;
  board: string;
  stateBoardName: string | null; 
  schoolType: string;
  medium: string;
  classesFrom: number;
  classesTo: number;
  phone: string;
  email: string | null;
  website: string | null;
  description: string | null;
  status: SchoolStatus;
  isVisible: boolean;          // ← naya — §4
  isFeatured: boolean;
featuredUntil: string | null;
  createdAt: string;
  rejectionReason: string | null;
  totalStudents: number | null;
  establishedYear: number | null;
  admissionFee: number | null;
  tuitionFeeMonthly: number | null;
  totalAnnualFee: number | null;
  transportFee: number | null;
  hostelFee: number | null;
  logoUrl: string | null;
  owner: { name: string | null; email: string };
};

export async function getAdminSchoolsList(options: {
  page?: number;
  limit?: number;
  status?: SchoolStatus;
  search?: string;
  state?: string;
  city?: string;
}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options.status) params.set("status", options.status);
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.state?.trim()) params.set("state", options.state.trim());
  if (options.city?.trim()) params.set("city", options.city.trim());

  const { ok, data } = await adminFetch<{
    data?: AdminSchoolRow[];
    schools?: AdminSchoolRow[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  }>(`/api/admin/schools?${params.toString()}`);

  if (!ok || !data) {
    return { schools: [], total: 0, page, limit, totalPages: 1 };
  }

  const pagination = data.pagination ?? {
    total: 0,
    page,
    limit,
    totalPages: 1,
  };

  return {
    schools: data.schools ?? data.data ?? [],
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
  };
}

// Distinct states across all schools (any status) — for the admin state filter dropdown
export async function getAdminSchoolStates(): Promise<string[]> {
  const { ok, data } = await adminFetch<{ data?: string[] }>(
    "/api/admin/schools/states"
  );

  return ok && data?.data ? data.data : [];
}

// Distinct cities across all schools (any status), optionally scoped to a state —
// for the admin city filter dropdown (dependent on selected state)
export async function getAdminSchoolCities(state?: string): Promise<string[]> {
  const params = new URLSearchParams();
  if (state?.trim()) params.set("state", state.trim());

  const query = params.toString();
  const { ok, data } = await adminFetch<{ data?: string[] }>(
    `/api/admin/schools/cities${query ? `?${query}` : ""}`
  );

  return ok && data?.data ? data.data : [];
}

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  phone: string | null;
  createdAt: string;
  adminAccessLevel?: AdminAccessLevel | null;
  isSuperAdmin?: boolean; // ← add karo
};

export async function getAdminUsersList(options: {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role; // ← add
}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.role) params.set("role", options.role); // ← add

  const { ok, data } = await adminFetch<{
    data?: AdminUserRow[];
    users?: AdminUserRow[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  }>(`/api/admin/users?${params.toString()}`);

  if (!ok || !data) {
    return { users: [], total: 0, page, limit, totalPages: 1 };
  }

  const pagination = data.pagination ?? {
    total: 0,
    page,
    limit,
    totalPages: 1,
  };

  return {
    users: data.users ?? data.data ?? [],
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
  };
}

export type AdminInquiryRow = {
  id: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  school: { id: string; name: string };
  parent: { name: string | null; email: string };
};

export async function getAdminInquiriesList(options: {
  page?: number;
  limit?: number;
  status?: InquiryStatus;
  search?: string;
  schoolId?: string; // ← add
}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options.status) params.set("status", options.status);
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.schoolId?.trim()) params.set("schoolId", options.schoolId.trim()); // ← add

  const { ok, data } = await adminFetch<{
    data?: AdminInquiryRow[];
    inquiries?: AdminInquiryRow[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
  }>(`/api/admin/inquiries?${params.toString()}`);

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
    inquiries: data.inquiries ?? data.data ?? [],
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
  };
}

// Fetch full school detail by id (admin only) — used by admin edit page
// Returns complete school with all relations (boardResults, faqs, etc.)
export async function getAdminSchoolById(
  id: string
): Promise<Record<string, unknown> | null> {
  const { ok, data } = await adminFetch<{ school?: Record<string, unknown>; data?: Record<string, unknown> }>(
    `/api/admin/schools/${id}`
  );

  if (!ok || !data) return null;

  return data.school ?? data.data ?? null;
}

export { ACCOUNT_DISABLED_PHONE };