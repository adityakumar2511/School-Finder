import type { InquiryStatus, Role, SchoolStatus } from "@/lib/types/database";
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
  board: string;
  status: SchoolStatus;
  createdAt: string;
  rejectionReason: string | null;
  owner: { name: string | null; email: string };
};

export async function getAdminSchoolsList(options: {
  page?: number;
  limit?: number;
  status?: SchoolStatus;
  search?: string;
}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options.status) params.set("status", options.status);
  if (options.search?.trim()) params.set("search", options.search.trim());

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

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  phone: string | null;
  createdAt: string;
};

export async function getAdminUsersList(options: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options.search?.trim()) params.set("search", options.search.trim());

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
}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options.status) params.set("status", options.status);
  if (options.search?.trim()) params.set("search", options.search.trim());

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

export { ACCOUNT_DISABLED_PHONE };
