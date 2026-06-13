import { Request, Response } from "express";
import prisma from "../lib/prisma";
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

// ── Related-model sync helpers ────────────────────────────────────────────────
// Each helper deletes rows not in the incoming list, then upserts the rest.
// They run inside the same transaction as the school update.

async function syncBoardResults(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  schoolId: string,
  items: BoardResultInput[]
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];

  await tx.boardResult.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  for (const item of items) {
    if (item.id) {
      await tx.boardResult.update({
        where: { id: item.id },
        data: {
          year: item.year,
          class10Pass: item.class10Pass ?? null,
          class12Pass: item.class12Pass ?? null,
          topperName: item.topperName ?? null,
          topperScore: item.topperScore ?? null,
        },
      });
    } else {
      await tx.boardResult.create({
        data: {
          schoolId,
          year: item.year,
          class10Pass: item.class10Pass ?? null,
          class12Pass: item.class12Pass ?? null,
          topperName: item.topperName ?? null,
          topperScore: item.topperScore ?? null,
        },
      });
    }
  }
}

async function syncScholarships(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  schoolId: string,
  items: ScholarshipInput[]
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];
  await tx.scholarship.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  for (const item of items) {
    if (item.id) {
      await tx.scholarship.update({
        where: { id: item.id },
        data: {
          name: item.name,
          eligibility: item.eligibility ?? null,
          benefits: item.benefits ?? null,
        },
      });
    } else {
      await tx.scholarship.create({
        data: {
          schoolId,
          name: item.name,
          eligibility: item.eligibility ?? null,
          benefits: item.benefits ?? null,
        },
      });
    }
  }
}

async function syncFAQs(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  schoolId: string,
  items: FAQInput[]
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];
  await tx.schoolFAQ.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  for (const item of items) {
    if (item.id) {
      await tx.schoolFAQ.update({
        where: { id: item.id },
        data: { question: item.question, answer: item.answer },
      });
    } else {
      await tx.schoolFAQ.create({
        data: { schoolId, question: item.question, answer: item.answer },
      });
    }
  }
}

async function syncDownloads(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  schoolId: string,
  items: DownloadInput[]
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];
  await tx.schoolDownload.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  for (const item of items) {
    if (item.id) {
      await tx.schoolDownload.update({
        where: { id: item.id },
        data: { label: item.label, url: item.url },
      });
    } else {
      await tx.schoolDownload.create({
        data: { schoolId, label: item.label, url: item.url },
      });
    }
  }
}

async function syncGalleryImages(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  schoolId: string,
  items: GalleryImageInput[]
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];
  await tx.schoolImage.deleteMany({
    where: { schoolId, id: { notIn: incomingIds } },
  });

  for (const item of items) {
    if (item.id) {
      await tx.schoolImage.update({
        where: { id: item.id },
        data: {
          url: item.url,
          caption: item.caption ?? null,
          category: item.category ?? null,
        },
      });
    } else {
      await tx.schoolImage.create({
        data: {
          schoolId,
          url: item.url,
          caption: item.caption ?? null,
          category: item.category ?? null,
        },
      });
    }
  }
}

async function syncCustomFields(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  schoolId: string,
  items: CustomFieldInput[],
  section?: string // if provided, only touch that section's fields
) {
  const incomingIds = items.map((i) => i.id).filter(Boolean) as string[];

  await tx.schoolCustomField.deleteMany({
    where: {
      schoolId,
      ...(section ? { section } : {}),
      id: { notIn: incomingIds },
    },
  });

  for (const item of items) {
    if (item.id) {
      await tx.schoolCustomField.update({
        where: { id: item.id },
        data: {
          section: item.section,
          label: item.label,
          value: item.value,
          fieldType: item.fieldType,
        },
      });
    } else {
      await tx.schoolCustomField.create({
        data: {
          schoolId,
          section: item.section,
          label: item.label,
          value: item.value,
          fieldType: item.fieldType,
        },
      });
    }
  }
}

// ── Extract scalar fields from validated input ────────────────────────────────
// Strips the relation arrays so we can pass only scalar fields to school.update()

function extractScalarFields(data: UpdateSchoolInput) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    boardResults,
    scholarships,
    faqs,
    downloads,
    images,
    customFields,
    ...scalars
  } = data;
  return scalars;
}

// ── GET /api/schools — public listing (offset or cursor pagination) ────────────

export const getSchools = async (req: Request, res: Response) => {
  const {
    search,
    city,
    board,
    schoolType,
    medium,
    page: pageQuery,
    limit: limitQuery,
    status,
    cursor,
    pagination,
  } = req.query;

  const limit = parseLimit(limitQuery, DEFAULT_SCHOOL_PAGE_LIMIT);
  const useCursorPagination = pagination === "cursor";

  const where = buildSchoolListWhere({
    status: status as string | undefined,
    search: search as string | undefined,
    city: city as string | undefined,
    board: typeof board === "string" ? [board] : (board as string[] | undefined),
    schoolType: schoolType as string | undefined,
    medium: medium as string | undefined,
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
      board: Array.isArray(board)
        ? (board as string[]).join(",")
        : (board as string),
      schoolType: schoolType as string,
      medium: medium as string,
    });

    const result = await withCache(cacheKey, CACHE_TTL.SCHOOL_LIST, async () => {
      const rows = await prisma.school.findMany({
        where: decodedCursor
          ? { AND: [where, buildSchoolCursorWhere(decodedCursor)] }
          : where,
        take: limit + 1,
        orderBy: schoolListOrderBy,
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
          nextCursor:
            hasMore && lastRow ? encodeSchoolCursor(lastRow) : null,
        },
      };
    });

    res.json(
      cursorPaginatedResponse(result.data, result.pagination, "schools")
    );
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
    board: Array.isArray(board)
      ? (board as string[]).join(",")
      : (board as string),
    schoolType: schoolType as string,
    medium: medium as string,
  });

  const result = await withCache(cacheKey, CACHE_TTL.SCHOOL_LIST, async () => {
    const [rows, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: limit,
        orderBy: schoolListOrderBy,
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
  const where = { status: "APPROVED" as const, ...(searchWhere ?? {}) };

  const cacheKey = buildCacheKey("schools:search", { query, limit });
  const schools = await withCache(cacheKey, CACHE_TTL.SCHOOL_LIST, () =>
    prisma.school.findMany({
      where,
      take: limit,
      orderBy: [{ name: "asc" }, { city: "asc" }],
      select: schoolSearchSelect,
    })
  );

  res.json({ data: schools });
};

// ── GET /api/schools/my-school — school owner dashboard ──────────────────────

export const getMySchool = async (req: AuthRequest, res: Response) => {
  const school = await prisma.school.findFirst({
    where: { ownerId: req.user!.id },
    select: {
      ...schoolDetailSelect,
      rejectionReason: true,
      // New relation includes
      customFields: true,
      boardResults: { orderBy: { year: "desc" } },
      scholarships: true,
      faqs: true,     // relation field name on School model — stays "faqs"
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
        boardResults: { orderBy: { year: "desc" } },
        scholarships: true,
        faqs: true,
        downloads: true,
      },
    })
  );

  if (!school) throw Errors.NotFound("School");

  if (school.status !== "APPROVED") {
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
  const data = sanitizeSchoolData(req.body as CreateSchoolInput);
  const slug = await generateSlug(data.name);

  const school = await prisma.school.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? null,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode ?? null,
      board: data.board,
      schoolType: data.schoolType,
      medium: data.medium,
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
      ownerId: req.user!.id,
    },
  });

  invalidateSchoolCache();
  res.status(201).json({ data: school });
};

// ── PATCH /api/schools/:id — update school ────────────────────────────────────
// Handles both scalar fields and related-model arrays in a single transaction.

export const updateSchool = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();
  if (!id) throw Errors.BadRequest("Invalid school identifier");

  const data = sanitizeSchoolData(req.body as UpdateSchoolInput);

  const existing = await prisma.school.findUnique({
    where: { id },
    select: { id: true, ownerId: true },
  });

  if (!existing) throw Errors.NotFound("School");

  if (
    existing.ownerId !== req.user!.id &&
    req.user!.role !== "ADMIN"
  ) {
    throw Errors.Forbidden("You do not have permission to update this school");
  }

  // School admins trigger re-review when they update their profile
  const statusReset =
    req.user!.role === "SCHOOL_ADMIN"
      ? { status: "PENDING" as const }
      : {};

  const scalars = extractScalarFields(data);

  const updated = await prisma.$transaction(async (tx) => {
    const school = await tx.school.update({
      where: { id },
      data: { ...scalars, ...statusReset },
    });

    if (data.boardResults !== undefined) {
      await syncBoardResults(tx, id, data.boardResults);
    }
    if (data.scholarships !== undefined) {
      await syncScholarships(tx, id, data.scholarships);
    }
    if (data.faqs !== undefined) {
      await syncFAQs(tx, id, data.faqs);
    }
    if (data.downloads !== undefined) {
      await syncDownloads(tx, id, data.downloads);
    }
    if (data.images !== undefined) {
      await syncGalleryImages(tx, id, data.images);
    }
    if (data.customFields !== undefined) {
      await syncCustomFields(tx, id, data.customFields);
    }

    return school;
  });

  invalidateSchoolCache();
  res.json({ data: updated });
};

// ── DELETE /api/schools/:id — admin only ──────────────────────────────────────

export const deleteSchool = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();
  if (!id) throw Errors.BadRequest("Invalid school identifier");

  await prisma.school.delete({ where: { id } });

  invalidateSchoolCache();
  res.json({ message: "School deleted successfully" });
};

// ── POST /api/schools/my-school/images ───────────────────────────────────────

export const addSchoolImage = async (req: AuthRequest, res: Response) => {
  const {
    url,
    caption,
    category,
  } = req.body as { url?: string; caption?: string | null; category?: string | null };

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
      where: { status: "APPROVED" },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    })
  );

  res.json({ data: cities.map((s) => s.city) });
};