import type { InquiryStatus, SchoolStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

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
  createdAt: Date;
};

export type SchoolInquiryRow = {
  id: string;
  message: string;
  status: InquiryStatus;
  createdAt: Date;
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
  CLOSED: number;
};

const schoolSelect = {
  id: true,
  name: true,
  slug: true,
  city: true,
  state: true,
  address: true,
  pincode: true,
  board: true,
  schoolType: true,
  medium: true,
  classesFrom: true,
  classesTo: true,
  phone: true,
  email: true,
  website: true,
  description: true,
  status: true,
  rejectionReason: true,
  totalStudents: true,
  tuitionFeeMonthly: true,
  admissionFee: true,
  totalAnnualFee: true,
  transportFee: true,
  hostelFee: true,
  logoUrl: true,
  establishedYear: true,
  createdAt: true,
} as const;

export async function getOwnedSchool(
  ownerId: string
): Promise<SchoolDashboardSchool | null> {
  return prisma.school.findFirst({
    where: { ownerId },
    select: schoolSelect,
  });
}

export async function getInquiryStats(schoolId: string): Promise<InquiryStats> {
  const grouped = await prisma.inquiry.groupBy({
    by: ["status"],
    where: { schoolId },
    _count: { status: true },
  });

  const stats: InquiryStats = {
    total: 0,
    NEW: 0,
    CONTACTED: 0,
    CLOSED: 0,
  };

  for (const row of grouped) {
    stats[row.status] = row._count.status;
    stats.total += row._count.status;
  }

  return stats;
}

export async function getRecentInquiries(
  schoolId: string,
  limit = 5
): Promise<SchoolInquiryRow[]> {
  return prisma.inquiry.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      message: true,
      status: true,
      createdAt: true,
      parent: { select: { name: true, email: true, phone: true } },
    },
  });
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
  const skip = (page - 1) * limit;

  const where: {
    schoolId: string;
    status?: InquiryStatus;
    OR?: Array<{
      parent: {
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      };
    }>;
  } = { schoolId };

  if (options.status) {
    where.status = options.status;
  }

  const term = options.search?.trim();
  if (term) {
    where.OR = [
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
        parent: { select: { name: true, email: true, phone: true } },
      },
    }),
    prisma.inquiry.count({ where }),
  ]);

  return {
    inquiries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function assertInquiryOwnedBySchool(
  inquiryId: string,
  ownerId: string
) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    include: { school: { select: { ownerId: true } } },
  });

  if (!inquiry || inquiry.school.ownerId !== ownerId) {
    return null;
  }

  return inquiry;
}
