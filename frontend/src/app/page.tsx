import { Suspense } from "react";
import JsonLd from "@/components/shared/seo/JsonLd";
import HomeHero from "@/components/public/home/HomeHero";
import HomeSearch from "@/components/public/home/HomeSearch";
import HomeStats from "@/components/public/home/HomeStats";
import HomeBrowse from "@/components/public/home/HomeBrowse";
import FeaturedSchools from "@/components/public/home/FeaturedSchools";
import FeaturedSchoolsSkeleton from "@/components/public/home/FeaturedSchoolsSkeleton";
import HomeWhyLakshya from "@/components/public/home/HomeWhyLakshya";
import HomeHowItWorks from "@/components/public/home/HomeHowItWorks";
import HomePlatformPreview from "@/components/public/home/HomePlatformPreview";
import HomeAvailableCity from "@/components/public/home/HomeAvailableCity";
import HomeParentsSection from "@/components/public/home/HomeParentsSection";
import HomeSchoolsSection from "@/components/public/home/HomeSchoolsSection";
import HomeTestimonials from "@/components/public/home/HomeTestimonials";
import HomeFAQ from "@/components/public/home/HomeFAQ";
import HomeBlogPreview from "@/components/public/home/HomeBlogPreview";
import HomeFinalCTA from "@/components/public/home/HomeFinalCTA";
import { buildPageMetadata, buildWebsiteJsonLd } from "@/lib/seo/seo";

export const metadata = buildPageMetadata({
  title: "Lakshya One — Find and Compare Schools Near You",
  description:
    "Lakshya One helps parents discover and compare schools in one place while helping schools build a professional digital presence and connect with more families.",
  path: "/",
});

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <JsonLd data={buildWebsiteJsonLd()} />

      <HomeHero />
      {/* <HomeSearch /> */}
      <HomeBrowse />
      <HomeStats />
      

      <Suspense fallback={<FeaturedSchoolsSkeleton />}>
        <FeaturedSchools />
      </Suspense>

      <HomeWhyLakshya />
      <HomeHowItWorks />
      <HomePlatformPreview />
      <HomeAvailableCity />
      <HomeParentsSection />
      <HomeSchoolsSection />
      <HomeTestimonials />
      <HomeFAQ />
      <HomeBlogPreview />
      <HomeFinalCTA />
    </main>
  );
}