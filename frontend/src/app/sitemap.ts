import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/schools`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/school-register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const schools = await prisma.school.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const schoolRoutes: MetadataRoute.Sitemap = schools.map((school) => ({
      url: `${siteUrl}/schools/${school.slug}`,
      lastModified: school.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...schoolRoutes];
  } catch {
    return staticRoutes;
  }
}
