import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import {
  buildPaginationMeta,
  parseLimit,
  parsePage,
} from "../lib/pagination";
import { mapSchoolListItem, schoolListSelect } from "../lib/queries/schools";

const parentSchoolSelect = {
  ...schoolListSelect,
} as const;

function mapFavouriteSchool(
  favourite: {
    id: string;
    createdAt: Date;
    school: Parameters<typeof mapSchoolListItem>[0];
  }
) {
  return {
    favouriteId: favourite.id,
    savedAt: favourite.createdAt,
    school: mapSchoolListItem(favourite.school),
  };
}

// GET /api/parent/profile
export const getParentProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  res.json({ data: user });
};

// PATCH /api/parent/profile
export const updateParentProfile = async (req: AuthRequest, res: Response) => {
  const { name, phone, image } = req.body as {
    name?: string;
    phone?: string | null;
    image?: string | null;
  };

  if (name !== undefined && typeof name === "string" && name.trim().length < 1) {
    throw new AppError(400, "Name is required");
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(image !== undefined ? { image } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  res.json({ success: true, data: user });
};

// GET /api/parent/favourites
export const getParentFavourites = async (req: AuthRequest, res: Response) => {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit, 6, 50);
  const skip = (page - 1) * limit;
  const where = { parentId: req.user!.id };

  const [rows, total] = await Promise.all([
    prisma.favourite.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        school: { select: parentSchoolSelect },
      },
    }),
    prisma.favourite.count({ where }),
  ]);

  res.json({
    data: rows.map(mapFavouriteSchool),
    schools: rows.map((row) => mapSchoolListItem(row.school)),
    pagination: buildPaginationMeta(total, page, limit),
  });
};

// POST /api/parent/favourites
export const addParentFavourite = async (req: AuthRequest, res: Response) => {
  const { schoolId } = req.body as { schoolId?: string };

  if (!schoolId) {
    throw new AppError(400, "schoolId is required");
  }

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, status: true },
  });

  if (!school || school.status !== "APPROVED") {
    throw new AppError(404, "School not found");
  }

  const favourite = await prisma.favourite.upsert({
    where: {
      parentId_schoolId: {
        parentId: req.user!.id,
        schoolId,
      },
    },
    update: {},
    create: {
      parentId: req.user!.id,
      schoolId,
    },
  });

  res.status(200).json({ data: favourite });
};

// DELETE /api/parent/favourites?schoolId=
export const removeParentFavourite = async (req: AuthRequest, res: Response) => {
  const schoolId = String(req.query.schoolId ?? "").trim();

  if (!schoolId) {
    throw new AppError(400, "schoolId is required");
  }

  const existing = await prisma.favourite.findUnique({
    where: {
      parentId_schoolId: {
        parentId: req.user!.id,
        schoolId,
      },
    },
  });

  if (!existing) {
    throw new AppError(404, "Favourite not found");
  }

  await prisma.favourite.delete({
    where: {
      parentId_schoolId: {
        parentId: req.user!.id,
        schoolId,
      },
    },
  });

  res.json({ success: true, message: "Favourite removed successfully" });
};

// GET /api/parent/inquiries
export const getParentInquiries = async (req: AuthRequest, res: Response) => {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit, 10, 50);
  const skip = (page - 1) * limit;
  const where = { parentId: req.user!.id };

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            board: true,
            logoUrl: true,
          },
        },
      },
    }),
    prisma.inquiry.count({ where }),
  ]);

  res.json({
    data: inquiries,
    pagination: buildPaginationMeta(total, page, limit),
  });
};
