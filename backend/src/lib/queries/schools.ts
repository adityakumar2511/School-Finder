import type { Prisma } from "../../../generated/prisma";

/** Fields shown on SchoolCard — no extras */
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

/** Cursor pagination needs createdAt without exposing it in card payloads */
export const schoolListSelectWithCreatedAt = {
  ...schoolListSelect,
  createdAt: true,
} satisfies Prisma.SchoolSelect;

export type SchoolListRecord = Prisma.SchoolGetPayload<{
  select: typeof schoolListSelect;
}>;

export type SchoolListRecordWithCreatedAt = Prisma.SchoolGetPayload<{
  select: typeof schoolListSelectWithCreatedAt;
}>;

/** Minimal fields for autocomplete / search suggestions */
export const schoolSearchSelect = {
  id: true,
  name: true,
  slug: true,
  city: true,
  board: true,
  logoUrl: true,
} satisfies Prisma.SchoolSelect;

export type SchoolSearchRecord = Prisma.SchoolGetPayload<{
  select: typeof schoolSearchSelect;
}>;

export const schoolListOrderBy = [
  { createdAt: "desc" as const },
  { id: "desc" as const },
];

export type SchoolCursorPayload = {
  id: string;
  createdAt: string;
};

export function encodeSchoolCursor(school: {
  id: string;
  createdAt: Date;
}): string {
  return Buffer.from(
    JSON.stringify({
      id: school.id,
      createdAt: school.createdAt.toISOString(),
    })
  ).toString("base64url");
}

export function decodeSchoolCursor(cursor: string): SchoolCursorPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8")
    ) as SchoolCursorPayload;

    if (!parsed.id || !parsed.createdAt) {
      return null;
    }

    const createdAt = new Date(parsed.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function buildSchoolCursorWhere(
  cursor: SchoolCursorPayload
): Prisma.SchoolWhereInput {
  const createdAt = new Date(cursor.createdAt);

  return {
    OR: [
      { createdAt: { lt: createdAt } },
      {
        createdAt,
        id: { lt: cursor.id },
      },
    ],
  };
}

export function mapSchoolListItem(
  school: SchoolListRecord | SchoolListRecordWithCreatedAt
) {
  const {
    _count,
    id,
    name,
    slug,
    city,
    state,
    board,
    schoolType,
    medium,
    classesFrom,
    classesTo,
    tuitionFeeMonthly,
    logoUrl,
  } = school;

  return {
    id,
    name,
    slug,
    city,
    state,
    board,
    schoolType,
    medium,
    classesFrom,
    classesTo,
    tuitionFeeMonthly,
    logoUrl,
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

export function buildSchoolListWhere(filters: {
  status?: unknown;
  search?: string;
  city?: string;
  board?: string | string[];  // change
  schoolType?: string;
  medium?: string;
}): Prisma.SchoolWhereInput {
  const where: Prisma.SchoolWhereInput = {
    status: (filters.status as Prisma.EnumSchoolStatusFilter["equals"]) || "APPROVED",
  };

  const searchWhere = buildSchoolSearchWhere(filters.search);
  if (searchWhere?.OR) {
    where.OR = searchWhere.OR;
  }

  if (filters.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }

  if (filters.board) {
    const boards = Array.isArray(filters.board) ? filters.board : [filters.board];
    where.board = { in: boards as Prisma.EnumBoardTypeFilter["in"] };
  }

  if (filters.schoolType) {
    where.schoolType = filters.schoolType as Prisma.EnumSchoolTypeFilter["equals"];
  }

  if (filters.medium) {
    where.medium = filters.medium as Prisma.EnumMediumTypeFilter["equals"];
  }

  return where;
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
  state: true,         // ADD
  address: true,       // ADD
  board: true,
  schoolType: true,    // ADD
  medium: true,        // ADD
  classesFrom: true,   // ADD
  classesTo: true,     // ADD
  phone: true,         // ADD
  email: true,         // ADD
  website: true,       // ADD
  description: true,   // ADD
  status: true,
  createdAt: true,
  rejectionReason: true,
  totalStudents: true,      // ADD
  establishedYear: true,    // ADD
  admissionFee: true,       // ADD
  tuitionFeeMonthly: true,  // ADD
  totalAnnualFee: true,     // ADD
  transportFee: true,       // ADD
  hostelFee: true,          // ADD
  logoUrl: true,            // ADD
  owner: {
    select: { name: true, email: true },
  },
} satisfies Prisma.SchoolSelect;
