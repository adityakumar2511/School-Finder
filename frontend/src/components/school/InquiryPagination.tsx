import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
};

function buildPageHref(
  basePath: string,
  page: number,
  searchParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function InquiryPagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1 pt-6" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={buildPageHref(basePath, page - 1, searchParams)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-heading font-semibold text-gray-600 hover:bg-gray-50"
        >
          Previous
        </Link>
      )}
      {pages.map((p, index) => {
        const prev = pages[index - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-2 text-gray-400">…</span>}
            <Link
              href={buildPageHref(basePath, p, searchParams)}
              className={cn(
                "min-w-[2.25rem] rounded-lg px-3 py-2 text-center text-sm font-heading font-semibold",
                p === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}
      {page < totalPages && (
        <Link
          href={buildPageHref(basePath, page + 1, searchParams)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-heading font-semibold text-gray-600 hover:bg-gray-50"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
