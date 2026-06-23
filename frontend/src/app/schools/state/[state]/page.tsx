import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SchoolCard from "@/components/public/schools/SchoolCard";
import SchoolGridSkeleton from "@/components/public/schools/SchoolGridSkeleton";
import { GraduationCap } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/seo";
import { fetchSchoolsByState } from "@/lib/data/schools-public";

// Indian states + UTs list for generateStaticParams
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

interface PageProps {
  params: { state: string };
  searchParams: { page?: string };
}

export function generateStaticParams() {
  return INDIAN_STATES.map((state) => ({
    state: encodeURIComponent(state),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const state = decodeURIComponent(params.state);
  return buildPageMetadata({
    title: `Schools in ${state} — CBSE, ICSE & State Board`,
    description: `Find verified CBSE, ICSE, and state board schools across ${state}. Compare fees, facilities, and admissions.`,
    path: `/schools/state/${params.state}`,
    keywords: [
      `schools in ${state}`,
      `${state} schools`,
      `best schools in ${state}`,
      `CBSE schools ${state}`,
    ],
  });
}

function Pagination({
  currentPage,
  totalPages,
  state,
}: {
  currentPage: number;
  totalPages: number;
  state: string;
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
          href={`/schools/state/${state}?page=${currentPage - 1}`}
          className="px-4 py-2 rounded-xl border border-gray-100 bg-white font-heading text-btn text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
        >
          Previous
        </a>
      )}
      {pages.map((p) => (
        <a
          key={p}
          href={`/schools/state/${state}?page=${p}`}
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
          href={`/schools/state/${state}?page=${currentPage + 1}`}
          className="px-4 py-2 rounded-xl border border-gray-100 bg-white font-heading text-btn text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
        >
          Next
        </a>
      )}
    </nav>
  );
}

async function SchoolGrid({ state, page }: { state: string; page: number }) {
  const { schools, pagination } = await fetchSchoolsByState(state, page);

  if (schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <GraduationCap className="w-7 h-7 text-blue-400" />
        </div>
        <h2 className="font-heading text-h3 text-blue-800 mb-2">No schools found</h2>
        <p className="font-body text-body text-gray-400 max-w-sm">
          No approved schools found in {state} yet.
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
        schools in {state}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {schools.map((school) => (
          <SchoolCard key={school.id} {...school} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        state={encodeURIComponent(state)}
      />
    </>
  );
}

export default async function StatePage({ params, searchParams }: PageProps) {
  const state = decodeURIComponent(params.state);
  const page = Number(searchParams.page ?? "1");

  if (!state) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-800 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-label text-blue-300 mb-1">
            <a href="/schools" className="hover:text-white transition-colors">
              All schools
            </a>{" "}
            / State
          </p>
          <h1 className="font-heading text-h1 text-white mb-2">
            Schools in {state}
          </h1>
          <p className="font-body text-body text-blue-200">
            Verified schools across {state} — CBSE, ICSE, and state boards
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<SchoolGridSkeleton count={12} />}>
          <SchoolGrid state={state} page={page} />
        </Suspense>
      </div>
    </main>
  );
}