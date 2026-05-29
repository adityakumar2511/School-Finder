"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { InquiryStatus } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_TABS: Array<{ value: InquiryStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CLOSED", label: "Closed" },
];

type Props = {
  currentStatus?: InquiryStatus;
  currentSearch?: string;
  basePath?: string;
};

export default function InquiryFilters({
  currentStatus,
  currentSearch = "",
  basePath = "/dashboard/school/inquiries",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);
  const [pending, startTransition] = useTransition();

  const activeTab = currentStatus ?? "ALL";

  function buildHref(status: InquiryStatus | "ALL", q?: string) {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (q?.trim()) params.set("q", q.trim());
    params.delete("page");
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      router.push(buildHref(activeTab === "ALL" ? "ALL" : activeTab, search));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {STATUS_TABS.map((tab) => {
          const href = buildHref(tab.value, currentSearch);
          const isActive = activeTab === tab.value;
          return (
            <Link
              key={tab.value}
              href={href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-heading font-semibold transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <form onSubmit={applySearch} className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Search by parent name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-md"
        />
        <Button type="submit" disabled={pending}>
          Search
        </Button>
        {(currentSearch || searchParams.get("q")) && (
          <Button type="button" variant="outline" asChild>
            <Link href={buildHref(activeTab === "ALL" ? "ALL" : activeTab)}>Clear</Link>
          </Button>
        )}
      </form>
    </div>
  );
}
