import type { Metadata } from "next";

const SITE_NAME = "Lakshya One";

export const siteConfig = {
  name: SITE_NAME,
  title: "Lakshya One — Find and Compare Schools Near You",
  description:
    "Lakshya One helps parents discover, compare, and connect with schools while helping schools build a trusted digital presence online.",
  keywords: [
    "schools near me",
    "CBSE schools",
    "ICSE schools",
    "state board schools",
    "school admission",
    "best schools in Prayagraj",
    "school comparison",
    "compare schools",
    "school listing platform",
    "Lakshya One",
  ],
  locale: "en_IN",
  twitterHandle: "@lakshyaone",
};

export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";

  if (url.startsWith("http")) {
    return url.replace(/\/$/, "");
  }

  return `https://${url.replace(/\/$/, "")}`;
}

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  image?: string | null;
  noIndex?: boolean;
};

export function buildPageMetadata(options: BuildMetadataOptions = {}): Metadata {
  const siteUrl = getSiteUrl();
  const path = options.path ?? "";
  const canonical = `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const title = options.title ?? siteConfig.title;
  const description = options.description ?? siteConfig.description;
  const image = options.image ?? undefined;
  const keywords = options.keywords ?? siteConfig.keywords;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords,
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical,
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
      creator: siteConfig.twitterHandle,
    },
  };
}

export const rootMetadata: Metadata = {
  ...buildPageMetadata(),
  title: {
    default: siteConfig.title,
    template: `%s | ${SITE_NAME}`,
  },
};

const BOARD_LABEL: Record<string, string> = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  IB: "IB",
  IGCSE: "IGCSE",
  NIOS: "NIOS",
  STATE_BOARD: "State Board",
  UP_BOARD: "UP Board",
  OTHER: "Board-affiliated",
};

export type SchoolSeoInput = {
  name: string;
  slug: string;
  description: string | null;
  city: string;
  state: string;
  address: string;
  pincode?: string | null;
  board: string;
  phone: string;
  website?: string | null;
  logoUrl?: string | null;
  classesFrom: number;
  classesTo: number;
};

export function buildSchoolMetadata(school: SchoolSeoInput): Metadata {
  const boardLabel = BOARD_LABEL[school.board] ?? school.board;

  const title = `${school.name} — ${boardLabel} School in ${school.city}`;

  const description =
    school.description?.slice(0, 160) ||
    `${school.name} is a ${boardLabel} school in ${school.city}, ${school.state}. Classes ${school.classesFrom} to ${school.classesTo}. View fees, facilities, and contact details on Lakshya One.`;

  return buildPageMetadata({
    title,
    description,
    path: `/schools/${school.slug}`,
    keywords: [
      school.name,
      `${school.name} ${school.city}`,
      `${boardLabel} school ${school.city}`,
      `schools in ${school.city}`,
      `best schools in ${school.city}`,
      "school admission",
      "Lakshya One",
    ],
    image: school.logoUrl,
  });
}

export function buildEducationalOrganizationJsonLd(
  school: SchoolSeoInput,
): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const boardLabel = BOARD_LABEL[school.board] ?? school.board;

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: school.name,
    url: `${siteUrl}/schools/${school.slug}`,
    description:
      school.description ||
      `${school.name} — ${boardLabel} school in ${school.city}`,
    image: school.logoUrl ?? undefined,
    telephone: school.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: school.address,
      addressLocality: school.city,
      addressRegion: school.state,
      postalCode: school.pincode ?? undefined,
      addressCountry: "IN",
    },
    ...(school.website ? { sameAs: [school.website] } : {}),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function buildWebsiteJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/schools?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}