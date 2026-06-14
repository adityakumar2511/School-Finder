import { Suspense } from "react";
import Link from "next/link";
import type { SchoolStatus } from "@/lib/types/database";
import {
  getAdminSchoolsList,
  getAdminSchoolStates,
  getAdminSchoolCities,
} from "@/lib/admin/data";
import AdminSearchBar from "@/components/admin/search-pagination/AdminSearchBar";
import AdminPagination from "@/components/admin/search-pagination/AdminPagination";
import SchoolStatusBadge from "@/components/admin/moderation/SchoolStatusBadge";
import SchoolModerationActions from "@/components/admin/moderation/SchoolModerationActions";
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
import { cn } from "@/lib/utils";

const TABS: Array<{ label: string; value?: SchoolStatus }> = [
  { label: "All" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const PAGE_SIZE = 10;

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
  state?: string;
  city?: string;
}>;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function SchoolsTable({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const statusParam = params.status?.toUpperCase();
  const status =
    statusParam && ["PENDING", "APPROVED", "REJECTED"].includes(statusParam)
      ? (statusParam as SchoolStatus)
      : undefined;
  const search = params.q?.trim();
  const state = params.state?.trim();
  const city = params.city?.trim();

  const result = await getAdminSchoolsList({
    page,
    limit: PAGE_SIZE,
    status,
    search,
    state,
    city,
  });

  const filterParams = {
    status: status ?? undefined,
    q: search ?? undefined,
    state: state ?? undefined,
    city: city ?? undefined,
  };

  return (
    <>
      <p className="mb-4 font-body text-sm text-gray-500">
        {result.total} school{result.total === 1 ? "" : "s"} found
      </p>
      <Card>
        <CardContent className="p-0">
          {result.schools.length === 0 ? (
            <p className="py-12 text-center font-body text-sm text-gray-500">
              No schools match your filters.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Board</TableHead>
                  <TableHead>Owner email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                      <Link
                        href={`/schools/${school.slug}`}
                        className="font-heading font-semibold text-blue-800 hover:underline"
                      >
                        {school.name}
                      </Link>
                    </TableCell>
                    <TableCell>{school.city}</TableCell>
                    <TableCell>{school.board.replace("_", " ")}</TableCell>
                    <TableCell>{school.owner.email}</TableCell>
                    <TableCell>
                      <SchoolStatusBadge status={school.status} />
                    </TableCell>
                    <TableCell>{formatDate(school.createdAt)}</TableCell>
                    <TableCell>
                      <SchoolModerationActions
                        school={school}
                        currentStatus={school.status}
                      />
                    </TableCell>
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
        basePath="/admin/schools"
        searchParams={filterParams}
      />
    </>
  );
}

function TableSkeleton() {
  return <Skeleton className="h-64 w-full" />;
}

async function LocationFilterBar({
  basePath,
  currentQuery,
  currentState,
  currentCity,
}: {
  basePath: string;
  currentQuery: string;
  currentState: string;
  currentCity: string;
}) {
  const [states, cities] = await Promise.all([
    getAdminSchoolStates(),
    getAdminSchoolCities(currentState || undefined),
  ]);

  return (
    <AdminSearchBar
      basePath={basePath}
      currentQuery={currentQuery}
      placeholder="Search by school name, city, or owner email"
      states={states}
      cities={cities}
      currentState={currentState}
      currentCity={currentCity}
    />
  );
}

export default async function AdminSchoolsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeStatus = params.status?.toUpperCase();
  const currentState = params.state?.trim() ?? "";
  const currentCity = params.city?.trim() ?? "";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-blue-800">
          Schools management
        </h1>
        <p className="mt-1 font-body text-sm text-gray-500">
          Search, filter, and moderate school listings.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const href = tab.value
            ? `/admin/schools?status=${tab.value}`
            : "/admin/schools";
          const isActive =
            (!tab.value && !activeStatus) || activeStatus === tab.value;
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-heading font-semibold",
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Suspense fallback={<Skeleton className="mb-4 h-20 w-full max-w-sm" />}>
        <div className="mb-6">
          <LocationFilterBar
            basePath="/admin/schools"
            currentQuery={params.q ?? ""}
            currentState={currentState}
            currentCity={currentCity}
          />
        </div>
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <SchoolsTable searchParams={searchParams} />
      </Suspense>
    </main>
  );
}