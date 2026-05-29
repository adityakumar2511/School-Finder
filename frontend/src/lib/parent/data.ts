import prisma from "@/lib/prisma";

const schoolCardSelect = {
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
} as const;

export type ParentSchoolCard = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  board: string;
  schoolType: string;
  medium: string;
  classesFrom: number;
  classesTo: number;
  tuitionFeeMonthly: number | null;
  logoUrl: string | null;
  facilitiesCount?: number;
};

export function mapSchoolToCard(
  school: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    board: string;
    schoolType: string;
    medium: string;
    classesFrom: number;
    classesTo: number;
    tuitionFeeMonthly: number | null;
    logoUrl: string | null;
    _count?: { facilities: number };
  }
): ParentSchoolCard {
  return {
    ...school,
    facilitiesCount: school._count?.facilities,
  };
}

export async function getParentProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
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
}

export async function getParentDashboardData(userId: string) {
  const [user, favouritesCount, recentFavourites] = await Promise.all([
    getParentProfile(userId),
    prisma.favourite.count({ where: { parentId: userId } }),
    prisma.favourite.findMany({
      where: { parentId: userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { school: { select: schoolCardSelect } },
    }),
  ]);

  return {
    user,
    favouritesCount,
    recentSaved: recentFavourites.map((f) => mapSchoolToCard(f.school)),
  };
}

export async function getParentFavourites(
  userId: string,
  page: number,
  pageSize: number
) {
  const skip = (page - 1) * pageSize;

  const [total, favourites] = await Promise.all([
    prisma.favourite.count({ where: { parentId: userId } }),
    prisma.favourite.findMany({
      where: { parentId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { school: { select: schoolCardSelect } },
    }),
  ]);

  return {
    schools: favourites.map((f) => mapSchoolToCard(f.school)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
