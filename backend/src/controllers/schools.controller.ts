import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import type { CreateSchoolInput, UpdateSchoolInput } from "../validators/school.validator";
import {
  buildPaginationMeta,
  DEFAULT_SCHOOL_PAGE_LIMIT,
  paginatedResponse,
  parseLimit,
  parsePage,
} from "../lib/pagination";
import { buildCacheKey, withCache } from "../lib/cache";
import {
  buildSchoolSearchWhere,
  mapSchoolListItem,
  schoolDetailSelect,
  schoolListSelect,
} from "../lib/queries/schools";

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
  if (!base) {
    throw new AppError(400, "School name is required");
  }

  let slug = base;
  let count = 1;

  while (await prisma.school.findUnique({ where: { slug } })) {
    slug = `${base}-${count}`;
    count++;
  }

  return slug;
};

// GET /api/schools — public listing
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
  } = req.query;

  const page = parsePage(pageQuery);
  const limit = parseLimit(limitQuery, DEFAULT_SCHOOL_PAGE_LIMIT);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: status || "APPROVED",
  };

  const searchWhere = buildSchoolSearchWhere(search as string | undefined);
  if (searchWhere?.OR) {
    where.OR = searchWhere.OR;
  }

  if (city) where.city = { contains: city as string, mode: "insensitive" };
  if (board) where.board = board;
  if (schoolType) where.schoolType = schoolType;
  if (medium) where.medium = medium;

  const cacheKey = buildCacheKey("schools:list", {
    page,
    limit,
    status: String(where.status),
    search: search as string,
    city: city as string,
    board: board as string,
    schoolType: schoolType as string,
    medium: medium as string,
  });

  const result = await withCache(
    cacheKey,
    async () => {
      const [rows, total] = await Promise.all([
        prisma.school.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: schoolListSelect,
        }),
        prisma.school.count({ where }),
      ]);

      return {
        data: rows.map(mapSchoolListItem),
        pagination: buildPaginationMeta(total, page, limit),
      };
    },
    { ttlSeconds: 60, namespace: "schools" }
  );

  res.json(paginatedResponse(result.data, result.pagination, "schools"));
};

// GET /api/schools/my-school — owner dashboard
export const getMySchool = async (req: AuthRequest, res: Response) => {
  const school = await prisma.school.findFirst({
    where: { ownerId: req.user!.id },
    select: {
      ...schoolDetailSelect,
      rejectionReason: true,
    },
  });

  if (!school) {
    throw new AppError(404, "School not found");
  }

  res.json({ data: school });
};

// GET /api/schools/:slug — public detail
export const getSchool = async (req: AuthRequest, res: Response) => {
  const slug = String(req.params.slug).trim();

  if (!slug) {
    throw new AppError(400, "Invalid school identifier");
  }

  const cacheKey = buildCacheKey("schools:detail", { slug });

  const school = await withCache(
    cacheKey,
    () =>
      prisma.school.findUnique({
        where: { slug },
        select: schoolDetailSelect,
      }),
    { ttlSeconds: 120, namespace: "schools" }
  );

  if (!school) {
    throw new AppError(404, "School not found");
  }

  if (school.status !== "APPROVED") {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || (school.ownerId !== userId && userRole !== "ADMIN")) {
      throw new AppError(404, "School not found");
    }
  }

  res.json({ data: school, school });
};

// POST /api/schools — create school
export const createSchool = async (req: AuthRequest, res: Response) => {
  const data = req.body as CreateSchoolInput;
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

  res.status(201).json({ data: school });
};

// PATCH /api/schools/:id — update school
export const updateSchool = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();
  const data = req.body as UpdateSchoolInput;

  if (!id) {
    throw new AppError(400, "Invalid school identifier");
  }

  const school = await prisma.school.findUnique({
    where: { id },
    select: { id: true, ownerId: true },
  });

  if (!school) {
    throw new AppError(404, "School not found");
  }

  if (school.ownerId !== req.user!.id && req.user!.role !== "ADMIN") {
    throw new AppError(403, "You do not have permission to update this school");
  }

  const statusReset =
    req.user!.role === "SCHOOL_ADMIN" ? { status: "PENDING" as const } : {};

  const updated = await prisma.school.update({
    where: { id },
    data: { ...data, ...statusReset },
  });

  res.json({ data: updated });
};

// DELETE /api/schools/:id — admin only
export const deleteSchool = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();

  if (!id) {
    throw new AppError(400, "Invalid school identifier");
  }

  await prisma.school.delete({ where: { id } });

  res.json({ message: "School deleted successfully" });
};
