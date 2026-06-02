import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getAdminApiBase } from "@/lib/admin-auth";

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
    const response = await fetch(
      `${getAdminApiBase().replace(/\/$/, "")}/api/schools?status=APPROVED&limit=1000`,
      { next: { revalidate: 3600, tags: ["schools"] } }
    );

    if (!response.ok) {
      return staticRoutes;
    }

    const json = (await response.json()) as {
      data?: Array<{ slug: string; updatedAt?: string }>;
      schools?: Array<{ slug: string; updatedAt?: string }>;
    };

    const schools = json.data ?? json.schools ?? [];

    const schoolRoutes: MetadataRoute.Sitemap = schools.map((school) => ({
      url: `${siteUrl}/schools/${school.slug}`,
      lastModified: school.updatedAt ? new Date(school.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...schoolRoutes];
  } catch {
    return staticRoutes;
  }
}
