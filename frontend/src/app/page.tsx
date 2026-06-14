import { Suspense } from "react";
import JsonLd from "@/components/shared/seo/JsonLd";
import HomeHero from "@/components/public/home/HomeHero";
import HomeStats from "@/components/public/home/HomeStats";
import FeaturedSchools from "@/components/public/home/FeaturedSchools";
import FeaturedSchoolsSkeleton from "@/components/public/home/FeaturedSchoolsSkeleton";
import { buildPageMetadata, buildWebsiteJsonLd } from "@/lib/seo/seo";

export const metadata = buildPageMetadata({
  title: "SchoolFinder — Find the Best Schools Near You",
  description:
    "Discover and compare CBSE, ICSE, and state board schools across India. Browse verified listings, view fees, and send inquiries to schools near you.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <JsonLd data={buildWebsiteJsonLd()} />
      <HomeHero />
      <HomeStats />
      <Suspense fallback={<FeaturedSchoolsSkeleton />}>
        <FeaturedSchools />
      </Suspense>
    </div>
  );
}
