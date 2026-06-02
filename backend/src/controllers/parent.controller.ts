import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { Errors } from "../utils/AppError";
import {
  addFavouriteForUser,
  getFavouritesForUser,
  parseFavouritesPagination,
  removeFavouriteForUser,
} from "../lib/favourites";
import {
  buildPaginationMeta,
  parseLimit,
  parsePage,
} from "../lib/pagination";
import { mapSchoolListItem } from "../lib/queries/schools";

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
    throw Errors.NotFound("User");
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
    throw Errors.BadRequest("Name is required");
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
  const { page, limit } = parseFavouritesPagination(req.query);
  const { rows, pagination } = await getFavouritesForUser(
    req.user!.id,
    page,
    limit
  );

  res.json({
    data: rows.map(mapFavouriteSchool),
    schools: rows.map((row) => mapSchoolListItem(row.school)),
    pagination,
  });
};

// POST /api/parent/favourites
export const addParentFavourite = async (req: AuthRequest, res: Response) => {
  const { schoolId } = req.body as { schoolId?: string };

  if (!schoolId) {
    throw Errors.BadRequest("schoolId is required");
  }

  const favourite = await addFavouriteForUser(req.user!.id, schoolId);

  res.status(200).json({ data: favourite });
};

// DELETE /api/parent/favourites?schoolId=
export const removeParentFavourite = async (req: AuthRequest, res: Response) => {
  const schoolId = String(req.query.schoolId ?? "").trim();

  if (!schoolId) {
    throw Errors.BadRequest("schoolId is required");
  }

  const removed = await removeFavouriteForUser(req.user!.id, schoolId);

  if (removed === 0) {
    throw Errors.NotFound("Favourite");
  }

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
