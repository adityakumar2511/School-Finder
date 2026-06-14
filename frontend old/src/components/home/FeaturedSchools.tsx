import Link from "next/link";
import { BookOpen } from "lucide-react";
import SchoolCard from "@/components/SchoolCard";
import { fetchFeaturedSchools } from "@/lib/data/schools-public";

export default async function FeaturedSchools() {
  const featuredSchools = await fetchFeaturedSchools(6);

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      aria-labelledby="featured-schools-heading"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            id="featured-schools-heading"
            className="font-heading font-bold text-3xl text-blue-800 tracking-tight"
          >
            Featured schools
          </h2>
          <p className="font-body text-gray-400 text-sm mt-1">
            Top verified schools on SchoolFinder
          </p>
        </div>
        <Link
          href="/schools"
          className="font-heading font-semibold text-sm text-blue-600 hover:text-blue-800 transition-colors hidden sm:block"
        >
          View all schools
        </Link>
      </div>

      {featuredSchools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSchools.map((school) => (
            <SchoolCard key={school.id} {...school} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 font-body">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" aria-hidden />
          <p>No featured schools available yet.</p>
        </div>
      )}

      <div className="text-center mt-10 sm:hidden">
        <Link
          href="/schools"
          className="font-heading font-semibold text-sm text-blue-600 hover:underline"
        >
          View all schools
        </Link>
      </div>
    </section>
  );
}
