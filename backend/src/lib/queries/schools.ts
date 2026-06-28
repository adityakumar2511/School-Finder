import type { Prisma } from "../../../generated/prisma";

/** Fields shown on SchoolCard */
export const schoolListSelect = {
  id: true,
  name: true,
  slug: true,
  city: true,
  state: true,
  board: true,
  stateBoardName: true,
  schoolType: true,
  medium: true,
  mediumOther: true,
  classesFrom: true,
  classesTo: true,
  tuitionFeeMonthly: true,
  logoUrl: true,
  latitude: true,
  longitude: true,
  isFeatured: true,
  featuredUntil: true,
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
    }),
  ).toString("base64url");
}

export function decodeSchoolCursor(cursor: string): SchoolCursorPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
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
  cursor: SchoolCursorPayload,
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
  school: SchoolListRecord | SchoolListRecordWithCreatedAt,
) {
  const {
    _count,
    id,
    name,
    slug,
    city,
    state,
    board,
    stateBoardName,
    schoolType,
    medium,
    mediumOther,
    classesFrom,
    classesTo,
    tuitionFeeMonthly,
    logoUrl,
    latitude,
    longitude,
    isFeatured,
    featuredUntil,
  } = school;

  return {
    id,
    name,
    slug,
    city,
    state,
    board,
    stateBoardName,
    schoolType,
    medium,
    mediumOther,
    classesFrom,
    classesTo,
    tuitionFeeMonthly,
    logoUrl,
    latitude,
    longitude,
    facilitiesCount: _count.facilities,
    isFeatured,
    featuredUntil,
  };
}

export function buildSchoolSearchWhere(
  search: string | undefined,
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

const VALID_BOARD_FILTERS = new Set([
  "CBSE",
  "ICSE",
  "IB",
  "IGCSE",
  "NIOS",
  "STATE_BOARD",
  "OTHER",
]);

function normalizeBoardFilters(
  board: string | string[] | undefined,
): string[] {
  if (!board) return [];

  const values = Array.isArray(board) ? board : [board];

  return Array.from(
    new Set(
      values
        .map((value) => value.trim().toUpperCase())
        .map((value) => (value === "UP_BOARD" ? "STATE_BOARD" : value))
        .filter((value) => VALID_BOARD_FILTERS.has(value)),
    ),
  );
}

export function buildSchoolListWhere(filters: {
  status?: unknown;
  search?: string;
  city?: string;
  state?: string;
  board?: string | string[];
  schoolType?: string;
  medium?: string;
  featured?: string;
}): Prisma.SchoolWhereInput {
  const where: Prisma.SchoolWhereInput = {
    status:
      (filters.status as Prisma.EnumSchoolStatusFilter["equals"]) || "APPROVED",
    isVisible: true,
  };

  const searchWhere = buildSchoolSearchWhere(filters.search);
  if (searchWhere?.OR) {
    where.OR = searchWhere.OR;
  }

  if (filters.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }

  if (filters.state) {
    where.state = { contains: filters.state, mode: "insensitive" };
  }

  const boards = normalizeBoardFilters(filters.board);
  if (boards.length > 0) {
    where.board = { in: boards as Prisma.EnumBoardTypeFilter["in"] };
  }

  if (filters.schoolType) {
    where.schoolType =
      filters.schoolType as Prisma.EnumSchoolTypeFilter["equals"];
  }

  if (filters.medium) {
    where.medium = filters.medium as Prisma.EnumMediumTypeFilter["equals"];
  }

  if (filters.featured === "true") {
    where.isFeatured = true;
    where.featuredUntil = { gt: new Date() };
  }

  return where;
}

/**
 * Admin school list where-builder.
 */
export function buildAdminSchoolWhere(filters: {
  status?: string;
  search?: string;
  state?: string;
  city?: string;
}): Prisma.SchoolWhereInput {
  const where: Prisma.SchoolWhereInput = {};

  if (
    filters.status &&
    ["DRAFT", "PENDING", "APPROVED", "REJECTED"].includes(filters.status)
  ) {
    where.status = filters.status as Prisma.EnumSchoolStatusFilter["equals"];
  }

  const term = filters.search?.trim();
  if (term) {
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { owner: { email: { contains: term, mode: "insensitive" } } },
    ];
  }

  if (filters.state?.trim()) {
    where.state = { equals: filters.state.trim(), mode: "insensitive" };
  }

  if (filters.city?.trim()) {
    where.city = { equals: filters.city.trim(), mode: "insensitive" };
  }

  return where;
}

/** Public school detail — all 22-section fields + relations */
export const schoolDetailSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  isVisible: true,
  ownerId: true,

  // Core
  description: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  latitude: true,
  longitude: true,
  board: true,
  stateBoardName: true,
  schoolType: true,
  medium: true,
  mediumOther: true,
  classesFrom: true,
  classesTo: true,
  totalStudents: true,
  phone: true,
  email: true,
  website: true,
  logoUrl: true,
  coverImageUrl: true,

  // Basic Info extras
  tagline: true,
  establishedYear: true,
  managementType: true,
  schoolCategory: true,
  schoolFormat: true,
  affiliationNumber: true,
  startTime: true,
  endTime: true,
  workingDays: true,
  languagesOffered: true,
  recognitionNumber: true,
  affiliatedSince: true,
  uniformPolicy: true,
  canteenAvailable: true,

  // About
  vision: true,
  mission: true,
  principalMessage: true,

  // Academics
  classesOffered: true,
  streamsOffered: true,
  studentTeacherRatio: true,
  academicCalendar: true,

  // Admissions
  admissionOpen: true,
  admissionStartDate: true,
  admissionEndDate: true,
  ageCriteria: true,
  requiredDocuments: true,
  admissionProcess: true,

  // Fees — legacy
  admissionFee: true,
  tuitionFeeMonthly: true,
  totalAnnualFee: true,
  transportFee: true,
  hostelFee: true,

  // Fees — grade-wise
  averageAnnualFee: true,
  earlyChildhoodFee: true,
  prePrimaryFee: true,
  class1to5Fee: true,
  class6to8Fee: true,
  class9to10Fee: true,
  class11to12Fee: true,

  // Facilities & Sports
  facilitiesList: true,
  facilityCustomGroups: true,
  sportsList: true,
  sportsCustomGroups: true,

  // Infrastructure
  campusArea: true,
  totalClassrooms: true,
  totalLabs: true,
  libraryBooks: true,
  hostelCapacity: true,
  totalBuses: true,

  // Faculty
  totalTeachers: true,
  qualifiedTeachers: true,
  trainingPrograms: true,

  // Programs
  programsList: true,

  // Student Life
  clubsActivities: true,
  culturalActivities: true,
  annualEvents: true,
  educationalTours: true,

  // Achievements
  academicAchievements: true,
  sportsAchievements: true,
  awardsRecognitions: true,

  // Hostel
  hostelAvailable: true,
  hostelBoys: true,
  hostelGirls: true,
  hostelMess: true,

  // Transport
  transportAvailable: true,
  transportAreas: true,
  gpsTracking: true,
  totalVehicles: true,

  // Safety
  hasCCTV: true,
  hasGuards: true,
  hasMedicalRoom: true,
  hasFireSafety: true,
  hasVisitorMgmt: true,

  // Contact extras
  whatsapp: true,
  mapUrl: true,
  facebook: true,
  instagram: true,
  youtube: true,
  linkedin: true,
  socialLinks: true,
  admissionCoordinatorName: true,
  admissionPhone: true,
  admissionEmail: true,
  additionalPhones: true,
  admissionCoordinators: true,

  // Relations
  owner: { select: { name: true } },
  images: {
    select: { id: true, url: true, caption: true, category: true },
    orderBy: { createdAt: "asc" as const },
  },
  facilities: {
    select: {
      facility: { select: { id: true, name: true, icon: true } },
    },
  },
  boardResults: {
    select: {
      id: true,
      year: true,
      classLevel: true,
      passPercent: true,
      topperName: true,
      topperScore: true,
    },
    orderBy: [
      { year: "desc" as const },
      { classLevel: "asc" as const },
    ],
  },
  scholarships: {
    select: { id: true, name: true, eligibility: true, benefits: true },
  },
  faqs: {
    select: { id: true, question: true, answer: true },
  },
  downloads: {
    select: { id: true, label: true, url: true },
  },
  customFields: {
    select: {
      id: true,
      section: true,
      label: true,
      value: true,
      fieldType: true,
    },
  },
} satisfies Prisma.SchoolSelect;

export const adminSchoolListSelect = {
  id: true,
  name: true,
  slug: true,
  city: true,
  state: true,
  address: true,
  latitude: true,
  longitude: true,
  board: true,
  stateBoardName: true,
  schoolType: true,
  medium: true,
  mediumOther: true,
  classesFrom: true,
  classesTo: true,
  phone: true,
  email: true,
  website: true,
  description: true,
  status: true,
  isVisible: true,
  isFeatured: true,
  featuredUntil: true,
  createdAt: true,
  rejectionReason: true,
  totalStudents: true,
  establishedYear: true,
  admissionFee: true,
  tuitionFeeMonthly: true,
  totalAnnualFee: true,
  transportFee: true,
  hostelFee: true,
  logoUrl: true,
  owner: {
    select: { name: true, email: true },
  },
} satisfies Prisma.SchoolSelect;