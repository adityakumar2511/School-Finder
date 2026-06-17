import { Suspense } from "react";
import Link from "next/link";
import type { InquiryStatus } from "@/lib/types/database";
import { getAdminInquiriesList, getAdminSchoolById } from "@/lib/admin/data";
import AdminSearchBar from "@/components/admin/search-pagination/AdminSearchBar";
import AdminPagination from "@/components/admin/search-pagination/AdminPagination";
import InquiryStatusBadge from "@/components/school/inquiries/InquiryStatusBadge";
import { Card, CardContent } from "@/components/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const STATUS_TABS: Array<{ label: string; value?: InquiryStatus }> = [
  { label: "All" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Closed", value: "CLOSED" },
];

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
  schoolId?: string;
}>;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Per-school active filter chip ─────────────────────────────────────────────
async function SchoolFilterChip({
  schoolId,
  currentParams,
}: {
  schoolId: string;
  currentParams: Record<string, string | undefined>;
}) {
  // Fetch school directly by id — no limit issue
  const school = await getAdminSchoolById(schoolId);
  const schoolName =
    school && typeof school.name === "string" ? school.name : "Selected school";

  // Clear link — remove schoolId but keep other params
  const clearParams = new URLSearchParams();
  if (currentParams.status) clearParams.set("status", currentParams.status);
  if (currentParams.q) clearParams.set("q", currentParams.q);
  const clearHref = `/admin/inquiries${clearParams.toString() ? `?${clearParams.toString()}` : ""}`;

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="font-body text-sm text-gray-500">Filtered by school:</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 font-body text-sm text-blue-700">
        {schoolName}
        <Link
          href={clearHref}
          className="ml-1 rounded-full hover:bg-blue-100 p-0.5 transition-colors"
          title="Clear filter"
        >
          <X className="h-3.5 w-3.5" />
        </Link>
      </span>
    </div>
  );
}

// ── Inquiries table ───────────────────────────────────────────────────────────
async function InquiriesTable({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const statusParam = params.status?.toUpperCase();
  const status =
    statusParam && ["NEW", "CONTACTED", "CLOSED"].includes(statusParam)
      ? (statusParam as InquiryStatus)
      : undefined;
  const search = params.q?.trim();
  const schoolId = params.schoolId?.trim();

  const result = await getAdminInquiriesList({
    page,
    limit: PAGE_SIZE,
    status,
    search,
    schoolId,
  });

  return (
    <>
      <p className="mb-4 font-body text-sm text-gray-500">
        {result.total} inquir{result.total === 1 ? "y" : "ies"} found
      </p>
      <Card>
        <CardContent className="p-0">
          {result.inquiries.length === 0 ? (
            <p className="py-12 text-center font-body text-sm text-gray-500">
              No inquiries match your filters.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      {/* Clicking school name filters inquiries by that school */}
                      <Link
                        href={`/admin/inquiries?schoolId=${inquiry.school.id}`}
                        className="font-heading font-semibold text-blue-800 hover:underline"
                      >
                        {inquiry.school.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-heading font-semibold text-sm">
                        {inquiry.parent.name ?? "Anonymous"}
                      </p>
                      <p className="font-body text-xs text-gray-500">
                        {inquiry.parent.email}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 font-body text-sm">
                        {inquiry.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      <InquiryStatusBadge status={inquiry.status} />
                    </TableCell>
                    <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <AdminPagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/inquiries"
        searchParams={{
          status: status ?? undefined,
          q: search ?? undefined,
          schoolId: schoolId ?? undefined,
        }}
      />
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeStatus = params.status?.toUpperCase();
  const schoolId = params.schoolId?.trim();

  // Build status tab hrefs — preserve schoolId if active
  function statusTabHref(value?: InquiryStatus) {
    const p = new URLSearchParams();
    if (value) p.set("status", value);
    if (schoolId) p.set("schoolId", schoolId);
    return `/admin/inquiries${p.toString() ? `?${p.toString()}` : ""}`;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-blue-800">
          Inquiries monitoring
        </h1>
        <p className="mt-1 font-body text-sm text-gray-500">
          View parent inquiries across all schools on the platform.
        </p>
      </div>

      {/* Status tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive =
            (!tab.value && !activeStatus) || activeStatus === tab.value;
          return (
            <Link
              key={tab.label}
              href={statusTabHref(tab.value)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-heading font-semibold",
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Active school filter chip */}
      {schoolId && (
        <Suspense fallback={<Skeleton className="mb-4 h-8 w-48" />}>
          <SchoolFilterChip
            schoolId={schoolId}
            currentParams={{
              status: activeStatus,
              q: params.q,
            }}
          />
        </Suspense>
      )}

      {/* Search bar */}
      <Suspense fallback={<Skeleton className="mb-4 h-10 w-full max-w-sm" />}>
        <div className="mb-6">
          <AdminSearchBar
            basePath="/admin/inquiries"
            currentQuery={params.q ?? ""}
            placeholder="Search school, parent, or message"
          />
        </div>
      </Suspense>

      {/* Table */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <InquiriesTable searchParams={searchParams} />
      </Suspense>
    </main>
  );
}