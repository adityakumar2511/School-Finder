import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SchoolCard from "@/components/public/schools/SchoolCard";
import SchoolGridSkeleton from "@/components/public/schools/SchoolGridSkeleton";
import { GraduationCap } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/seo";
import {
  fetchSchoolsByCity,
  fetchAllCities,
} from "@/lib/data/schools-public";

interface PageProps {
  params: { city: string };
  searchParams: { page?: string };
}

export async function generateStaticParams() {
  const cities = await fetchAllCities();
  return cities.map((city) => ({ city: encodeURIComponent(city) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = decodeURIComponent(params.city);
  return buildPageMetadata({
    title: `Schools in ${city} — CBSE, ICSE & State Board`,
    description: `Browse verified CBSE, ICSE, and state board schools in ${city}. Compare fees, facilities, and admission details.`,
    path: `/schools/city/${params.city}`,
    keywords: [
      `schools in ${city}`,
      `${city} CBSE schools`,
      `${city} ICSE schools`,
      `best schools ${city}`,
    ],
  });
}

function Pagination({
  currentPage,
  totalPages,
  city,
}: {
  currentPage: number;
  totalPages: number;
  city: string;
}) {
  if (totalPages <= 1) return null;

  const maxVisible = 7;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
      {currentPage > 1 && (
        <a
          href={`/schools/city/${city}?page=${currentPage - 1}`}
          className="px-4 py-2 rounded-xl border border-gray-100 bg-white font-heading text-btn text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
        >
          Previous
        </a>
      )}
      {pages.map((p) => (
        <a
          key={p}
          href={`/schools/city/${city}?page=${p}`}
          aria-current={p === currentPage ? "page" : undefined}
          className={`w-10 h-10 flex items-center justify-center rounded-xl font-heading text-btn transition-all duration-200 ${
            p === currentPage
              ? "bg-blue-600 text-white shadow-btn"
              : "border border-gray-100 bg-white text-gray-800 hover:bg-blue-50 hover:border-blue-200"
          }`}
        >
          {p}
        </a>
      ))}
      {currentPage < totalPages && (
        <a
          href={`/schools/city/${city}?page=${currentPage + 1}`}
          className="px-4 py-2 rounded-xl border border-gray-100 bg-white font-heading text-btn text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
        >
          Next
        </a>
      )}
    </nav>
  );
}

async function SchoolGrid({ city, page }: { city: string; page: number }) {
  const { schools, pagination } = await fetchSchoolsByCity(city, page);

  if (schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <GraduationCap className="w-7 h-7 text-blue-400" />
        </div>
        <h2 className="font-heading text-h3 text-blue-800 mb-2">No schools found</h2>
        <p className="font-body text-body text-gray-400 max-w-sm">
          No approved schools found in {city} yet.
        </p>
        <a
          href="/schools"
          className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-heading text-btn hover:bg-blue-700 transition-colors shadow-btn"
        >
          Browse all schools
        </a>
      </div>
    );
  }

  return (
    <>
      <p className="font-body text-label text-gray-400 mb-5">
        <span className="text-blue-800 font-heading font-semibold">
          {pagination.total}
        </span>{" "}
        schools in {city}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {schools.map((school) => (
          <SchoolCard key={school.id} {...school} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        city={encodeURIComponent(city)}
      />
    </>
  );
}

export default async function CityPage({ params, searchParams }: PageProps) {
  const city = decodeURIComponent(params.city);
  const page = Number(searchParams.page ?? "1");

  if (!city) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-800 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-label text-blue-300 mb-1">
            <a href="/schools" className="hover:text-white transition-colors">
              All schools
            </a>{" "}
            / City
          </p>
          <h1 className="font-heading text-h1 text-white mb-2">
            Schools in {city}
          </h1>
          <p className="font-body text-body text-blue-200">
            Verified CBSE, ICSE, and state board schools in {city}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<SchoolGridSkeleton count={12} />}>
          <SchoolGrid city={city} page={page} />
        </Suspense>
      </div>
    </main>
  );
}