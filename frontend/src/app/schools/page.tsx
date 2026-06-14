import { Suspense } from "react";
import type { Metadata } from "next";
import SchoolCard from "@/components/public/schools/SchoolCard";
import SchoolFilters from "@/components/public/schools/SchoolFilters";
import SchoolGridSkeleton from "@/components/public/schools/SchoolGridSkeleton";
import { GraduationCap, ServerOff } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/seo";
import { fetchSchoolList, fetchCities  } from "@/lib/data/schools-public";

export const metadata: Metadata = buildPageMetadata({
  title: "Browse Schools — CBSE, ICSE & State Board Listings",
  description:
    "Search and filter schools by city, board, medium, and school type. Compare approved school listings across India on SchoolFinder.",
  path: "/schools",
  keywords: [
    "browse schools",
    "school listings",
    "CBSE schools list",
    "ICSE schools",
    "schools by city",
  ],
});

interface PageProps {
  searchParams: {
    search?: string;
    city?: string;
    board?: string;       
    schoolType?: string;
    medium?: string;
    page?: string;
  };
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: PageProps["searchParams"];
}) {
  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    const p = new URLSearchParams();
    if (searchParams.search) p.set("search", searchParams.search);
    if (searchParams.city) p.set("city", searchParams.city);
    if (searchParams.board) p.set("board", searchParams.board);
    if (searchParams.schoolType) p.set("schoolType", searchParams.schoolType);
    if (searchParams.medium) p.set("medium", searchParams.medium);
    p.set("page", String(page));
    return `/schools?${p.toString()}`;
  }

  const maxVisible = 7;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-10"
      aria-label="School listings pagination"
    >
      {currentPage > 1 && (
        <a
          href={buildUrl(currentPage - 1)}
          className="px-4 py-2 rounded-xl border border-gray-100 bg-white font-heading text-btn text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
        >
          Previous
        </a>
      )}
      {pages.map((p) => (
        <a
          key={p}
          href={buildUrl(p)}
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
          href={buildUrl(currentPage + 1)}
          className="px-4 py-2 rounded-xl border border-gray-100 bg-white font-heading text-btn text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
        >
          Next
        </a>
      )}
    </nav>
  );
}

function EmptyState({ backendMissing }: { backendMissing: boolean }) {
  if (backendMissing) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-warning-bg flex items-center justify-center mb-4">
          <ServerOff className="w-7 h-7 text-warning-text" />
        </div>
        <h3 className="font-heading text-h3 text-blue-800 mb-2">Backend not connected</h3>
        <p className="font-body text-body text-gray-400 max-w-sm">
          Set{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-meta text-blue-600">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          and start the API server to load school listings.
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <GraduationCap className="w-7 h-7 text-blue-400" />
      </div>
      <h3 className="font-heading text-h3 text-blue-800 mb-2">No schools found</h3>
      <p className="font-body text-body text-gray-400 max-w-sm">
        Try changing your filters or clearing your search.
      </p>
      <a
        href="/schools"
        className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-heading text-btn hover:bg-blue-700 transition-colors shadow-btn"
      >
        Clear filters
      </a>
    </div>
  );
}

async function SchoolGrid({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page ?? "1");
  const { schools, pagination } = await fetchSchoolList(searchParams);
  const backendMissing = !process.env.NEXT_PUBLIC_API_URL;

  const hasFilters =
    searchParams.search ||
    searchParams.city ||
    searchParams.board ||
    searchParams.schoolType ||
    searchParams.medium;

  return (
    <>
      {pagination.total > 0 && (
        <p className="font-body text-label text-gray-400 mb-5">
          <span className="text-blue-800 font-heading font-semibold">
            {pagination.total}
          </span>{" "}
          schools found
          {hasFilters && " matching your filters"}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {schools.length === 0 ? (
          <EmptyState backendMissing={backendMissing} />
        ) : (
          schools.map((school) => <SchoolCard key={school.id} {...school} />)
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        searchParams={searchParams}
      />
    </>
  );
}

export default async function SchoolsPage({ searchParams }: PageProps) {
  const cities = await fetchCities();
  const hasFilters =
    searchParams.search ||
    searchParams.city ||
    searchParams.board ||
    searchParams.schoolType ||
    searchParams.medium;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-800 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-h1 text-white mb-2">Find schools</h1>
          <p className="font-body text-body text-blue-200">
            Discover verified schools across India — CBSE, ICSE, and state boards
          </p>

          <form method="GET" action="/schools" className="mt-5 flex gap-3 max-w-lg">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search ?? ""}
              placeholder="School name or city…"
              className="flex-1 h-11 px-4 rounded-xl border-0 bg-white/10 backdrop-blur text-white placeholder:text-blue-200 font-body text-body focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              className="px-5 h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-800 font-heading text-btn transition-colors shadow-amber"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <Suspense
              fallback={
                <div
                  className="h-64 rounded-2xl bg-white border border-gray-100 animate-pulse"
                  aria-hidden
                />
              }
            >
              <SchoolFilters cities={cities} />
            </Suspense>
          </aside>

          <section className="flex-1 min-w-0">
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {searchParams.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 font-body text-label text-blue-600">
                    &ldquo;{searchParams.search}&rdquo;
                    <a
                      href={`/schools?${new URLSearchParams({ ...searchParams, search: "" }).toString()}`}
                      className="ml-1 hover:text-blue-800"
                      aria-label="Remove search filter"
                    >
                      ✕
                    </a>
                  </span>
                )}
                {searchParams.city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 font-body text-label text-blue-600">
                    {searchParams.city}
                    <a
                      href={`/schools?${new URLSearchParams({ ...searchParams, city: "" }).toString()}`}
                      className="ml-1 hover:text-blue-800"
                      aria-label="Remove city filter"
                    >
                      ✕
                    </a>
                  </span>
                )}
                {searchParams.board && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-info-bg border border-blue-200 font-body text-label text-info-text">
                    {searchParams.board}
                    <a
                      href={`/schools?${new URLSearchParams({ ...searchParams, board: "" }).toString()}`}
                      className="ml-1 hover:text-blue-800"
                      aria-label="Remove board filter"
                    >
                      ✕
                    </a>
                  </span>
                )}
              </div>
            )}

            <Suspense fallback={<SchoolGridSkeleton count={12} />}>
              <SchoolGrid searchParams={searchParams} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
