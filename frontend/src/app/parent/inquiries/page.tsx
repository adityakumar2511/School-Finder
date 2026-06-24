import Link from "next/link";
import Image from "next/image";
import type { InquiryStatus } from "@/lib/types/database";
import { ChevronLeft, ChevronRight, MessageSquare, BookOpen, ArrowRight } from "lucide-react";
import { getAdminApiBase } from "@/lib/auth/admin-auth";
import { getBackendToken } from "@/lib/api/server";
import { Button } from "@/components/shared/ui/button";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<InquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

const STATUS_BADGE_CLASS: Record<InquiryStatus, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-purple-50 text-purple-700 border-purple-200",
  INTERESTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONVERTED: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
};

type MyInquiry = {
  id: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  school: {
    name: string;
    city: string;
    logoUrl: string | null;
  };
};

type MyInquiriesResponse = {
  data: MyInquiry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type Props = {
  searchParams: { page?: string };
};

async function fetchMyInquiries(
  page: number
): Promise<MyInquiriesResponse | null> {
  const token = await getBackendToken();
  if (!token) return null;

  const apiBase = getAdminApiBase();
  const response = await fetch(
    `${apiBase}/api/inquiries/my?page=${page}&limit=${PAGE_SIZE}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) return null;

  return response.json() as Promise<MyInquiriesResponse>;
}

function formatSentDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function messagePreview(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length <= 80) return trimmed;
  return `${trimmed.slice(0, 80)}…`;
}

export default async function ParentInquiriesPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const result = await fetchMyInquiries(page);

  const inquiries = result?.data ?? [];
  const pagination = result?.pagination ?? {
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  };
  const currentPage = Math.min(page, pagination.totalPages);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="font-heading text-h1 font-bold text-blue-800">My Inquiries</h1>
        </div>
        <p className="font-body text-body text-gray-500 ml-[52px]">
          {pagination.total > 0
            ? `${pagination.total} inquiry${pagination.total !== 1 ? "ies" : ""} sent to schools`
            : "Track messages you have sent to schools"}
        </p>
      </div>

      {!result ? (
        <div className="rounded-xl border border-danger-text/20 bg-danger-bg px-4 py-3">
          <p className="font-body text-body text-danger-text">
            Unable to load your inquiries. Please try again later.
          </p>
        </div>
      ) : inquiries.length > 0 ? (
        <>
          <ul className="space-y-4">
            {inquiries.map((inquiry) => (
              <li
                key={inquiry.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {inquiry.school.logoUrl ? (
                        <Image
                          src={inquiry.school.logoUrl}
                          alt=""
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="font-heading text-h3 font-semibold text-blue-800 truncate">
                          {inquiry.school.name}
                        </h2>
                        <span className={STATUS_BADGE_CLASS[inquiry.status]}>
                          {STATUS_LABEL[inquiry.status]}
                        </span>
                      </div>
                      <p className="font-body text-meta text-gray-500">{inquiry.school.city}</p>
                      <p className="font-body text-body text-gray-700 mt-3">
                        {messagePreview(inquiry.message)}
                      </p>
                      <p className="font-body text-meta text-gray-400 mt-2">
                        Sent {formatSentDate(inquiry.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Link href={`/parent/inquiries?page=${currentPage - 1}`}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Link>
              </Button>
              <span className="font-body text-sm text-gray-600">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={currentPage >= pagination.totalPages}
                className={
                  currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : ""
                }
              >
                <Link href={`/parent/inquiries?page=${currentPage + 1}`}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
            <MessageSquare className="w-9 h-9 text-blue-200" />
          </div>
          <h2 className="font-heading text-h3 font-semibold text-gray-700 mb-2">
            You haven&apos;t sent any inquiries yet.
          </h2>
          <p className="font-body text-body text-gray-500 max-w-md mb-8">
            Browse schools and use the inquiry form on a school profile to contact them directly.
          </p>
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold text-btn px-6 py-3 rounded-xl shadow-btn transition-colors"
          >
            Browse schools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </main>
  );
}
