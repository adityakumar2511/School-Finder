import prisma from "./prisma";
import { Errors } from "../utils/AppError";
import {
  buildPaginationMeta,
  parseLimit,
  parsePage,
} from "./pagination";
import { schoolListSelect } from "./queries/schools";

export const favouriteSchoolSelect = {
  ...schoolListSelect,
} as const;

export async function addFavouriteForUser(
  parentId: string,
  schoolId: string
): Promise<{ id: string; schoolId: string; createdAt: Date }> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, status: true },
  });

  if (!school) {
    throw Errors.NotFound("School");
  }

  if (school.status !== "APPROVED") {
    throw Errors.BadRequest("Cannot favourite an unapproved school");
  }

  return prisma.favourite.upsert({
    where: {
      parentId_schoolId: { parentId, schoolId },
    },
    create: { parentId, schoolId },
    update: {},
    select: { id: true, schoolId: true, createdAt: true },
  });
}

export async function removeFavouriteForUser(
  parentId: string,
  schoolId: string
): Promise<number> {
  const result = await prisma.favourite.deleteMany({
    where: { parentId, schoolId },
  });

  return result.count;
}

export async function getFavouritesForUser(
  parentId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;
  const where = { parentId };

  const [rows, total] = await Promise.all([
    prisma.favourite.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        school: { select: favouriteSchoolSelect },
      },
    }),
    prisma.favourite.count({ where }),
  ]);

  return {
    rows,
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export function parseFavouritesPagination(query: {
  page?: unknown;
  limit?: unknown;
}) {
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit, 6, 50);
  return { page, limit };
}
