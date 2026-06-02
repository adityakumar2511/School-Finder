import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { Errors } from "../utils/AppError";
import {
  addFavouriteForUser,
  removeFavouriteForUser,
} from "../lib/favourites";

export const LEGACY_FAVOURITES_DEPRECATION =
  "Use /api/parent/favourites instead";

export function setLegacyFavouritesDeprecationHeader(res: Response): void {
  res.setHeader("Deprecation", LEGACY_FAVOURITES_DEPRECATION);
}

// GET /api/favourites
export const getFavourites = async (req: AuthRequest, res: Response) => {
  const favourites = await prisma.favourite.findMany({
    where: { parentId: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      school: {
        select: {
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
          _count: { select: { facilities: true } },
        },
      },
    },
  });

  setLegacyFavouritesDeprecationHeader(res);
  res.json(favourites);
};

// POST /api/favourites
export const addFavourite = async (req: AuthRequest, res: Response) => {
  const { schoolId } = req.body;

  if (!schoolId) {
    throw Errors.BadRequest("schoolId is required");
  }

  const favourite = await addFavouriteForUser(req.user!.id, schoolId);

  setLegacyFavouritesDeprecationHeader(res);
  res.status(200).json(favourite);
};

// DELETE /api/favourites?schoolId=xxx
export const removeFavourite = async (req: AuthRequest, res: Response) => {
  const { schoolId } = req.query;

  if (!schoolId) {
    throw Errors.BadRequest("schoolId is required");
  }

  const removed = await removeFavouriteForUser(
    req.user!.id,
    schoolId as string
  );

  if (removed === 0) {
    throw Errors.NotFound("Favourite");
  }

  setLegacyFavouritesDeprecationHeader(res);
  res.json({ message: "Favourite removed successfully" });
};
