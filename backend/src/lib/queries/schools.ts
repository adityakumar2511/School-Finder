import type { Prisma } from "../../../generated/prisma";

/** Fields required for public school listing cards */
export const schoolListSelect = {
  id: true,
  name: true,
  slug: true,
  city: true,
  state: true,
  board: true,
  schoolType: true,
  medium: true,
  classesFrom: true,
  classesTo: true,
  tuitionFeeMonthly: true,
  logoUrl: true,
  _count: {
    select: { facilities: true },
  },
} satisfies Prisma.SchoolSelect;

export type SchoolListRecord = Prisma.SchoolGetPayload<{
  select: typeof schoolListSelect;
}>;

export function mapSchoolListItem(school: SchoolListRecord) {
  const { _count, ...rest } = school;
  return {
    ...rest,
    facilitiesCount: _count.facilities,
  };
}

export function buildSchoolSearchWhere(
  search: string | undefined
): Prisma.SchoolWhereInput | undefined {
  const term = search?.trim();
  if (!term) return undefined;

  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { state: { contains: term, mode: "insensitive" } },
    ],
  };
}

/** Public school detail — necessary relations only */
export const schoolDetailSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  board: true,
  schoolType: true,
  medium: true,
  classesFrom: true,
  classesTo: true,
  totalStudents: true,
  establishedYear: true,
  phone: true,
  email: true,
  website: true,
  logoUrl: true,
  admissionFee: true,
  tuitionFeeMonthly: true,
  totalAnnualFee: true,
  transportFee: true,
  hostelFee: true,
  status: true,
  ownerId: true,
  images: {
    select: { id: true, url: true, caption: true },
    orderBy: { createdAt: "asc" as const },
  },
  facilities: {
    select: {
      facility: {
        select: { id: true, name: true, icon: true },
      },
    },
  },
  owner: {
    select: { name: true },
  },
} satisfies Prisma.SchoolSelect;

export const adminSchoolListSelect = {
  id: true,
  name: true,
  slug: true,
  city: true,
  board: true,
  status: true,
  createdAt: true,
  rejectionReason: true,
  owner: {
    select: { name: true, email: true },
  },
} satisfies Prisma.SchoolSelect;
