import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import SchoolCard from "@/components/public/schools/SchoolCard";
import { fetchFeaturedSchools } from "@/lib/data/schools-public";

export default async function FeaturedSchools() {
  const featuredSchools = await fetchFeaturedSchools(6);

  return (
    <section
      className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="featured-schools-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
              Featured Schools
            </p>
            <h2
              id="featured-schools-heading"
              className="mt-2 font-heading text-3xl font-bold text-blue-800 tracking-tight"
            >
              Explore Featured Schools
            </h2>
            <p className="mt-3 font-body text-gray-500">
              Discover schools that have created detailed profiles on Lakshya
              One. Explore academics, facilities, admission details, campus
              photos, contact information, and more—all in one place.
            </p>
          </div>

          <Link href="/schools" className="btn-secondary">
            Explore All Schools
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>

        {featuredSchools.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSchools.map((school) => (
              <SchoolCard key={school.id} {...school} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white py-16 text-center text-gray-400">
            <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" aria-hidden />
            <p className="font-body">No featured schools available yet.</p>
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link href="/schools" className="btn-secondary">
            Explore All Schools
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}