import { Suspense } from "react";
import type { Metadata } from "next";
import SchoolCard from "@/components/public/schools/SchoolCard";
import SchoolFilters from "@/components/public/schools/SchoolFilters";
import SchoolGridSkeleton from "@/components/public/schools/SchoolGridSkeleton";
import { GraduationCap, ServerOff } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/seo";
import { fetchSchoolList, fetchCities } from "@/lib/data/schools-public";

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: {
    search?: string;
    city?: string;
    board?: string | string[];
    schoolType?: string | string[];
    medium?: string | string[];
    stateBoardName?: string;
    schoolCategory?: string;
    page?: string;
  };
}

// Human-readable label for board values (for chips in header)
const BOARD_CHIP_LABELS: Record<string, string> = {
  CBSE:        "CBSE",
  ICSE:        "ICSE",
  IB:          "IB",
  IGCSE:       "IGCSE",
  NIOS:        "NIOS",
  STATE_BOARD: "State Board",
  OTHER:       "Other",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Always returns string[] regardless of whether Next gives string or string[] */
function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

/** Build a URL preserving all current params, replacing `page` */
function buildPageUrl(
  searchParams: PageProps["searchParams"],
  page: number,
): string {
  const p = new URLSearchParams();
  if (searchParams.search) p.set("search", searchParams.search);
  if (searchParams.city)   p.set("city",   searchParams.city);
  toArray(searchParams.board).forEach((b)      => p.append("board",      b));
  toArray(searchParams.schoolType).forEach((t) => p.append("schoolType", t));
  toArray(searchParams.medium).forEach((m)     => p.append("medium",     m));
  if (searchParams.stateBoardName) p.set("stateBoardName", searchParams.stateBoardName);
  if (searchParams.schoolCategory) p.set("schoolCategory", searchParams.schoolCategory);
  p.set("page", String(page));
  return `/schools?${p.toString()}`;
}

/** Remove one param value from URL */
function removeParam(
  searchParams: PageProps["searchParams"],
  key: string,
  removeValue?: string,
): string {
  const p = new URLSearchParams();
  if (searchParams.search && key !== "search") p.set("search", searchParams.search);
  if (searchParams.city   && key !== "city")   p.set("city",   searchParams.city);
  if (searchParams.stateBoardName && key !== "stateBoardName")
    p.set("stateBoardName", searchParams.stateBoardName);
  if (searchParams.schoolCategory && key !== "schoolCategory")
    p.set("schoolCategory", searchParams.schoolCategory);

  ["board", "schoolType", "medium"].forEach((param) => {
    toArray(searchParams[param as keyof PageProps["searchParams"]] as string | string[])
      .filter((v) => !(param === key && v === removeValue))
      .forEach((v) => p.append(param, v));
  });

  p.delete("page");
  return p.toString() ? `/schools?${p.toString()}` : "/schools";
}

// ─── Pagination ───────────────────────────────────────────────────────────────

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
          href={buildPageUrl(searchParams, currentPage - 1)}
          className="px-4 py-2 rounded-xl border border-gray-100 bg-white font-heading text-btn text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
        >
          Previous
        </a>
      )}
      {pages.map((p) => (
        <a
          key={p}
          href={buildPageUrl(searchParams, p)}
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
          href={buildPageUrl(searchParams, currentPage + 1)}
          className="px-4 py-2 rounded-xl border border-gray-100 bg-white font-heading text-btn text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
        >
          Next
        </a>
      )}
    </nav>
  );
}

// ─── Empty / Error states ─────────────────────────────────────────────────────

function EmptyState({ backendMissing }: { backendMissing: boolean }) {
  if (backendMissing) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-warning-bg flex items-center justify-center mb-4">
          <ServerOff className="w-7 h-7 text-warning-text" />
        </div>
        <h3 className="font-heading text-h3 text-blue-800 mb-2">
          Backend not connected
        </h3>
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
      <h3 className="font-heading text-h3 text-blue-800 mb-2">
        No schools found
      </h3>
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

// ─── School Grid (async) ──────────────────────────────────────────────────────

async function SchoolGrid({ searchParams }: PageProps) {
  const currentPage    = Number(searchParams.page ?? "1");
  const backendMissing = !process.env.NEXT_PUBLIC_API_URL;

  // Normalize params for fetchSchoolList — board/schoolType/medium as arrays
  const fetchParams: Record<string, string | string[] | undefined> = {
    search:         searchParams.search,
    city:           searchParams.city,
    board:          toArray(searchParams.board),
    schoolType:     toArray(searchParams.schoolType),
    medium:         toArray(searchParams.medium),
    stateBoardName: searchParams.stateBoardName,
    schoolCategory: searchParams.schoolCategory,
    page:           String(currentPage),
  };

  const { schools, pagination } = await fetchSchoolList(fetchParams);

  const hasFilters =
    searchParams.search ||
    searchParams.city ||
    toArray(searchParams.board).length > 0 ||
    toArray(searchParams.schoolType).length > 0 ||
    toArray(searchParams.medium).length > 0 ||
    searchParams.stateBoardName ||
    searchParams.schoolCategory;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
        {schools.length === 0 ? (
          <EmptyState backendMissing={backendMissing} />
        ) : (
          schools.map((school) => (
            <SchoolCard key={school.id} {...school} />
          ))
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

// ─── Active filter chips (in header area) ────────────────────────────────────

function HeaderChips({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const chips: { key: string; val: string; label: string }[] = [];

  if (searchParams.search)
    chips.push({ key: "search", val: searchParams.search, label: `"${searchParams.search}"` });

  if (searchParams.city)
    chips.push({ key: "city", val: searchParams.city, label: searchParams.city });

  toArray(searchParams.board).forEach((b) =>
    chips.push({ key: "board", val: b, label: BOARD_CHIP_LABELS[b] ?? b }),
  );

  toArray(searchParams.schoolType).forEach((t) =>
    chips.push({ key: "schoolType", val: t, label: t === "CO_ED" ? "Co-Ed" : t === "BOYS" ? "Boys" : "Girls" }),
  );

  toArray(searchParams.medium).forEach((m) =>
    chips.push({
      key: "medium",
      val: m,
      label: m === "HINDI" ? "Hindi" : m === "ENGLISH" ? "English" : m === "BOTH" ? "Hindi+English" : "Other",
    }),
  );

  if (searchParams.stateBoardName)
    chips.push({ key: "stateBoardName", val: searchParams.stateBoardName, label: searchParams.stateBoardName });

  if (searchParams.schoolCategory)
    chips.push({ key: "schoolCategory", val: searchParams.schoolCategory, label: searchParams.schoolCategory });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {chips.map(({ key, val, label }) => (
        <a
          key={`${key}-${val}`}
          href={removeParam(searchParams, key, val)}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 font-body text-label text-blue-700 hover:bg-blue-100 transition-colors"
        >
          {label}
          <span aria-hidden className="ml-0.5 text-blue-400">✕</span>
        </a>
      ))}
      <a
        href="/schools"
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 font-body text-label text-gray-500 hover:bg-gray-200 transition-colors"
      >
        Clear all
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SchoolsPage({ searchParams }: PageProps) {
  const cities = await fetchCities();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar */}
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

          {/* Grid */}
          <section className="flex-1 min-w-0">
            <HeaderChips searchParams={searchParams} />

            <Suspense fallback={<SchoolGridSkeleton count={12} />}>
              <SchoolGrid searchParams={searchParams} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}