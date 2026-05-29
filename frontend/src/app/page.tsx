import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import HomeHero from "@/components/home/HomeHero";
import HomeStats from "@/components/home/HomeStats";
import FeaturedSchools from "@/components/home/FeaturedSchools";
import FeaturedSchoolsSkeleton from "@/components/home/FeaturedSchoolsSkeleton";
import { buildPageMetadata, buildWebsiteJsonLd } from "@/lib/seo";

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
