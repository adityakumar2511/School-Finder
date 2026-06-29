import { Request, Response } from "express";
import prisma from "../lib/prisma";
import type { Prisma } from "../../generated/prisma";
import { writeAuditLog } from "../lib/auditLog";
import { AuthRequest } from "../middleware/auth";
import { Errors } from "../utils/AppError";

import type {
  BoardResultInput,
  CreateSchoolInput,
  CustomFieldInput,
  DownloadInput,
  FAQInput,
  GalleryImageInput,
  ScholarshipInput,
  UpdateSchoolInput,
} from "../validators/school.validator";
import {
  buildPaginationMeta,
  cursorPaginatedResponse,
  DEFAULT_SCHOOL_PAGE_LIMIT,
  paginatedResponse,
  parseLimit,
  parsePage,
} from "../lib/pagination";
import {
  buildCacheKey,
  CACHE_TTL,
  invalidateSchoolCache,
  withCache,
} from "../lib/cache";
import {
  buildSchoolCursorWhere,
  buildSchoolListWhere,
  buildSchoolSearchWhere,
  decodeSchoolCursor,
  encodeSchoolCursor,
  mapSchoolListItem,
  schoolDetailSelect,
  schoolListOrderBy,
  schoolListSelect,
  schoolListSelectWithCreatedAt,
  schoolSearchSelect,
} from "../lib/queries/schools";
import { sanitizeSchoolData } from "../lib/sanitize";

// ── Transaction config (production-safe for Neon + pgbouncer) ─────────────────

const TX_OPTIONS: Parameters<typeof prisma.$transaction>[1] = {
  maxWait: 15000,   // 15s max wait for a connection from pool
  timeout: 60000,   // 60s total transaction time
};

// ── Slug helpers ──────────────────────────────────────────────────────────────

const slugify = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const generateSlug = async (name: string): Promise<string> => {
  const base = slugify(name);
  if (!base) throw Errors.BadRequest("School name is required");

  let slug = base;
  let count = 1;

  while (await prisma.school.findUnique({ where: { slug } })) {
    slug = `${base}-${count}`;
    count++;
  }

  return slug;
};

// ── Map helpers ───────────────────────────────────────────────────────────────

function toFiniteNumber(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

// ── Related-model sync helpers (batch-optimized) ──────────────────────────────

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function syncBoardResults(
  tx: TxClient,
  schoolId: string,
  items: BoardResultInput[],
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];

  await tx.boardResult.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  const toUpdate = items.filter((i) => i.id);
  const toCreate = items.filter((i) => !i.id);

  // Parallel updates
  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((item) =>
        tx.boardResult.update({
          where: { id: item.id! },
          data: {
            year: item.year,
            classLevel: item.classLevel,
            passPercent: item.passPercent ?? null,
            topperName: item.topperName ?? null,
            topperScore: item.topperScore ?? null,
          },
        })
      )
    );
  }

  // Batch insert
  if (toCreate.length > 0) {
    await tx.boardResult.createMany({
      data: toCreate.map((item) => ({
        schoolId,
        year: item.year,
        classLevel: item.classLevel,
        passPercent: item.passPercent ?? null,
        topperName: item.topperName ?? null,
        topperScore: item.topperScore ?? null,
      })),
    });
  }
}

async function syncScholarships(
  tx: TxClient,
  schoolId: string,
  items: ScholarshipInput[],
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];

  await tx.scholarship.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  const toUpdate = items.filter((i) => i.id);
  const toCreate = items.filter((i) => !i.id);

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((item) =>
        tx.scholarship.update({
          where: { id: item.id! },
          data: {
            name: item.name,
            eligibility: item.eligibility ?? null,
            benefits: item.benefits ?? null,
          },
        })
      )
    );
  }

  if (toCreate.length > 0) {
    await tx.scholarship.createMany({
      data: toCreate.map((item) => ({
        schoolId,
        name: item.name,
        eligibility: item.eligibility ?? null,
        benefits: item.benefits ?? null,
      })),
    });
  }
}

async function syncFAQs(
  tx: TxClient,
  schoolId: string,
  items: FAQInput[],
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];

  await tx.schoolFAQ.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  const toUpdate = items.filter((i) => i.id);
  const toCreate = items.filter((i) => !i.id);

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((item) =>
        tx.schoolFAQ.update({
          where: { id: item.id! },
          data: { question: item.question, answer: item.answer },
        })
      )
    );
  }

  if (toCreate.length > 0) {
    await tx.schoolFAQ.createMany({
      data: toCreate.map((item) => ({
        schoolId,
        question: item.question,
        answer: item.answer,
      })),
    });
  }
}

async function syncDownloads(
  tx: TxClient,
  schoolId: string,
  items: DownloadInput[],
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];

  await tx.schoolDownload.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  const toUpdate = items.filter((i) => i.id);
  const toCreate = items.filter((i) => !i.id);

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((item) =>
        tx.schoolDownload.update({
          where: { id: item.id! },
          data: { label: item.label, url: item.url },
        })
      )
    );
  }

  if (toCreate.length > 0) {
    await tx.schoolDownload.createMany({
      data: toCreate.map((item) => ({
        schoolId,
        label: item.label,
        url: item.url,
      })),
    });
  }
}

async function syncGalleryImages(
  tx: TxClient,
  schoolId: string,
  items: GalleryImageInput[],
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];

  await tx.schoolImage.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  const toUpdate = items.filter((i) => i.id);
  const toCreate = items.filter((i) => !i.id);

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((item) =>
        tx.schoolImage.update({
          where: { id: item.id! },
          data: {
            url: item.url,
            caption: item.caption ?? null,
            category: item.category ?? null,
          },
        })
      )
    );
  }

  if (toCreate.length > 0) {
    await tx.schoolImage.createMany({
      data: toCreate.map((item) => ({
        schoolId,
        url: item.url,
        caption: item.caption ?? null,
        category: item.category ?? null,
      })),
    });
  }
}

async function syncCustomFields(
  tx: TxClient,
  schoolId: string,
  items: CustomFieldInput[],
  section?: string,
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];

  await tx.schoolCustomField.deleteMany({
    where: {
      schoolId,
      ...(section ? { section } : {}),
      id: { notIn: incomingIds },
    },
  });

  const toUpdate = items.filter((i) => i.id);
  const toCreate = items.filter((i) => !i.id);

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((item) =>
        tx.schoolCustomField.update({
          where: { id: item.id! },
          data: {
            section: item.section,
            label: item.label,
            value: item.value,
            fieldType: item.fieldType,
          },
        })
      )
    );
  }

  if (toCreate.length > 0) {
    await tx.schoolCustomField.createMany({
      data: toCreate.map((item) => ({
        schoolId,
        section: item.section,
        label: item.label,
        value: item.value,
        fieldType: item.fieldType,
      })),
    });
  }
}

// ── Normalize helpers ─────────────────────────────────────────────────────────

function normalizeCustomGroups(
  value: unknown,
): Prisma.InputJsonObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const cleaned: Record<string, Prisma.InputJsonValue> = {};

  for (const [groupName, items] of Object.entries(value)) {
    if (!Array.isArray(items)) continue;

    const validItems = items
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

    if (validItems.length > 0) {
      cleaned[groupName] = validItems;
    }
  }

  return Object.keys(cleaned).length > 0
    ? (cleaned as Prisma.InputJsonObject)
    : undefined;
}

function normalizeAdditionalPhones(
  value: unknown,
): Prisma.InputJsonValue | undefined {
  if (!Array.isArray(value)) return undefined;

  const cleaned = value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const number =
        typeof record.number === "string" ? record.number.trim() : "";
      const label = typeof record.label === "string" ? record.label.trim() : "";

      if (!number && !label) return null;

      return { number, label: label || "Other" };
    })
    .filter((item): item is { number: string; label: string } => item !== null);

  return cleaned.length > 0
    ? (cleaned as unknown as Prisma.InputJsonValue)
    : undefined;
}

function normalizeAdmissionCoordinators(
  value: unknown,
): Prisma.InputJsonValue | undefined {
  if (!Array.isArray(value)) return undefined;

  const cleaned = value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name.trim() : "";
      const phone = typeof record.phone === "string" ? record.phone.trim() : "";
      const email = typeof record.email === "string" ? record.email.trim() : "";
      const designation =
        typeof record.designation === "string"
          ? record.designation.trim()
          : "";

      if (!name && !phone && !email && !designation) return null;

      return { name, phone, email, designation };
    })
    .filter(
      (
        item,
      ): item is {
        name: string;
        phone: string;
        email: string;
        designation: string;
      } => item !== null,
    );

  return cleaned.length > 0
    ? (cleaned as unknown as Prisma.InputJsonValue)
    : undefined;
}

function normalizeSocialLinks(
  value: unknown,
): Prisma.InputJsonValue | undefined {
  if (!Array.isArray(value)) return undefined;

  const cleaned = value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const platform =
        typeof record.platform === "string" ? record.platform.trim() : "";
      const url = typeof record.url === "string" ? record.url.trim() : "";

      if (!platform && !url) return null;

      return { platform, url };
    })
    .filter(
      (item): item is { platform: string; url: string } => item !== null,
    );

  return cleaned.length > 0
    ? (cleaned as unknown as Prisma.InputJsonValue)
    : undefined;
}

// ── Manual field fallback helpers ─────────────────────────────────────────────

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readInputField(
  rawBody: unknown,
  sanitizedData: unknown,
  key: string,
  section?: string,
): unknown {
  if (isPlainRecord(sanitizedData) && sanitizedData[key] !== undefined) {
    return sanitizedData[key];
  }

  if (!isPlainRecord(rawBody)) {
    return undefined;
  }

  if (rawBody[key] !== undefined) {
    return rawBody[key];
  }

  if (section && isPlainRecord(rawBody[section])) {
    return rawBody[section][key];
  }

  return undefined;
}

function toTrimmedStringOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toIntOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return null;
  return Math.trunc(numberValue);
}

function buildManualSchoolFields(
  rawBody: unknown,
  data: UpdateSchoolInput,
): Prisma.SchoolUpdateInput {
  const manualFields: Prisma.SchoolUpdateInput = {};

  const board = toTrimmedStringOrNull(
    readInputField(rawBody, data, "board", "basicInfo"),
  );
  const stateBoardName = toTrimmedStringOrNull(
    readInputField(rawBody, data, "stateBoardName", "basicInfo"),
  );

  if (board) {
    manualFields.stateBoardName =
      board === "STATE_BOARD" ? stateBoardName : null;
  } else if (stateBoardName !== null) {
    manualFields.stateBoardName = stateBoardName;
  }

  const medium = toTrimmedStringOrNull(
    readInputField(rawBody, data, "medium", "basicInfo"),
  );
  const mediumOther =
    toTrimmedStringOrNull(
      readInputField(rawBody, data, "mediumOther", "basicInfo"),
    ) ??
    toTrimmedStringOrNull(
      readInputField(rawBody, data, "otherMedium", "basicInfo"),
    );

  if (medium) {
    manualFields.mediumOther = medium === "OTHER" ? mediumOther : null;
  } else if (mediumOther !== null) {
    manualFields.mediumOther = mediumOther;
  }

  const earlyChildhoodFee = readInputField(
    rawBody,
    data,
    "earlyChildhoodFee",
    "fees",
  );

  if (earlyChildhoodFee !== undefined) {
    manualFields.earlyChildhoodFee = toIntOrNull(earlyChildhoodFee);
  }

  return manualFields;
}

// ── Extract scalar fields from validated input ────────────────────────────────

function extractScalarFields(data: UpdateSchoolInput) {
  const {
    boardResults,
    scholarships,
    faqs,
    downloads,
    images,
    customFields,
    facilityCustomGroups,
    sportsCustomGroups,
    additionalPhones,
    admissionCoordinators,
    socialLinks,
    ...scalars
  } = data as UpdateSchoolInput & { socialLinks?: unknown };

  return scalars;
}

// ── GET /api/schools — public listing ─────────────────────────────────────────

export const getSchools = async (req: Request, res: Response) => {
  const {
    search, city, state, board, schoolType, medium, schoolCategory,  managementType, page: pageQuery, limit: limitQuery, status, cursor, pagination, featured,
  } = req.query;

  const limit = parseLimit(limitQuery, DEFAULT_SCHOOL_PAGE_LIMIT);
  const useCursorPagination = pagination === "cursor";

  const where = buildSchoolListWhere({
    status: status as string | undefined,
    search: search as string | undefined,
    city: city as string | undefined,
    state: state as string | undefined,
    board: typeof board === "string" ? [board] : (board as string[] | undefined),
    schoolType: schoolType as string | undefined,
    medium: medium as string | undefined,
    managementType: managementType as string | undefined,
    featured: featured as string | undefined,
    schoolCategory: schoolCategory as string | undefined,
  });

  if (useCursorPagination) {
    const cursorValue = typeof cursor === "string" ? cursor.trim() : "";
    const decodedCursor = cursorValue ? decodeSchoolCursor(cursorValue) : null;

    if (cursorValue && !decodedCursor) {
      throw Errors.BadRequest("Invalid pagination cursor");
    }

    const cacheKey = buildCacheKey("schools:list:cursor", {
      limit,
      cursor: cursorValue,
      status: String(where.status),
      search: search as string,
      city: city as string,
      state: state as string,
      board: Array.isArray(board)
        ? (board as string[]).join(",")
        : (board as string),
      schoolType: schoolType as string,
      medium: medium as string,
      managementType: managementType as string,
      featured: featured as string,
    });

    const result = await withCache(cacheKey, CACHE_TTL.SCHOOL_LIST, async () => {
      const rows = await prisma.school.findMany({
        where: decodedCursor
          ? { AND: [where, buildSchoolCursorWhere(decodedCursor)] }
          : where,
        take: limit + 1,
        orderBy: [{ isFeatured: "desc" }, ...schoolListOrderBy],
        select: schoolListSelectWithCreatedAt,
      });

      const hasMore = rows.length > limit;
      const pageRows = hasMore ? rows.slice(0, limit) : rows;
      const lastRow = pageRows[pageRows.length - 1];

      return {
        data: pageRows.map(mapSchoolListItem),
        pagination: {
          limit,
          hasMore,
          nextCursor: hasMore && lastRow ? encodeSchoolCursor(lastRow) : null,
        },
      };
    });

    res.json(cursorPaginatedResponse(result.data, result.pagination, "schools"));
    return;
  }

  const page = parsePage(pageQuery);
  const skip = (page - 1) * limit;

  const cacheKey = buildCacheKey("schools:list", {
    page,
    limit,
    status: String(where.status),
    search: search as string,
    city: city as string,
    state: state as string,
    board: Array.isArray(board)
      ? (board as string[]).join(",")
      : (board as string),
    schoolType: schoolType as string,
    medium: medium as string,
    managementType: managementType as string,
    featured: featured as string,
  });

  const result = await withCache(cacheKey, CACHE_TTL.SCHOOL_LIST, async () => {
    const [rows, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, ...schoolListOrderBy],
        select: schoolListSelect,
      }),
      prisma.school.count({ where }),
    ]);

    return {
      data: rows.map(mapSchoolListItem),
      pagination: buildPaginationMeta(total, page, limit),
    };
  });

  res.json(paginatedResponse(result.data, result.pagination, "schools"));
};

// ── GET /api/schools/search — lightweight autocomplete ────────────────────────

export const searchSchools = async (req: Request, res: Response) => {
  const query = String(req.query.q ?? req.query.search ?? "").trim();
  const limit = parseLimit(req.query.limit, 10, 20);

  if (query.length < 2) {
    res.json({ data: [] });
    return;
  }

  const searchWhere = buildSchoolSearchWhere(query);
  const where = {
    status: "APPROVED" as const,
    isVisible: true,
    ...(searchWhere ?? {}),
  };

  const cacheKey = buildCacheKey("schools:search", { query, limit });

  const schools = await withCache(cacheKey, CACHE_TTL.SCHOOL_LIST, () =>
    prisma.school.findMany({
      where,
      take: limit,
      orderBy: [{ name: "asc" }, { city: "asc" }],
      select: schoolSearchSelect,
    }),
  );

  res.json({ data: schools });
};

// ── GET /api/schools/nearby?lat=&lng=&radius=&limit= ──────────────────────────

export const getNearbySchools = async (req: Request, res: Response) => {
  const lat = toFiniteNumber(req.query.lat);
  const lng = toFiniteNumber(req.query.lng ?? req.query.lon);
  const radiusKmRaw = toFiniteNumber(req.query.radius);
  const limit = parseLimit(req.query.limit, 10, 50);
  const excludeId =
    typeof req.query.excludeId === "string" ? req.query.excludeId.trim() : "";

  if (lat === null || lat < -90 || lat > 90) {
    throw Errors.BadRequest("Valid lat query parameter is required");
  }

  if (lng === null || lng < -180 || lng > 180) {
    throw Errors.BadRequest("Valid lng query parameter is required");
  }

  const radiusKm =
    radiusKmRaw === null ? 10 : Math.min(Math.max(radiusKmRaw, 1), 100);

  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180) || 1);

  const cacheKey = buildCacheKey("schools:nearby", {
    lat,
    lng,
    radiusKm,
    limit,
    excludeId,
  });

  const nearbySchools = await withCache(
    cacheKey,
    CACHE_TTL.SCHOOL_LIST,
    async () => {
      const rows = await prisma.school.findMany({
        where: {
          status: "APPROVED",
          isVisible: true,
          latitude: {
            not: null,
            gte: lat - latDelta,
            lte: lat + latDelta,
          },
          longitude: {
            not: null,
            gte: lng - lngDelta,
            lte: lng + lngDelta,
          },
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        take: Math.max(limit * 4, limit),
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        select: schoolListSelect,
      });

      return rows
        .map((school) => {
          const distanceKm =
            typeof school.latitude === "number" &&
            typeof school.longitude === "number"
              ? calculateDistanceKm(lat, lng, school.latitude, school.longitude)
              : null;

          return {
            ...mapSchoolListItem(school),
            distanceKm:
              distanceKm === null ? null : Number(distanceKm.toFixed(2)),
          };
        })
        .filter(
          (school) =>
            typeof school.distanceKm === "number" &&
            school.distanceKm <= radiusKm,
        )
        .sort((a, b) => {
          const distanceA =
            typeof a.distanceKm === "number" ? a.distanceKm : Number.MAX_VALUE;
          const distanceB =
            typeof b.distanceKm === "number" ? b.distanceKm : Number.MAX_VALUE;

          if (distanceA !== distanceB) return distanceA - distanceB;
          return Number(b.isFeatured) - Number(a.isFeatured);
        })
        .slice(0, limit);
    },
  );

  res.json({
    data: nearbySchools,
    schools: nearbySchools,
    meta: {
      lat,
      lng,
      radiusKm,
      limit,
      count: nearbySchools.length,
    },
  });
};

// ── GET /api/schools/my-school — school owner dashboard ──────────────────────

export const getMySchool = async (req: AuthRequest, res: Response) => {
  const school = await prisma.school.findFirst({
    where: { ownerId: req.user!.id },
    select: {
      ...schoolDetailSelect,
      rejectionReason: true,
      customFields: true,
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
      scholarships: true,
      faqs: true,
      downloads: true,
    },
  });

  if (!school) throw Errors.NotFound("School");

  res.json({ data: school });
};

// ── GET /api/schools/:slug — public detail ────────────────────────────────────

export const getSchool = async (req: AuthRequest, res: Response) => {
  const slug = String(req.params.slug).trim();
  if (!slug) throw Errors.BadRequest("Invalid school identifier");

  const cacheKey = buildCacheKey("schools:detail", { slug });

  const school = await withCache(cacheKey, CACHE_TTL.SCHOOL_DETAIL, () =>
    prisma.school.findUnique({
      where: { slug },
      select: {
        ...schoolDetailSelect,
        customFields: true,
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
        scholarships: true,
        faqs: true,
        downloads: true,
      },
    }),
  );

  if (!school) throw Errors.NotFound("School");

  if (school.status !== "APPROVED" || !school.isVisible) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || (school.ownerId !== userId && userRole !== "ADMIN")) {
      throw Errors.NotFound("School");
    }
  }

  res.json({ data: school, school });
};

// ── POST /api/schools — create school ────────────────────────────────────────

export const createSchool = async (req: AuthRequest, res: Response) => {
  const rawBody = req.body as Record<string, unknown>;
  const data = sanitizeSchoolData(req.body as CreateSchoolInput);
  const slug = await generateSlug(data.name);

  const mediumOther =
    toTrimmedStringOrNull(readInputField(rawBody, data, "mediumOther", "basicInfo")) ??
    toTrimmedStringOrNull(readInputField(rawBody, data, "otherMedium", "basicInfo"));

  const stateBoardName = toTrimmedStringOrNull(
    readInputField(rawBody, data, "stateBoardName", "basicInfo"),
  );

  const school = await prisma.school.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? null,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      board: data.board,
      stateBoardName: data.board === "STATE_BOARD" ? stateBoardName : null,
      schoolType: data.schoolType,
      medium: data.medium,
      mediumOther: data.medium === "OTHER" ? mediumOther : null,
      classesFrom: data.classesFrom,
      classesTo: data.classesTo,
      phone: data.phone,
      email: data.email ?? null,
      website: data.website ?? null,
      logoUrl: data.logoUrl ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      admissionFee: data.admissionFee ?? null,
      tuitionFeeMonthly: data.tuitionFeeMonthly ?? null,
      totalAnnualFee: data.totalAnnualFee ?? null,
      transportFee: data.transportFee ?? null,
      hostelFee: data.hostelFee ?? null,
      totalStudents: data.totalStudents ?? null,
      establishedYear: data.establishedYear ?? null,
      status: "PENDING",
      owner: {
        connect: { id: req.user!.id },
      },
    },
  });

  invalidateSchoolCache();

  res.status(201).json({ data: school });
};

// ── PATCH /api/schools/:id — update school ────────────────────────────────────

export const updateSchool = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();
  if (!id) throw Errors.BadRequest("Invalid school identifier");

  const rawBody = req.body as Record<string, unknown>;
  const data = sanitizeSchoolData(req.body as UpdateSchoolInput);

  const existing = await prisma.school.findUnique({
    where: { id },
    select: { id: true, ownerId: true },
  });

  if (!existing) throw Errors.NotFound("School");

  if (existing.ownerId !== req.user!.id && req.user!.role !== "ADMIN") {
    throw Errors.Forbidden("You do not have permission to update this school");
  }

  const statusReset =
    req.user!.role === "SCHOOL_ADMIN" ? { status: "PENDING" as const } : {};

  const scalars = extractScalarFields(data);
  const manualFields = buildManualSchoolFields(rawBody, data);

  const jsonFields: Prisma.SchoolUpdateInput = {};

  const facilityCustomGroups = normalizeCustomGroups(data.facilityCustomGroups);
  if (facilityCustomGroups !== undefined) {
    jsonFields.facilityCustomGroups = facilityCustomGroups;
  }

  const sportsCustomGroups = normalizeCustomGroups(data.sportsCustomGroups);
  if (sportsCustomGroups !== undefined) {
    jsonFields.sportsCustomGroups = sportsCustomGroups;
  }

  const additionalPhones = normalizeAdditionalPhones(
    readInputField(rawBody, data, "additionalPhones", "contact"),
  );
  if (additionalPhones !== undefined) {
    jsonFields.additionalPhones = additionalPhones;
  }

  const admissionCoordinators = normalizeAdmissionCoordinators(
    readInputField(rawBody, data, "admissionCoordinators", "contact"),
  );
  if (admissionCoordinators !== undefined) {
    jsonFields.admissionCoordinators = admissionCoordinators;
  }

  const socialLinks = normalizeSocialLinks(
    readInputField(rawBody, data, "socialLinks", "contact"),
  );
  if (socialLinks !== undefined) {
    jsonFields.socialLinks = socialLinks;
  }

  // All sync operations run in parallel outside transaction where possible,
  // then commit atomically. This minimises time spent inside the transaction.
  const updated = await prisma.$transaction(async (tx) => {
    const school = await tx.school.update({
      where: { id },
      data: {
        ...scalars,
        ...manualFields,
        ...jsonFields,
        ...statusReset,
      } as Prisma.SchoolUpdateInput,
    });

    // Run all independent sync operations in parallel inside the transaction
    await Promise.all([
      data.boardResults !== undefined
        ? syncBoardResults(tx, id, data.boardResults)
        : Promise.resolve(),
      data.scholarships !== undefined
        ? syncScholarships(tx, id, data.scholarships)
        : Promise.resolve(),
      data.faqs !== undefined
        ? syncFAQs(tx, id, data.faqs)
        : Promise.resolve(),
      data.downloads !== undefined
        ? syncDownloads(tx, id, data.downloads)
        : Promise.resolve(),
      data.images !== undefined
        ? syncGalleryImages(tx, id, data.images)
        : Promise.resolve(),
      data.customFields !== undefined
        ? syncCustomFields(tx, id, data.customFields)
        : Promise.resolve(),
    ]);

    return school;
  }, TX_OPTIONS);

  invalidateSchoolCache();

  res.json({ data: updated });
};

// ── DELETE /api/schools/:id — admin only ──────────────────────────────────────

export const deleteSchool = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();
  if (!id) throw Errors.BadRequest("Invalid school identifier");

  const school = await prisma.school.findUnique({
    where: { id },
    select: { name: true },
  });

  await prisma.school.delete({ where: { id } });

  invalidateSchoolCache();

  await writeAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: "SCHOOL_DELETE",
    targetType: "SCHOOL",
    targetId: id,
    metadata: { schoolName: school?.name },
  });

  res.json({ message: "School deleted successfully" });
};

// ── POST /api/schools/my-school/images ───────────────────────────────────────

export const addSchoolImage = async (req: AuthRequest, res: Response) => {
  const {
    url,
    caption,
    category,
  } = req.body as {
    url?: string;
    caption?: string | null;
    category?: string | null;
  };

  if (!url?.trim()) throw Errors.BadRequest("Image URL is required");

  const school = await prisma.school.findFirst({
    where: { ownerId: req.user!.id },
    select: { id: true },
  });

  if (!school) throw Errors.NotFound("School");

  const image = await prisma.schoolImage.create({
    data: {
      schoolId: school.id,
      url: url.trim(),
      caption: caption?.trim() || null,
      category: category?.trim() || null,
    },
  });

  invalidateSchoolCache();

  res.status(201).json({ data: image });
};

// ── DELETE /api/schools/images/:id ───────────────────────────────────────────

export const deleteSchoolImage = async (req: AuthRequest, res: Response) => {
  const imageId = String(req.params.id).trim();

  const image = await prisma.schoolImage.findUnique({
    where: { id: imageId },
    include: { school: { select: { ownerId: true } } },
  });

  if (!image || image.school.ownerId !== req.user!.id) {
    throw Errors.NotFound("Image");
  }

  await prisma.schoolImage.delete({ where: { id: imageId } });

  invalidateSchoolCache();

  res.json({ message: "Image deleted successfully" });
};

// ── GET /api/schools/cities — distinct approved cities ────────────────────────

export const getCities = async (_req: Request, res: Response) => {
  const cacheKey = buildCacheKey("schools:cities", {});

  const cities = await withCache(cacheKey, CACHE_TTL.SCHOOL_LIST, () =>
    prisma.school.findMany({
      where: { status: "APPROVED", isVisible: true },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
  );

  res.json({ data: cities.map((s) => s.city) });
};