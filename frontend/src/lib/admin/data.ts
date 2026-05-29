import type { InquiryStatus, Role, SchoolStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
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
  const [
    totalSchools,
    pendingSchools,
    approvedSchools,
    rejectedSchools,
    totalUsers,
    totalInquiries,
  ] = await Promise.all([
    prisma.school.count(),
    prisma.school.count({ where: { status: "PENDING" } }),
    prisma.school.count({ where: { status: "APPROVED" } }),
    prisma.school.count({ where: { status: "REJECTED" } }),
    prisma.user.count(),
    prisma.inquiry.count(),
  ]);

  return {
    totalSchools,
    pendingSchools,
    approvedSchools,
    rejectedSchools,
    totalUsers,
    totalInquiries,
  };
}

export async function getRecentSchoolRegistrations(limit = 5) {
  return prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      city: true,
      status: true,
      createdAt: true,
      owner: { select: { name: true, email: true } },
    },
  });
}

export async function getRecentInquiries(limit = 5) {
  return prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      message: true,
      status: true,
      createdAt: true,
      school: { select: { name: true } },
      parent: { select: { name: true, email: true } },
    },
  });
}

export async function getRecentModerationActivity(limit = 5) {
  return prisma.school.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      status: true,
      rejectionReason: true,
      updatedAt: true,
    },
  });
}

export type AdminSchoolRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  board: string;
  status: SchoolStatus;
  createdAt: Date;
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
  const skip = (page - 1) * limit;

  const where: {
    status?: SchoolStatus;
    OR?: Array<{
      name?: { contains: string; mode: "insensitive" };
      city?: { contains: string; mode: "insensitive" };
      owner?: { email?: { contains: string; mode: "insensitive" } };
    }>;
  } = {};

  if (options.status) {
    where.status = options.status;
  }

  const term = options.search?.trim();
  if (term) {
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { owner: { email: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [schools, total] = await Promise.all([
    prisma.school.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        board: true,
        status: true,
        createdAt: true,
        rejectionReason: true,
        owner: { select: { name: true, email: true } },
      },
    }),
    prisma.school.count({ where }),
  ]);

  return {
    schools,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  phone: string | null;
  createdAt: Date;
};

export async function getAdminUsersList(options: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const skip = (page - 1) * limit;

  const term = options.search?.trim();
  const where = term
    ? {
        OR: [
          { name: { contains: term, mode: "insensitive" as const } },
          { email: { contains: term, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export type AdminInquiryRow = {
  id: string;
  message: string;
  status: InquiryStatus;
  createdAt: Date;
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
  const skip = (page - 1) * limit;

  const where: {
    status?: InquiryStatus;
    OR?: Array<{
      message?: { contains: string; mode: "insensitive" };
      school?: { name?: { contains: string; mode: "insensitive" } };
      parent?: {
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      };
    }>;
  } = {};

  if (options.status) {
    where.status = options.status;
  }

  const term = options.search?.trim();
  if (term) {
    where.OR = [
      { message: { contains: term, mode: "insensitive" } },
      { school: { name: { contains: term, mode: "insensitive" } } },
      { parent: { name: { contains: term, mode: "insensitive" } } },
      { parent: { email: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        message: true,
        status: true,
        createdAt: true,
        school: { select: { id: true, name: true } },
        parent: { select: { name: true, email: true } },
      },
    }),
    prisma.inquiry.count({ where }),
  ]);

  return { inquiries, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export { ACCOUNT_DISABLED_PHONE };
