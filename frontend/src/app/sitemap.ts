import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/seo";
import { getAdminApiBase } from "@/lib/auth/admin-auth";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const BOARDS = ["CBSE", "ICSE", "UP_BOARD", "OTHER"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/schools`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/school-register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    // Legal & trust pages
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const stateRoutes: MetadataRoute.Sitemap = INDIAN_STATES.map((state) => ({
    url: `${siteUrl}/schools/state/${encodeURIComponent(state)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const boardRoutes: MetadataRoute.Sitemap = BOARDS.map((board) => ({
    url: `${siteUrl}/schools/board/${board.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  try {
    const response = await fetch(
      `${getAdminApiBase().replace(/\/$/, "")}/api/schools?status=APPROVED&limit=1000`,
      { next: { revalidate: 3600, tags: ["schools"] } },
    );

    if (!response.ok) {
      return [...staticRoutes, ...stateRoutes, ...boardRoutes];
    }

    const json = (await response.json()) as {
      data?: Array<{ slug: string; updatedAt?: string; city?: string }>;
      schools?: Array<{ slug: string; updatedAt?: string; city?: string }>;
    };

    const schools = json.data ?? json.schools ?? [];

    const schoolRoutes: MetadataRoute.Sitemap = schools.map((school) => ({
      url: `${siteUrl}/schools/${school.slug}`,
      lastModified: school.updatedAt ? new Date(school.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Distinct city routes from approved schools
    const cities = [...new Set(schools.map((s) => s.city).filter(Boolean))];
    const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
      url: `${siteUrl}/schools/city/${encodeURIComponent(city!)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...stateRoutes, ...boardRoutes, ...cityRoutes, ...schoolRoutes];
  } catch {
    return [...staticRoutes, ...stateRoutes, ...boardRoutes];
  }
}