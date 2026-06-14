import { Suspense } from "react";
import Link from "next/link";
import type { InquiryStatus } from "@/lib/types/database";
import { getAdminInquiriesList } from "@/lib/admin/data";
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
}>;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function InquiriesTable({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const statusParam = params.status?.toUpperCase();
  const status =
    statusParam && ["NEW", "CONTACTED", "CLOSED"].includes(statusParam)
      ? (statusParam as InquiryStatus)
      : undefined;
  const search = params.q?.trim();

  const result = await getAdminInquiriesList({
    page,
    limit: PAGE_SIZE,
    status,
    search,
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
                      <Link
                        href={`/admin/schools`}
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
                      <p className="line-clamp-2 font-body text-sm">{inquiry.message}</p>
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
        }}
      />
    </>
  );
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeStatus = params.status?.toUpperCase();

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

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const href = tab.value
            ? `/admin/inquiries?status=${tab.value}`
            : "/admin/inquiries";
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
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Suspense fallback={<Skeleton className="mb-4 h-10 w-full max-w-sm" />}>
        <div className="mb-6">
          <AdminSearchBar
            basePath="/admin/inquiries"
            currentQuery={params.q ?? ""}
            placeholder="Search school, parent, or message"
          />
        </div>
      </Suspense>

      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <InquiriesTable searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
