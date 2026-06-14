import { Suspense } from "react";
import type { InquiryStatus } from "@/lib/types/database";
import { getOwnedSchool, getSchoolInquiriesList } from "@/lib/school/data";
import InquiryFilters from "@/components/school/InquiryFilters";
import InquiryStatusBadge from "@/components/school/InquiryStatusBadge";
import InquiryStatusSelect from "@/components/school/InquiryStatusSelect";
import InquiryPagination from "@/components/school/InquiryPagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

const PAGE_SIZE = 10;
const VALID_STATUSES: InquiryStatus[] = ["NEW", "CONTACTED", "CLOSED"];

type SearchParams = Promise<{
  page?: string;
  status?: string;
  q?: string;
}>;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function InquiriesContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const statusParam = params.status;
  const status =
    statusParam && VALID_STATUSES.includes(statusParam as InquiryStatus)
      ? (statusParam as InquiryStatus)
      : undefined;
  const search = params.q?.trim();

  const school = await getOwnedSchool();

  if (!school) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
        <p className="mt-3 font-body text-gray-500">No school profile found.</p>
        <Link
          href="/school-register"
          className="mt-4 inline-block text-sm font-heading font-semibold text-blue-600"
        >
          Register your school
        </Link>
      </div>
    );
  }

  const result = await getSchoolInquiriesList(school.id, {
    page,
    limit: PAGE_SIZE,
    status,
    search,
  });

  const filterParams = {
    status: status ?? undefined,
    q: search ?? undefined,
  };

  return (
    <>
      <InquiryFilters currentStatus={status} currentSearch={search ?? ""} />

      <p className="mt-4 font-body text-sm text-gray-500">
        Showing {result.inquiries.length} of {result.total} inquiries
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading font-bold text-lg text-blue-800">
            All inquiries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.inquiries.length === 0 ? (
            <p className="py-10 text-center font-body text-sm text-gray-500">
              No inquiries match your filters.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Update</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-heading font-semibold text-blue-900">
                      {inquiry.parent.name ?? "Anonymous"}
                    </TableCell>
                    <TableCell>{inquiry.parent.email}</TableCell>
                    <TableCell className="max-w-sm">
                      <p className="line-clamp-2">{inquiry.message}</p>
                    </TableCell>
                    <TableCell>
                      <InquiryStatusBadge status={inquiry.status} />
                    </TableCell>
                    <TableCell>
                      <InquiryStatusSelect
                        inquiryId={inquiry.id}
                        currentStatus={inquiry.status}
                      />
                    </TableCell>
                    <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <InquiryPagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/dashboard/school/inquiries"
            searchParams={filterParams}
          />
        </CardContent>
      </Card>
    </>
  );
}

function InquiriesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function SchoolInquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-blue-800">
          Inquiry management
        </h1>
        <p className="mt-1 font-body text-sm text-gray-500">
          Review parent messages and update inquiry status.
        </p>
      </div>

      <Suspense fallback={<InquiriesLoading />}>
        <InquiriesContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
